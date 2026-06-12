import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as SecureStore from 'expo-secure-store';

type BookmarkMode = "list" | "map";

type Bookmark = {
  place_name: string;
  content_id: number;
  created_at: string;
  firstimage: string | null;
  map_lat?: number;
  map_lng?: number;
  addr1?: string | null;
};

export default function BookmarkScreen() {
  const [mode, setMode] = useState<BookmarkMode>("list");
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profileEditMenuVisible, setProfileEditMenuVisible] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const loadAndFetch = async () => {
      const userId = await SecureStore.getItemAsync("user_id");
      const nickname = await SecureStore.getItemAsync("nickname");
      if (userId) setUserId(userId);
      if (nickname) setNickname(nickname);

      if (userId){
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/bookmarks/find?user_id=${userId}`
        );
        const data = await res.json();
        setBookmarks(Array.isArray(data.results) ? data.results : []);
      }
    };
    loadAndFetch();
  }, []);

  // 상단 헤더 및 탭 메뉴 (공통 분리)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topArea}>
        <View style={styles.logoArea}>
          <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>나의 북마크</Text>
        <TouchableOpacity
          style={styles.profileArea}
          onPress={() => setProfileMenuVisible(!profileMenuVisible)}
          activeOpacity={0.75}
        >
          <Ionicons name="person-circle-outline" size={44} color="#263A56" />
          <Text style={styles.profileName}>{nickname}님</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.modeTabs}>
        <TouchableOpacity onPress={() => setMode("list")}>
          <Text style={[styles.modeText, mode === "list" && styles.activeModeText]}>리스트형</Text>
        </TouchableOpacity>
        <Text style={styles.divider}>|</Text>
        <TouchableOpacity onPress={() => setMode("map")}>
          <Text style={[styles.modeText, mode === "map" && styles.activeModeText]}>지도형</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 1. 모드에 따라 ScrollView 구조 자체를 분리하여 짤림 방지 */}
      {mode === "list" ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          <ShowBookmarkList places={bookmarks} userId={userId} setBookmarks={setBookmarks}/>
        </ScrollView>
      ) : (
        <View style={styles.mapFullContainer}>
          {renderHeader()}
          <BookmarkMap places={bookmarks} userId={userId} setBookmarks={setBookmarks} />
        </View>
      )}

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNav}>
        <NavButton icon="home-outline" onPress={() => router.push("/home")} />
        <NavButton icon="location-outline" onPress={() => router.push("/map")} />
        <NavButton icon="heart-outline" active />
      </View>
    </View>
  );
}

/* ========================================================
   [리스트형 컴포넌트] (기존 동일)
   ======================================================== */
function ShowBookmarkList({places, userId, setBookmarks}: {places: Bookmark[]; userId: string; setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;}) {
  const removeBookmark = async (item: Bookmark) => {
    if(!userId) return;
    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/bookmarks/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, content_id: item.content_id }),
    });
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.content_id !== item.content_id));
  };

  if (places.length === 0) {
    return (
      <View style={styles.emptyArea}>
        <Ionicons name="heart-outline" size={48} color="#CCCCCC" />
        <Text style={styles.emptyText}>아직 북마크한 장소가 없어요</Text>
      </View>
    );
  }

  return (
    <View style={styles.listArea}>
      {places.map((item) => (
        <View key={item.content_id} style={styles.bookmarkCard}>
          {item.firstimage ? (
            <Image source={{ uri: item.firstimage }} style={styles.imagePlaceholder} />
          ) : (
            <View style={styles.imagePlaceholder}><Text style={styles.imageText}>장소 이미지</Text></View>
          )}

          <TouchableOpacity style={styles.heartButton} onPress={() => removeBookmark(item)}>
            <Ionicons name="heart" size={34} color="#F28C2E" />
          </TouchableOpacity>

          <View style={styles.cardBottom}>
            <View style={styles.placeNameRow}>
              <Ionicons name="location" size={28} color="#F28C2E" />
              <Text style={styles.placeName}>{item.place_name}</Text>
            </View>
            <View style={styles.addressBadge}>
              <Text style={styles.addressText}>{new Date(item.created_at).toLocaleDateString("ko-KR")}</Text>
            </View>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => router.push({ pathname: "/detail", params: { content_id: item.content_id.toString() } })}
            >
              <Ionicons name="arrow-forward" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

/* ========================================================
   [지도형 컴포넌트] (화면 채우기 최적화)
   ======================================================== */
function BookmarkMap({ places, userId, setBookmarks }: { places: Bookmark[]; userId: string; setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>; }) {
  const [detailedPlaces, setDetailedPlaces] = useState<Bookmark[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (places.length === 0) return;
      setLoading(true);
      try {
        const promises = places.map(async (item) => {
          const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/detail/get?content_id=${item.content_id}`);
          const resData = await res.json();
          if (resData && resData.result) {
            return {
              ...item,
              map_lat: resData.result.map_lat,
              map_lng: resData.result.map_lng,
              addr1: resData.result.addr1,
              firstimage: resData.result.firstimage || item.firstimage,
            };
          }
          return item;
        });

        const results = await Promise.all(promises);
        const validPlaces = results.filter(p => p.map_lat && p.map_lng);
        setDetailedPlaces(validPlaces);
        if (validPlaces.length > 0) setSelectedPlace(validPlaces[0]);
      } catch (err) {
        console.error(err);
      } {
        setLoading(false);
      }
    };
    fetchCoordinates();
  }, [places]);

  if (places.length === 0) {
    return (
      <View style={styles.emptyArea}>
        <Ionicons name="heart-outline" size={48} color="#CCCCCC" />
        <Text style={styles.emptyText}>아직 북마크한 장소가 없어요</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.mapLoadingArea}>
        <Text style={{ fontWeight: '700', color: '#555' }}>좌표 정보를 불러오는 중입니다...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapModeArea}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: selectedPlace?.map_lat ?? 37.5665,
          longitude: selectedPlace?.map_lng ?? 126.978,
          latitudeDelta: 3,
          longitudeDelta: 3,
        }}
        customMapStyle={PASTEL_MAP_STYLE}
      >
        {detailedPlaces.map((place) => (
          <Marker
            key={place.content_id}
            coordinate={{ latitude: place.map_lat || 0, longitude: place.map_lng || 0 }}
            title={place.place_name}
            pinColor={selectedPlace?.content_id === place.content_id ? "#FF4D6D" : "#F28C2E"}
            onPress={() => setSelectedPlace(place)}
          />
        ))}
      </MapView>

      {/* 하단 카드 배치 - bottomNav 높이를 감안하여 상단 배치 조정 */}
      {selectedPlace && (
        <View style={styles.mapCard}>
          {selectedPlace.firstimage ? (
            <Image source={{ uri: selectedPlace.firstimage }} style={StyleSheet.absoluteFillObject} />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#9EA8AF' }]} />
          )}
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />

          <View style={styles.mapCardImage}>
            <Text style={styles.mapCardTitle}>{selectedPlace.place_name}</Text>
            <View style={styles.mapAddressBadge}>
              <Text style={styles.addressText} numberOfLines={1}>{selectedPlace.addr1 || "주소 정보 없음"}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.mapHeartButton} onPress={() => {
            if(!userId) return;
            fetch(`${process.env.EXPO_PUBLIC_API_URL}/bookmarks/remove`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: userId, content_id: selectedPlace.content_id }),
            }).then(() => {
              setBookmarks((prev) => prev.filter((b) => b.content_id !== selectedPlace.content_id));
            });
          }}>
            <Ionicons name="heart" size={34} color="#F28C2E" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.mapArrowButton}
            onPress={() => router.push({ pathname: "/detail", params: { content_id: selectedPlace.content_id.toString() } })}
          >
            <Ionicons name="arrow-forward" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function NavButton({ icon, active = false, onPress }: { icon: keyof typeof Ionicons.glyphMap; active?: boolean; onPress?: () => void; }) {
  return (
    <TouchableOpacity style={[styles.navButton, active && styles.activeNavButton]} onPress={onPress}>
      <Ionicons name={icon} size={34} color="#F28C2E" />
    </TouchableOpacity>
  );
}

