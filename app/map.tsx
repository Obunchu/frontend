import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

type Place = {
  content_id: string;
  place_name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  address: string;
  firstimage: string;
};

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);

  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);

  useEffect(() => {
    const loadUserInfo = async () => {
      const savedUserId = await SecureStore.getItemAsync("user_id");
      const savedNickname = await SecureStore.getItemAsync("nickname");

      if (savedUserId) setUserId(savedUserId);
      if (savedNickname) setNickname(savedNickname);
    };

    loadUserInfo();
  }, []);

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
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.035,
        longitudeDelta: 0.035,
      });

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/places/nearby?lat=${latitude}&lng=${longitude}&radius_km=2.0`
      );

      const data = await res.json();
      setNearbyPlaces(data);
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

  const places: Place[] = nearbyPlaces.map((item) => ({
    place_name: item.place_name,
    content_id: String(item.content_id),
    latitude: item.latitude,
    longitude: item.longitude,
    distance_km: item.distance_km,
    address: item.address,
    firstimage: item.firstimage,
  }));

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

        <TouchableOpacity
          style={styles.profileArea}
          onPress={() => router.push("/setting")}
          activeOpacity={0.75}
        >
          <Ionicons name="person-circle-outline" size={48} color="#263A56" />
          <Text style={styles.profileName}>{nickname || "수정"}님</Text>
        </TouchableOpacity>
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
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton
            customMapStyle={PASTEL_MAP_STYLE}
          >
            {places.map((place) => (
              <Marker
                key={place.content_id}
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
                title={place.place_name}
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
              key={place.content_id}
              style={styles.placeCard}
              onPress={() => moveToPlace(place)}
              activeOpacity={0.85}
            >
              {place.firstimage ? (
                <Image
                  source={{ uri: place.firstimage }}
                  style={styles.cardImage}
                />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="image-outline" size={36} color="#6FA8DC" />
                </View>
              )}

              <View style={styles.cardTextArea}>
                <Text style={styles.cardTitle}>{place.place_name}</Text>
                <Text style={styles.cardAddress}>주소: {place.address}</Text>
                <Text style={styles.cardDistance}>
                  {place.distance_km * 1000}m 떨어진 거리에 있어요!
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.bottomNav}>
        <NavButton icon="home-outline" onPress={() => router.push("/home")} />
        <NavButton icon="location-outline" active />
        <NavButton
          icon="heart-outline"
          onPress={() => router.push("/bookmark")}
        />
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
    marginBottom: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    width: 95,
    height: 75,
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
    width: width * 0.4,
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

  cardDistance: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "900",
    color: "#ffc374",
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

  cardImage: {
    height: 58,
    width: "100%",
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