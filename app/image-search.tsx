import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useCallback } from "react";
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
  similarity: number;
  firstimage?: string | null;
  overview?: string | null;
  addr1?: string | null;
};

export default function ImageSearchScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();

  const [places, setPlaces]   = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [likedPlaces, setLikedPlaces] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadUserInfo = async () => {
      const userId = await SecureStore.getItemAsync("user_id");
      const nickname = await SecureStore.getItemAsync("nickname");
      if (userId) setUserId(userId);
      if (nickname) setNickname(nickname);
    };
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (imageUri) fetchRecommendations(imageUri);
  }, [imageUri]);

  async function fetchRecommendations(uri: string) {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "query.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(`${API_URL}/recommend?top_k=5`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail ?? "서버 오류");
      }

      const data = await response.json();
      setPlaces(data.results);  // 백엔드가 title, firstimage, overview 다 포함해서 내려줌
      
      if (userId) {
        const likedStatus: Record<number, boolean> = {};

        for (const place of data.results) {
          const res = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/bookmarks/check`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: userId,
                content_id: place.content_id,
              }),
            }
          );

          const result = await res.json();

          likedStatus[place.id] = result.is_bookmarked;
        }

        setLikedPlaces(likedStatus);
      }

    } catch (e: any) {
      setError(e.message ?? "알 수 없는 오류");
      Alert.alert("오류", e.message ?? "추천을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const handleBookmark = async (place: Place) => {
    if (!userId) return;

    const isLiked = likedPlaces[place.id];

    if (isLiked) {
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/bookmarks/remove`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            content_id: place.content_id,
          }),
        }
      );
    } else {
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/bookmarks/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            content_id: place.content_id,
            place_name: place.place_name,
          }),
        }
      );
    }

    setLikedPlaces((prev) => ({
      ...prev,
      [place.id]: !isLiked,
    }));
  };

  const refreshBookmarks = async () => {
    if (!userId) return;

    const likedStatus: Record<number, boolean> = {};

    for (const place of places) {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/bookmarks/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            content_id: place.content_id,
          }),
        }
      );

      const result = await res.json();

      likedStatus[place.id] = result.is_bookmarked;
    }

    setLikedPlaces(likedStatus);
  };

  useFocusEffect(
    useCallback(() => {
      refreshBookmarks();
      return () => {};
    }, [userId, places])
  );

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
          <Text style={styles.title}>이미지 검색 결과</Text>
          <View style={styles.profileArea}>
            <Ionicons name="person-circle-outline" size={48} color="#263A56" />
            <Text style={styles.profileName}>{nickname}님</Text>
          </View>
        </View>

        {/* 선택한 이미지 */}
        {imageUri && (
          <View style={styles.selectedImageBox}>
            <Image source={{ uri: imageUri }} style={styles.selectedImage} />
          </View>
        )}

        {/* 로딩 */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#F28C2E" />
            <Text style={styles.loadingText}>감성 분석 중...</Text>
          </View>
        )}

        {/* 에러 */}
        {error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => imageUri && fetchRecommendations(imageUri)}
            >
              <Text style={styles.retryText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 결과 목록 */}
        {!loading && places.length > 0 && (
          <>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>비슷한 감성 여행지</Text>
              <Text style={styles.resultCount}>{places.length}개의 장소</Text>
            </View>

            {places.map((place, index) => (
              <TouchableOpacity key={place.id} style={styles.listCard}
                onPress={() => router.push({pathname: "/detail", params: { content_id: place.content_id
      },
    })
  }
>
                {place.firstimage ? (
                  <Image
                    source={{ uri: place.firstimage }}
                    style={styles.placeImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeImageFallback}>
                    <Ionicons name="image-outline" size={36} color="#C4BFA3" />
                  </View>
                )}

                <View style={styles.cardBody}>
                  {/* 순위 + 이름 */}
                  <View style={styles.placeTitleRow}>
                    <View style={styles.rankCircle}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <Ionicons name="location-sharp" size={20} color="#F28C2E" />
                    <Text style={styles.placeName} numberOfLines={1}>
                      {place.place_name}
                    </Text>
                  </View>

                  {/* 지역 */}
                  <View style={styles.addressBox}>
                    <Text style={styles.addressText}>{place.region}</Text>
                  </View>

                  {/* 개요 */}
                  <Text style={styles.moodText} numberOfLines={2}>
                    {place.overview}
                  </Text>

                  {/* 유사도 */}
                  <Text style={styles.matchText}>
                    업로드한 사진과의 유사도 {place.similarity}%
                  </Text>

                  {/* 태그 */}
                  <Text style={styles.tagText}>
                    {[place.primary_mood, place.secondary_mood, place.scene]
                      .filter((t) => t && t !== "nan")
                      .map((t) => `#${t}`)
                      .join(" ")}
                  </Text>
                </View>

                {/* 우측 버튼 */}
                <View style={styles.rightArea}>
                  <TouchableOpacity onPress={() => handleBookmark(place)}>
                    <Ionicons
                      name={likedPlaces[place.id] ? "heart" : "heart-outline"}
                      size={34}
                      color={likedPlaces[place.id] ? "#FF4D6D" : "#FFD75E"}
                    />
                  </TouchableOpacity>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color="#C4BFA3"
                    style={styles.chevron}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNav}>
        <NavButton icon="home-outline" active onPress={() => router.push("/home")} />
        <NavButton icon="location-outline" onPress={() => router.push("/map")} />
        <NavButton icon="heart-outline" onPress={() => router.push("/bookmark")} />
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
  container:          { flex: 1, backgroundColor: "#FFFDE8" },
  scrollContent:      { paddingTop: 70, paddingHorizontal: 28, paddingBottom: 130 },
  header:             { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logo:               { width: 95, height: 75 },
  title:              { fontSize: 22, fontWeight: "800", color: "#2C2C2C" },
  profileArea:        { width: 58, alignItems: "center" },
  profileName:        { fontSize: 12, color: "#333333", marginTop: 2 },

  selectedImageBox:   { marginTop: 28, width: "100%", height: 210, borderRadius: 28, overflow: "hidden", backgroundColor: "#EEE9D0" },
  selectedImage:      { width: "100%", height: "100%" },

  loadingBox:         { marginTop: 60, alignItems: "center" },
  loadingText:        { marginTop: 16, fontSize: 16, fontWeight: "600", color: "#555" },

  errorBox:           { marginTop: 40, alignItems: "center" },
  errorText:          { fontSize: 14, color: "#c0392b", textAlign: "center" },
  retryButton:        { marginTop: 16, backgroundColor: "#F28C2E", borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  retryText:          { color: "#fff", fontWeight: "700" },

  resultHeader:       { marginTop: 30, marginBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resultTitle:        { fontSize: 22, fontWeight: "800", color: "#2C2C2C" },
  resultCount:        { fontSize: 14, fontWeight: "700", color: "#8A866F" },

  listCard:           { backgroundColor: "#FFFFF4", borderRadius: 26, marginBottom: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.13, shadowRadius: 4, elevation: 4 },
  placeImage:         { width: "100%", height: 150 },
  placeImageFallback: { width: "100%", height: 150, backgroundColor: "#EEE9D0", alignItems: "center", justifyContent: "center" },

  cardBody:           { paddingVertical: 14, paddingHorizontal: 16 },
  placeTitleRow:      { flexDirection: "row", alignItems: "center", gap: 6 },
  rankCircle:         { width: 28, height: 28, borderRadius: 14, backgroundColor: "#FFD75E", alignItems: "center", justifyContent: "center" },
  rankText:           { fontSize: 14, fontWeight: "900", color: "#333333" },
  placeName:          { fontSize: 18, fontWeight: "800", color: "#202020", flex: 1 },

  addressBox:         { backgroundColor: "#FFD75E", borderRadius: 18, paddingVertical: 5, paddingHorizontal: 12, alignSelf: "flex-start", marginTop: 8 },
  addressText:        { fontSize: 12, fontWeight: "700", color: "#333333" },
  moodText:           { marginTop: 8, fontSize: 13, fontWeight: "600", color: "#333333", lineHeight: 19 },
  matchText:          { marginTop: 6, fontSize: 12, fontWeight: "700", color: "#555555" },
  tagText:            { marginTop: 4, fontSize: 12, color: "#333333" },

  rightArea:          { position: "absolute", top: 160, right: 16, alignItems: "center" },
  chevron:            { marginTop: 8 },

  bottomNav:          { position: "absolute", left: 0, right: 0, bottom: 0, height: 95, backgroundColor: "#FFFDE8", flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 28, paddingBottom: 18 },
  navButton:          { width: 66, height: 66, borderRadius: 33, backgroundColor: "#FFDC74", alignItems: "center", justifyContent: "center" },
  activeNavButton:    { backgroundColor: "#FFC928", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 4, elevation: 5 },
});