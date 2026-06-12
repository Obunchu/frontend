import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

type Place = {
  id: number;
  image_id: string;
  place_name: string;
  region: string;
  season: string;
  time: string;
  weather: string;
  scene: string;
  primary_mood: string;
  secondary_mood: string;
  caption: string;
  content_id: number;
  map_lat: number;
  map_lng: number;
  firstimage?: string | null;
  overview?: string | null;
};

export default function KeywordResultScreen() {
  const { mood, region } = useLocalSearchParams<{ mood?: string; region?: string }>();

  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [likedPlaces, setLikedPlaces] = useState<Record<number, boolean>>({});

  // 1. 유저 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      const savedUserId = await SecureStore.getItemAsync("user_id");
      const savedNickname = await SecureStore.getItemAsync("nickname");

      if (savedUserId) setUserId(savedUserId);
      if (savedNickname) setNickname(savedNickname);
    };

    loadUserInfo();
  }, []);

  // 2. 키워드 기반 결과 및 북마크 상태 fetch
  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const encodedMood = encodeURIComponent(mood || "");
      const encodedRegion = encodeURIComponent(region || "");

      const response = await fetch(
        `${API_URL}/detail/search?mood=${encodedMood}&region=${encodedRegion}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        }
      );
      
      if (!response.ok) {
        throw new Error("서버에서 데이터를 가져오지 못했습니다.");
      }

      const data = await response.json();
      
      let placesData: Place[] = [];
      if (data && typeof data === "object") {
        if (Array.isArray(data.results)) {
          placesData = data.results;
        } else if (Array.isArray(data)) {
          placesData = data;
        }
      }
      
      setResults(placesData);

      // 북마크 상태 동기화 (로그인한 경우)
      if (userId && placesData.length > 0) {
        const likedStatus: Record<number, boolean> = {};
        for (const place of placesData) {
          try {
            const res = await fetch(`${API_URL}/bookmarks/check`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: userId,
                content_id: place.content_id,
              }),
            });
            const result = await res.json();
            likedStatus[place.id] = result.is_bookmarked;
          } catch (e) {
            console.error("북마크 개별 체크 실패:", e);
          }
        }
        setLikedPlaces(likedStatus);
      }
    } catch (err: any) {
      console.error("데이터 로드 실패:", err);
      setError(err.message || "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [mood, region, userId]);

  // 3. 화면 포커스 시 북마크 실시간 동기화
  const refreshBookmarks = async () => {
    if (!userId || results.length === 0) return;
    const likedStatus: Record<number, boolean> = {};
    for (const place of results) {
      try {
        const res = await fetch(`${API_URL}/bookmarks/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            content_id: place.content_id,
          }),
        });
        const result = await res.json();
        likedStatus[place.id] = result.is_bookmarked;
      } catch (e) {
        console.error("북마크 리프레시 실패:", e);
      }
    }
    setLikedPlaces(likedStatus);
  };

  useFocusEffect(
    useCallback(() => {
      refreshBookmarks();
      return () => {};
    }, [userId, results])
  );

  // 4. 북마크 토글 함수
  const handleBookmark = async (place: Place) => {
    if (!userId) {
      Alert.alert("안내", "로그인이 필요한 서비스입니다.");
      return;
    }

    const isLiked = likedPlaces[place.id];

    try {
      if (isLiked) {
        await fetch(`${API_URL}/bookmarks/remove`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            content_id: place.content_id,
          }),
        });
      } else {
        await fetch(`${API_URL}/bookmarks/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            content_id: place.content_id,
            place_name: place.place_name,
          }),
        });
      }

      setLikedPlaces((prev) => ({
        ...prev,
        [place.id]: !isLiked,
      }));
    } catch (e) {
      Alert.alert("오류", "북마크 처리에 실패했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity style={styles.searchBox} onPress={() => router.back()}>
            {mood ? (
                mood.split(',').map((singleMood, index) => {
                  const trimmedMood = singleMood.trim();
                  if (!trimmedMood) return null;
                  return (
                    <Text key={index} style={styles.searchText}>
                      #{trimmedMood}
                    </Text>
                  );
                })
              ) : (
                <Text style={styles.searchText}>#키워드</Text>
            )}
            <Ionicons name="search-outline" size={34} color="#6FA8DC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileArea}
            onPress={() => router.push("/setting")}
            activeOpacity={0.75}
          >
            <Ionicons name="person-circle-outline" size={48} color="#263A56" />
            <Text style={styles.profileName}>{nickname || "수정"}님</Text>
          </TouchableOpacity>
        </View>

        {/* 로딩 인디케이터 */}
        {loading && (
          <View>
            <ActivityIndicator size="large" color="#F28C2E" />
            <Text>조건에 맞는 여행지 탐색 중...</Text>
          </View>
        )}

        {/* 결과 리스트 출력 */}
        {!loading && !error && (
          <View style={styles.resultList}>
            {results.length === 0 ? (
              <View>
                <Text>선택하신 조건에 맞는 여행지가 없습니다.</Text>
              </View>
            ) : (
              results.map((place) => (
                <View key={place.id} style={styles.resultCard}>
                  
                  {/* 상단 영역: 이미지 전용 공간 */}
                  <View style={styles.imageArea}>
                    {place.firstimage ? (
                      <Image
                        source={{ 
                          uri: place.firstimage,
                          headers: {
                            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"
                          }
                        }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderIconBox}>
                        <Ionicons name="image-outline" size={48} color="#6FA8DC" />
                        <Text style={styles.placeholderText}>이미지 준비 중</Text>
                      </View>
                    )}

                    {/* 우측 상단 이동 화살표 버튼 */}
                    <TouchableOpacity 
                      style={styles.arrowButton}
                      activeOpacity={0.7}
                      onPress={() => {
                        router.push({
                          pathname: "/detail",
                          params: { content_id: place.content_id }
                        });
                      }}
                    >
                      <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* 좌측 상단 북마크 하트 버튼 */}
                    <TouchableOpacity 
                      style={styles.heartButton}
                      onPress={() => handleBookmark(place)}
                    >
                      <Ionicons 
                        name={likedPlaces[place.id] ? "heart" : "heart-outline"} 
                        size={32} 
                        color={likedPlaces[place.id] ? "#FF4D6D" : "#FFD75E"} 
                      />
                    </TouchableOpacity>
                  </View>

                  {/* 하단 영역: 텍스트 정보창 */}
                  <View style={styles.placeOverlay}>
                    <View style={styles.placeNameRow}>
                      <Ionicons name="location-sharp" size={24} color="#F28C2E" />
                      <Text style={styles.placeName} numberOfLines={1}>{place.place_name}</Text>
                    </View>

                    <View style={styles.addressBox}>
                      <Text style={styles.addressText} numberOfLines={1}>{place.region}</Text>
                    </View>

                    <Text style={styles.moodText} numberOfLines={2}>
                      {place.overview || place.caption || `${place.primary_mood} 분위기`}
                    </Text>
                  </View>

                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavButton icon="home-outline" active onPress={() => router.push("/home")} />
        <NavButton icon="location-outline" onPress={() => router.push("/map")} />
        <NavButton icon="heart-outline" />
      </View>
    </View>
  );
}

function NavButton({
  icon,
  active = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.navButton, active && styles.activeNavButton]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={36} color="#F28C2E" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDE8",
  },
  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 22,
    paddingBottom: 130,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: 95,
    height: 75,
  },
  searchBox: {
    flex: 1,
    height: 58,
    borderRadius: 30,
    backgroundColor: "#FFFFF4",
    borderWidth: 1.5,
    borderColor: "#9BC9E8",
    marginHorizontal: 14,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#222222",
    maxWidth: "80%",
  },
  profileArea: {
    width: 58,
    alignItems: "center",
  },
  profileName: {
    fontSize: 12,
    color: "#333333",
    marginTop: 2,
  },
  resultList: {
    marginTop: 28,
    gap: 24,
  },
  resultCard: {
    height: 340,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#FFFFF4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
  },
  imageArea: {
    height: 180,
    backgroundColor: "#EAF1E4",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  placeholderIconBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#6FA8DC",
  },
  arrowButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  heartButton: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  placeOverlay: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#FFFFF4",
  },
  placeNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  placeName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#333333",
    marginLeft: 4,
    flex: 1,
  },
  addressBox: {
    backgroundColor: "#FFD75E",
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  addressText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#333333",
  },
  moodText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
    lineHeight: 18,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 95,
    backgroundColor: "#FFFDE8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 28,
    paddingBottom: 18,
  },
  navButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#FFDC74",
    alignItems: "center",
    justifyContent: "center",
  },
  activeNavButton: {
    backgroundColor: "#FFC928",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 5,
  },
});