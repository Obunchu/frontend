import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as SecureStore from 'expo-secure-store';

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

export default function DetailScreen() {
  const { content_id } = useLocalSearchParams<{ content_id: string }>();

  const [data, setData] = useState<Place | null>(null);
  const [views, setViews] = useState(0);
  const [bookmarkNum, setBookmarkNum] = useState(0);
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLiked, setLiked] = useState(false);

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
  const fetchDetail = async () => {
    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/detail/get?content_id=${content_id}`
      );

      const resultData = await res.json();

      if (resultData && resultData.result) {
        setData(resultData.result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (content_id) {
    fetchDetail();
  }
}, [content_id]);

  useEffect(() => {
    if(!data) return;

    const fetchViewAndCount = async () => {
      // 조회수 증가 + 확인
      const viewAddRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/views/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content_id: data.content_id,
          }),
        }
      );

      const viewAdd = await viewAddRes.json();
      setViews(viewAdd.views)

      // 북마크 수 불러오기
      const bookmarksCountRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/bookmarks/count`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content_id: data.content_id,
          }),
        }
      );

      const bookmarkCount = await bookmarksCountRes.json();
      setBookmarkNum(bookmarkCount.count)

      // 유저의 북마크 여부 확인
      const bookmarkCheckRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/bookmarks/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            content_id: data.content_id,
          }),
        }
      );

      const bookmarkCheck = await bookmarkCheckRes.json();
      setLiked(bookmarkCheck.is_bookmarked);
    };

    if (data?.content_id) {
      fetchViewAndCount();
    }
  }, [data, userId]);

const handleBookmark = async () => {
  if (!userId || !data) return;

  if (isLiked) {
    // 좋아요 눌린 상태 = 지우기
    await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/bookmarks/remove`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          content_id: data.content_id,
        }),
      }
    );

    setLiked(false);
    setBookmarkNum((prev) => Math.max(0, prev - 1));
  } else {
    // 좋아요 눌리지 않은 상태 = 추가하기
    await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/bookmarks/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          content_id: data.content_id,
          place_name: data.place_name,
        }),
      }
    );

    setLiked(true);
    setBookmarkNum((prev) => prev + 1);
  }
};

  if (!data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>관광지 정보를 불러오는 중입니다...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {data?.place_name ?? "관광정보"}
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 타이틀 영역 */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            {data?.place_name ?? "관광지"}
          </Text>

          <Text style={styles.subRegionText}>
            {data?.region ?? ""}
          </Text>

          <View style={styles.copyBadge}>
            <Text style={styles.copyText}>
              ✨
              {data?.primary_mood && ` #${data.primary_mood}`}
              {data?.secondary_mood &&
                data.secondary_mood !== "nan" &&
                ` #${data.secondary_mood}`}
              {data?.scene &&
                data.scene !== "nan" &&
                ` #${data.scene}`}
            </Text>
          </View>
        </View>

        {/* 이미지 */}
        {data?.firstimage ? (
          <Image
            source={{ uri: data.firstimage }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="image-outline" size={60} color="#C4BFA3" />
          </View>
        )}

        {/* 액션바 (장식용 유지 가능) */}
        <View style={styles.actionBar}>
          <View style={styles.statItem}>
            <TouchableOpacity onPress={handleBookmark}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={22}
                color={isLiked ? "#FF4D4F" : "#666"}
              />
            </TouchableOpacity>
            <Text style={styles.statText}>{bookmarkNum}</Text>

            <Ionicons
              name="eye-outline"
              size={22}
              color="#666"
              style={{ marginLeft: 12 }}
            />
            <Text style={styles.statText}>{views}</Text>
          </View>
        </View>

        {/* 상세 설명 */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>상세정보</Text>

          <Text style={styles.overviewText}>
            {data?.overview && data.overview !== "null"
              ? data.overview.replace(/<br\s*\/?>/gi, "\n")
              : "설명 정보가 없습니다."}
          </Text>
        </View>

        {/* 지도 */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>📍 위치</Text>
          <Text style={styles.overviewText}>{data?.addr1}</Text>
          <View style={styles.mapWrapper}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: data?.map_lat ?? 0,
                longitude: data?.map_lng ?? 0,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              customMapStyle={PASTEL_MAP_STYLE}
            >
              <Marker
                coordinate={{ latitude: data?.map_lat ?? 0, longitude: data?.map_lng ?? 0 }}
                title={data?.place_name}
                pinColor="#F28C2E"
              />
            </MapView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    paddingTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 100,
  },

  backButton: { width: 40 },

  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  scrollContent: {
    paddingBottom: 60,
  },

  titleSection: {
    alignItems: "center",
    padding: 16,
  },

  mainTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#333",
  },

  subRegionText: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },

  copyBadge: {
    marginTop: 12,
    backgroundColor: "#FFF0F2",
    padding: 10,
    borderRadius: 10,
  },

  copyText: {
    fontSize: 13,
    color: "#FF6B81",
    fontWeight: "700",
    textAlign: "center",
  },

  mainImage: {
    width: "100%",
    height: 260,
  },

  imageFallback: {
    width: "100%",
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eee",
  },

  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  statText: {
    marginLeft: 4,
    marginRight: 8,
  },

  infoSection: {
    padding: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  overviewText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },

  mapWrapper: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
});

const PASTEL_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5f0e8" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b7355" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#fdf8f0" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#d4c4a8" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b8a898" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#e8f0d8" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#dcecd4" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8b9e78" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#c8e0b4" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7a9e68" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e8ddd0" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#fce8c8" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#f0d4a8" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a0845c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#e8e0d4" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a09080" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#b8d8e8" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7098b0" }],
  },
];