/* ========================================================
   [스타일시트 구조 최적화]
   ======================================================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDE8" },
  
  // 헤더 패딩 관련 스타일 분리
  headerContainer: { paddingHorizontal: 26, paddingTop: 70 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 130 },
  
  mapFullContainer: { 
    flex: 1, 
    paddingBottom: 105 
  }, 

  // 2. 지도가 들어가는 영역을 90% 너비의 카드 형태로 변경
  mapModeArea: { 
    flex: 1, 
    marginTop: 10, 
    marginBottom: 15,          // 하단 네비게이션과의 간격
    marginHorizontal: 20,      // ★ 양옆에 여백을 주어 너비를 약 90%로 조절
    borderRadius: 24,          // ★ 지도의 모서리를 둥글게 처리
    overflow: 'hidden',        // ★ 지도가 둥근 모서리 밖으로 빠져나가지 않도록 제한
    position: 'relative',
    
    // 선택사항: 지도 판넬에 가벼운 그림자 효과를 주고 싶다면 추가
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  // 3. 지도가 작아진 만큼 하단 팝업 카드의 여백도 알맞게 조정 (140번째 줄 부근)
  mapCard: { 
    position: "absolute", 
    left: 16,                  // 외부 마진이 줄었으므로 카드 내부 마진도 살짝 조정
    right: 16, 
    bottom: 16, 
    height: 120, 
    borderRadius: 20, 
    overflow: "hidden", 
    backgroundColor: "#9EA8AF", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 6 
  },

  mapLoadingArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  topArea: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  logoArea: { width: 105, height: 86, alignItems: "center", justifyContent: "center" },
  logo: { width: 105, height: 86 },
  title: { flex: 1, textAlign: "center", fontSize: 22, fontWeight: "800", color: "#333333" },
  profileArea: { width: 58, alignItems: "center" },
  profileName: { marginTop: 2, fontSize: 12, color: "#333333" },
  modeTabs: { flexDirection: "row", alignItems: "center", marginTop: 14, marginBottom: 14 },
  modeText: { fontSize: 16, color: "#333333", fontWeight: "600" },
  activeModeText: { color: "#F28C2E" },
  divider: { marginHorizontal: 8, color: "#333333" },
  
  listArea: { gap: 28, paddingHorizontal: 26 },
  bookmarkCard: { height: 245, borderRadius: 24, overflow: "hidden", backgroundColor: "#D9D9D9" },
  imagePlaceholder: { flex: 1, backgroundColor: "#9EA8AF", alignItems: "center", justifyContent: "center" },
  imageText: { fontSize: 24, fontWeight: "800", color: "#69747C" },
  heartButton: { position: "absolute", top: 24, right: 20 },
  cardBottom: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingBottom: 16 },
  placeNameRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  placeName: { marginLeft: 8, fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  addressBadge: { alignSelf: "flex-start", backgroundColor: "#FFD957", borderRadius: 18, paddingHorizontal: 18, paddingVertical: 7 },
  addressText: { fontSize: 13, fontWeight: "700", color: "#333333" },
  arrowButton: { position: "absolute", right: 18, bottom: 14, width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(80,80,80,0.55)", alignItems: "center", justifyContent: "center" },
  
  // 지도 팝업 카드 (네비게이션 바 바로 위에 동둥 떠있도록 처리)
  mapCardImage: { flex: 1, justifyContent: "flex-end", paddingLeft: 22, paddingBottom: 18 },
  mapCardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", marginBottom: 6 },
  mapAddressBadge: { alignSelf: "flex-start", backgroundColor: "#FFD957", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 5, maxWidth: '75%' },
  mapHeartButton: { position: "absolute", top: 16, right: 18 },
  mapArrowButton: { position: "absolute", right: 18, bottom: 14, width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(80,80,80,0.55)", alignItems: "center", justifyContent: "center" },
  
  bottomNav: { position: "absolute", left: 0, right: 0, bottom: 0, height: 105, backgroundColor: "#FFFDE8", flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 32, paddingBottom: 22 },
  navButton: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#FFE08A", alignItems: "center", justifyContent: "center" },
  activeNavButton: { backgroundColor: "#FFC928" },
  emptyArea: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: "#AAAAAA", fontWeight: "600" },
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