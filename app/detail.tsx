import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

export default function DetailScreen() {
  const { place } = useLocalSearchParams();

  const data = place ? JSON.parse(place as string) : null;

  // 테스트용 좌표
  const lat = 34.8378;
  const lng = 128.4316;

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
              ✨ #{data?.primary_mood ?? "감성"} #{data?.secondary_mood ?? "여행"}
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
            <Ionicons name="heart-outline" size={22} color="#666" />
            <Text style={styles.statText}>0</Text>

            <Ionicons
              name="eye-outline"
              size={22}
              color="#666"
              style={{ marginLeft: 12 }}
            />
            <Text style={styles.statText}>0</Text>
          </View>

          <View style={styles.iconGroup}>
            <Ionicons name="bookmark-outline" size={22} color="#333" />
            <Ionicons name="print-outline" size={22} color="#333" style={{ marginLeft: 14 }} />
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

          <View style={styles.mapWrapper}>
            <MapView
              style={StyleSheet.absoluteFillObject}
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              initialRegion={{
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
            >
              <Marker
                coordinate={{ latitude: lat, longitude: lng }}
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

  iconGroup: {
    flexDirection: "row",
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