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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

const { width } = Dimensions.get("window");

type Place = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  mood: string;
};

const places: Place[] = [
  {
    id: "1",
    name: "낙산공원",
    address: "서울 종로구 낙산길 41",
    latitude: 37.5806,
    longitude: 127.0072,
    mood: "야경과 성곽길이 어울리는 산책 장소",
  },
  {
    id: "2",
    name: "성북천",
    address: "서울 성북구 동소문동",
    latitude: 37.5892,
    longitude: 127.0095,
    mood: "조용하게 걷기 좋은 산책로",
  },
  {
    id: "3",
    name: "개운산",
    address: "서울 성북구 돈암동",
    latitude: 37.5964,
    longitude: 127.0242,
    mood: "자연과 전망이 어우러진 장소",
  },
];

export default function MapScreen() {
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
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.035,
        longitudeDelta: 0.035,
      });
    } catch (error) {
      setRegion({
        latitude: 37.5665,
        longitude: 126.978,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });
    } finally {
      setLoading(false);
    }
  };

  const moveToPlace = (place: Place) => {
    const nextRegion = {
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };

    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#A8A8A8" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#A8A8A8"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.profileArea}>
          <Ionicons name="person-circle-outline" size={48} color="#263A56" />
          <Text style={styles.profileName}>수정님</Text>
        </View>
      </View>

      <View style={styles.mapArea}>
        {loading || !region ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#F28C2E" />
            <Text style={styles.loadingText}>현재 위치를 불러오는 중...</Text>
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
            {places.map((place) => (
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

      <View style={styles.placeCardArea}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.placeCardContent}
        >
          {places.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.placeCard}
              onPress={() => moveToPlace(place)}
              activeOpacity={0.85}
            >
              <View style={styles.cardImagePlaceholder}>
                <Ionicons name="image-outline" size={36} color="#6FA8DC" />
              </View>

              <View style={styles.cardTextArea}>
                <Text style={styles.cardTitle}>{place.name}</Text>
                <Text style={styles.cardAddress}>{place.address}</Text>
                <Text style={styles.cardMood}>{place.mood}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.bottomNav}>
        <NavButton icon="home-outline" onPress={() => router.push("/home")} />
        <NavButton icon="location-outline" active />
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
    paddingTop: 45,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  logo: {
    width: 95,
    height: 75,
  },

  searchBox: {
    flex: 1,
    height: 44,
    marginHorizontal: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D2D2D2",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
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

  mapArea: {
    marginHorizontal: 28,
    height: 460,
    borderRadius: 18,
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

  placeCardArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 110,
  },

  placeCardContent: {
    paddingHorizontal: 28,
  },

  placeCard: {
    width: width * 0.36,
    height: 150,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFF4",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
  },

  cardImagePlaceholder: {
    height: 58,
    backgroundColor: "#EAF1E4",
    alignItems: "center",
    justifyContent: "center",
  },

  cardTextArea: {
    padding: 8,
  },

  cardTitle: {
    color: "#333333",
    fontSize: 15,
    fontWeight: "900",
  },

  cardAddress: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: "#555555",
  },

  cardMood: {
    marginTop: 4,
    fontSize: 10,
    color: "#777777",
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 105,
    backgroundColor: "#FFFDE8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 32,
    paddingBottom: 22,
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