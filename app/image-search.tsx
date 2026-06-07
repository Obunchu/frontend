import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
  similarity: number;
  // 공공API에서 채워지는 필드
  title?: string;
  firstimage?: string | null;
  overview?: string | null;
};

export default function ImageSearchScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();

  const [places, setPlaces]   = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (imageUri) fetchRecommendations(imageUri);
  }, [imageUri]);

  // 공공API URL 구성 (content_id 기반) - 본인 URL로 교체
  function getTourImageUrl(contentId: number): string {
    return `https://apis.data.go.kr/B551011/KorService2/detailCommon2?serviceKey=a5d1b79ac819b6e1f8460a9be32f29e190097b5266041df2ec56093f79254c1a&MobileOS=ETC&MobileApp=AppTest&_type=json&contentId=${contentId}&numOfRows=1&pageNo=1`;
  }

  async function fetchRecommendations(uri: string) {
    setLoading(true);
    setError(null);

    try {
      
      // 1. 백엔드에 이미지 전송 → 추천 결과 수신
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

      // 2. 각 관광지에 대해 공공API 호출 → title, firstimage 추가
      const enriched: Place[] = await Promise.all(
        data.results.map(async (place: Place) => {
          try {
            const res  = await fetch(getTourImageUrl(place.content_id));
            const json = await res.json();
            const item = json.response.body.items.item[0];
            console.log("overview:", item.overview);  // ← 추가
            return {
              ...place,
              title:      item.title      ?? place.place_name,
              firstimage: item.firstimage ?? null,
              overview: item.overview ?? null
            };
          } catch {
            // 공공API 실패해도 나머지 정보는 표시
            return { ...place, title: place.place_name, firstimage: null };
          }
        })
      );

      setPlaces(enriched);
    } catch (e: any) {
      setError(e.message ?? "알 수 없는 오류");
      Alert.alert("오류", e.message ?? "추천을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

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
            <Text style={styles.profileName}>수정님</Text>
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
              <TouchableOpacity key={place.id} style={styles.listCard}>
                {/* 관광지 이미지 */}
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
                      {place.title ?? place.place_name}
                    </Text>
                  </View>

                  {/* 지역 */}
                  <View style={styles.addressBox}>
                    <Text style={styles.addressText}>{place.region}</Text>
                  </View>

                  {/* 캡션 */}
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
                      .filter(Boolean)
                      .map((t) => `#${t}`)
                      .join(" ")}
                  </Text>
                </View>

                {/* 우측 버튼 */}
                <View style={styles.rightArea}>
                  <TouchableOpacity>
                    <Ionicons name="heart-outline" size={34} color="#FFD75E" />
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
        <NavButton icon="heart-outline" />
        <NavButton icon="chatbubbles-outline" />
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
