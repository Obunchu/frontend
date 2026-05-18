import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const places = [
  { id: "1", name: "낙산공원" },
  { id: "2", name: "성북천" },
  { id: "3", name: "개운산" },
];

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 로고 / 검색 / 프로필 */}
        <View style={styles.topArea}>
          <View style={styles.logoArea}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

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

        {/* 지도 API 자리 */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>지도 API</Text>

          <View style={[styles.marker, { top: "34%", left: "48%" }]} />
          <View style={[styles.marker, { top: "46%", left: "30%" }]} />
          <View style={[styles.marker, { top: "58%", left: "54%" }]} />
          <View style={[styles.marker, { top: "42%", left: "76%" }]} />
          <View style={[styles.marker, { top: "66%", left: "22%" }]} />
        </View>

        {/* 추천 카드 */}
        <View style={styles.placeCardArea}>
          {places.map((place) => (
            <TouchableOpacity key={place.id} style={styles.placeCard}>
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.cardTitle}>{place.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNav}>
        <NavButton icon="home-outline" onPress={() => router.push("/home")} />
        <NavButton icon="location-outline" active />
        <NavButton icon="heart-outline" onPress={() => router.push("/bookmark")} />
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
      <Ionicons name={icon} size={34} color="#F28C2E" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDE8",
  },

  scrollView: {
    flex: 1,
    backgroundColor: "#FFFDE8",
  },

  scrollContent: {
    paddingTop: 35,
    paddingHorizontal: 30,
    paddingBottom: 130,
  },

  topArea: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  logoArea: {
    width: 105,
    height: 86,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 105,
    height: 86,
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

  mapPlaceholder: {
    width: "100%",
    height: 390,
    backgroundColor: "#E8E8E8",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D0D0D0",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  mapText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#9A9A9A",
  },

  marker: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F28C2E",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  placeCardArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  placeCard: {
    flex: 1,
    height: 150,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#D9D9D9",
  },

  cardImagePlaceholder: {
    flex: 1,
    backgroundColor: "#8D979F",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 18,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
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
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFE08A",
    alignItems: "center",
    justifyContent: "center",
  },

  activeNavButton: {
    backgroundColor: "#FFC928",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 5,
  },
});