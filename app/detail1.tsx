import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function DetailScreen() {
  const params = useLocalSearchParams<{
    title: string;
    firstimage: string;
    overview: string;
    region: string;
    primary_mood?: string;
    secondary_mood?: string;
  }>();

  // 테스트용 위치 좌표 (실제 데이터 있으면 params에서 받아오기)
  const lat = 34.8378; 
  const lng = 128.4316;

  return (
    <View style={styles.container}>
      {/* 1. 상단 헤더 바 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{params.title ?? "관광정보"}</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={26} color="#333333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 2. 타이틀 & 감성 카피 영역 */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{params.title ?? "통영케이블카"}</Text>
          <Text style={styles.subRegionText}>{params.region ?? "경남 통영시"}</Text>
          
          {/* 레퍼런스의 핑크색 감성 한 줄 요약 포인트 */}
          <View style={styles.copyBadge}>
            <Text style={styles.copyText}>
              ✨ #{params.primary_mood ?? "청량한"} 분위기와 #{params.secondary_mood ?? "이국적인"} 감성을 동시에 느낄 수 있는 곳
            </Text>
          </View>
        </View>

        {/* 3. 메인 이미지 & 좋아요/조회수 바 */}
        {params.firstimage ? (
          <Image source={{ uri: params.firstimage }} style={styles.mainImage} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="image-outline" size={60} color="#C4BFA3" />
          </View>
        )}

        {/* 미니 스탯 바 (좋아요, 북마크 아이콘) */}
        <View style={styles.actionBar}>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={22} color="#666" />
            <Text style={styles.statText}>249</Text>
            <Ionicons name="eye-outline" size={22} color="#666" style={{ marginLeft: 12 }} />
            <Text style={styles.statText}>28.5K</Text>
          </View>
          <View style={styles.iconGroup}>
            <Ionicons name="bookmark-outline" size={22} color="#333" style={styles.actionIcon} />
            <Ionicons name="print-outline" size={22} color="#333" style={styles.actionIcon} />
          </View>
        </View>

        {/* 4. 탭 메뉴 바 (디자인용 Mock) */}
        <View style={styles.tabBar}>
          <Text style={[styles.tabItem, styles.activeTabItem]}>상세정보</Text>
          <Text style={styles.tabItem}>사진보기</Text>
          <Text style={styles.tabItem}>댓글</Text>
        </View>

        {/* 5. 본문 상세 설명 */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>상세정보</Text>
          <Text style={styles.overviewText}>
            {params.overview && params.overview !== "null" 
              ? params.overview.replace(/<br\s*\/?>/gi, "\n") 
              : "통영 미륵산에 설치된 통영케이블카는 친환경적인 설계에 의해 한려수도의 아름다운 경치를 한눈에 감상할 수 있는 대한민국 대표 관광지입니다."}
          </Text>
        </View>

        {/* 6. 실제 구글 지도 영역 */}
        <View style={styles.infoSection}>
          <View style={styles.mapHeader}>
            <Text style={styles.sectionTitle}>📍 위치 안내</Text>
            <View style={styles.miniBadge}><Text style={styles.miniBadgeText}>여행지도보기</Text></View>
          </View>
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
              <Marker coordinate={{ latitude: lat, longitude: lng }} title={params.title} pinColor="#F28C2E" />
            </MapView>
          </View>
        </View>

        {/* 7. 레퍼런스 맨 밑의 이용 안내 테이블 상세 정보 */}
        <View style={styles.tableSection}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>• 문의 및 안내</Text>
            <Text style={styles.tableValue}>1544-3303</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>• 주소</Text>
            <Text style={styles.tableValue}>{params.region ?? "경상남도 통영시 발개로 205"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>• 휴일</Text>
            <Text style={styles.tableValue}>매월 둘째, 넷째 수요일</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>• 주차</Text>
            <Text style={styles.tableValue}>가능 (약 소형 288대 / 대형 11대)</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" }, // 깨끗한 백화점 느낌의 흰색 배경
  header: { paddingTop: 60, height: 110, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, backgroundColor: "#FFFFFF" },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  shareButton: { width: 40, height: 40, alignItems: "flex-end", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#666" },
  
  scrollContent: { paddingBottom: 60 },
  
  titleSection: { alignItems: "center", paddingVertical: 16, paddingHorizontal: 20 },
  mainTitle: { fontSize: 26, fontWeight: "900", color: "#333333", marginBottom: 6 },
  subRegionText: { fontSize: 14, color: "#888888", marginBottom: 16 },
  
  // 레퍼런스 스타일 연분홍 배경 감성 바
  copyBadge: { backgroundColor: "#FFF0F2", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, width: "100%", alignItems: "center" },
  copyText: { fontSize: 14, fontWeight: "700", color: "#FF6B81", textAlign: "center" },
  
  mainImage: { width: "100%", height: 265, marginTop: 10 },
  imageFallback: { width: "100%", height: 265, backgroundColor: "#EEE9D0", alignItems: "center", justifyContent: "center" },
  
  actionBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderColor: "#EFEFEF" },
  statItem: { flexDirection: "row", alignItems: "center" },
  statText: { fontSize: 13, color: "#888", marginLeft: 4, fontWeight: "600" },
  iconGroup: { flexDirection: "row" },
  actionIcon: { marginLeft: 14 },
  
  tabBar: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#EFEFEF", marginTop: 10 },
  tabItem: { flex: 1, textAlign: "center", paddingVertical: 14, fontSize: 14, fontWeight: "700", color: "#999999" },
  activeTabItem: { color: "#333333", borderBottomWidth: 3, borderColor: "#333333" },
  
  infoSection: { paddingHorizontal: 20, paddingVertical: 24, borderBottomWidth: 1, borderColor: "#F5F5F5" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#333333", marginBottom: 14 },
  overviewText: { fontSize: 15, color: "#555555", lineHeight: 25, fontWeight: "500" },
  
  mapHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  miniBadge: { borderWidth: 1, borderColor: "#9BC9E8", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  miniBadgeText: { fontSize: 11, color: "#6FA8DC", fontWeight: "700" },
  mapWrapper: { width: "100%", height: 180, borderRadius: 12, overflow: "hidden", backgroundColor: "#E2E2E2" },
  
  tableSection: { paddingHorizontal: 20, paddingVertical: 20, backgroundColor: "#FAFAFA" },
  tableRow: { flexDirection: "row", marginBottom: 10, alignItems: "flex-start" },
  tableLabel: { width: 100, fontSize: 13, color: "#666666", fontWeight: "700" },
  tableValue: { flex: 1, fontSize: 13, color: "#333333", fontWeight: "600", lineHeight: 18 },
});