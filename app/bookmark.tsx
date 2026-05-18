import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

type BookmarkMode = "list" | "map";

type BookmarkPlace = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  mood: string;
};

const { width } = Dimensions.get("window");

const bookmarks: BookmarkPlace[] = [
  {
    id: "1",
    name: "덕수궁 돌담길",
    address: "서울 중구 세종대로19길 24 영국대사관",
    latitude: 37.5658,
    longitude: 126.9751,
    mood: "고즈넉한 산책길 분위기",
  },
  {
    id: "2",
    name: "북서울꿈의숲",
    address: "서울 강북구 월계로 173",
    latitude: 37.6217,
    longitude: 127.0412,
    mood: "자연과 여유가 느껴지는 분위기",
  },
  {
    id: "3",
    name: "반포한강공원",
    address: "서울 서초구 신반포로11길 40",
    latitude: 37.5105,
    longitude: 126.9959,
    mood: "강변과 야경이 어울리는 분위기",
  },
];

export default function BookmarkScreen() {
  const [mode, setMode] = useState<BookmarkMode>("list");

  return (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>나의 북마크</Text>

        <View style={styles.profileArea}>
          <Ionicons name="person-circle-outline" size={44} color="#263A56" />
          <Text style={styles.profileName}>수정님</Text>
        </View>
      </View>

      <View style={styles.modeTabs}>
        <TouchableOpacity onPress={() => setMode("list")}>
          <Text
            style={[
              styles.modeText,
              mode === "list" && styles.activeModeText,
            ]}
          >
            리스트형
          </Text>
        </TouchableOpacity>

        <Text style={styles.divider}>|</Text>

        <TouchableOpacity onPress={() => setMode("map")}>
          <Text
            style={[
              styles.modeText,
              mode === "map" && styles.activeModeText,
            ]}
          >
            지도형
          </Text>
        </TouchableOpacity>
      </View>

      {mode === "list" ? <BookmarkList /> : <BookmarkMap />}

      <View style={styles.bottomNav}>
        <NavButton icon="home-outline" onPress={() => router.push("/home")} />
        <NavButton icon="location-outline" onPress={() => router.push("/map")} />
        <NavButton icon="heart-outline" active onPress={() => router.push("/bookmark")} />
        <NavButton icon="chatbubbles-outline" />
      </View>
    </View>
  );
}

function BookmarkList() {
  return (
    <ScrollView
      contentContainerStyle={styles.listScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {bookmarks.map((item) => (
        <View key={item.id} style={styles.bookmarkCard}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={58} color="#6FA8DC" />
            <Text style={styles.imageText}>장소 이미지</Text>
          </View>

          <TouchableOpacity style={styles.heartButton}>
            <Ionicons name="heart" size={34} color="#F28C2E" />
          </TouchableOpacity>

          <View style={styles.cardBottom}>
            <View style={styles.placeNameRow}>
              <Ionicons name="location" size={28} color="#F28C2E" />
              <Text style={styles.placeName}>{item.name}</Text>
            </View>

            <View style={styles.addressBadge}>
              <Text style={styles.addressText}>{item.address}</Text>
            </View>

            <Text style={styles.moodText}>{item.mood}</Text>

            <TouchableOpacity style={styles.arrowButton}>
              <Ionicons name="arrow-forward" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function BookmarkMap() {
  const mapRef = useRef<MapView | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setRegion({
          latitude: 37.5665,
          longitude: 126.978,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });
    } catch (error) {
      setRegion({
        latitude: 37.5665,
        longitude: 126.978,
        latitudeDelta: 0.12,
        longitudeDelta: 0.12,
      });
    } finally {
      setLoading(false);
    }
  };

  const moveToPlace = (place: BookmarkPlace) => {
    const nextRegion = {
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    };

    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 500);
  };

  return (
    <View style={styles.mapModeArea}>
      <View style={styles.mapArea}>
        {loading || !region ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#F28C2E" />
            <Text style={styles.loadingText}>지도를 불러오는 중...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton
          >
            {bookmarks.map((place) => (
              <Marker
                key={place.id}
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
                title={place.name}
                description={place.address}
                pinColor="#F28C2E"
              />
            ))}
          </MapView>
        )}
      </View>

      <View style={styles.mapCardArea}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mapCardContent}
        >
          {bookmarks.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.mapCard}
              onPress={() => moveToPlace(place)}
              activeOpacity={0.85}
            >
              <View style={styles.mapCardImage}>
                <Ionicons name="image-outline" size={36} color="#6FA8DC" />
              </View>

              <View style={styles.mapCardTextArea}>
                <Text style={styles.mapCardTitle}>{place.name}</Text>
                <Text style={styles.mapCardAddress} numberOfLines={1}>
                  {place.address}
                </Text>
                <Text style={styles.mapCardMood} numberOfLines={2}>
                  {place.mood}
                </Text>
              </View>

              <TouchableOpacity style={styles.mapHeartButton}>
                <Ionicons name="heart" size={28} color="#F28C2E" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={34} color="#F28C2E" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDE8",
  },

  topArea: {
    paddingTop: 64,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 105,
    height: 78,
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: "#333333",
  },

  profileArea: {
    width: 58,
    alignItems: "center",
  },

  profileName: {
    marginTop: 2,
    fontSize: 12,
    color: "#333333",
  },

  modeTabs: {
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 14,
  },

  modeText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "700",
  },

  activeModeText: {
    color: "#F28C2E",
  },

  divider: {
    marginHorizontal: 8,
    color: "#333333",
  },

  listScrollContent: {
    paddingHorizontal: 26,
    paddingBottom: 130,
    gap: 28,
  },

  bookmarkCard: {
    height: 280,
    borderRadius: 32,
    backgroundColor: "#FFFFF4",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
  },

  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#EAF1E4",
    alignItems: "center",
    justifyContent: "center",
  },

  imageText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
    color: "#6FA8DC",
  },

  heartButton: {
    position: "absolute",
    top: 18,
    right: 18,
  },

  cardBottom: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFF4",
  },

  placeNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  placeName: {
    marginLeft: 4,
    fontSize: 21,
    fontWeight: "900",
    color: "#333333",
  },

  addressBadge: {
    alignSelf: "flex-start",
    marginTop: 7,
    backgroundColor: "#FFD75E",
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  addressText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#333333",
  },

  moodText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#555555",
  },

  arrowButton: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(160, 160, 160, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  mapModeArea: {
    flex: 1,
    paddingHorizontal: 26,
    paddingBottom: 118,
  },

  mapArea: {
    flex: 1,
    minHeight: 440,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#E8E8E8",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#555555",
  },

  mapCardArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 118,
  },

  mapCardContent: {
    paddingHorizontal: 34,
  },

  mapCard: {
    width: width * 0.42,
    height: 150,
    borderRadius: 20,
    backgroundColor: "#FFFFF4",
    overflow: "hidden",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
  },

  mapCardImage: {
    height: 56,
    backgroundColor: "#EAF1E4",
    alignItems: "center",
    justifyContent: "center",
  },

  mapCardTextArea: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingRight: 34,
  },

  mapCardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#333333",
  },

  mapCardAddress: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: "#555555",
  },

  mapCardMood: {
    marginTop: 4,
    fontSize: 10,
    color: "#777777",
  },

  mapHeartButton: {
    position: "absolute",
    right: 8,
    bottom: 8,
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