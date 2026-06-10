import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Place = {
  id: string;
  name: string;
  address: string;
  mood: string;
};

const mockResults: Place[] = [
  {
    id: "1",
    name: "북촌한옥마을",
    address: "서울 종로구 계동길 37",
    mood: "전통 한옥과 골목길이 어우러진 고즈넉한 분위기",
  },
  {
    id: "2",
    name: "상춘재",
    address: "서울 종로구 자하문로17길 12-11",
    mood: "조용한 한옥 공간에서 느껴지는 차분한 분위기",
  },
  {
    id: "3",
    name: "종묘",
    address: "서울 종로구 종로 157",
    mood: "역사적인 공간이 주는 웅장하고 고요한 분위기",
  },
];

export default function KeywordResultScreen() {
  const { mood } = useLocalSearchParams<{ mood?: string; region?: string }>();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity style={styles.searchBox} onPress={() => router.back()}>
            <Text style={styles.searchText}>#{mood ?? "고즈넉한"}</Text>
            <Ionicons name="search-outline" size={34} color="#6FA8DC" />
          </TouchableOpacity>

          <View style={styles.profileArea}>
            <Ionicons name="person-circle-outline" size={48} color="#263A56" />
            <Text style={styles.profileName}>수정님</Text>
          </View>
        </View>

        <View style={styles.resultList}>
          {mockResults.map((place) => (
            <TouchableOpacity key={place.id} style={styles.resultCard}>
              <View style={styles.cardBackground}>
                <View style={styles.placeholderIconBox}>
                  <Ionicons name="image-outline" size={82} color="#6FA8DC" />
                  <Text style={styles.placeholderText}>장소 이미지</Text>
                </View>

                <TouchableOpacity style={styles.arrowButton}>
                  <Ionicons name="arrow-forward" size={30} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.heartButton}>
                  <Ionicons name="heart-outline" size={38} color="#FFD75E" />
                </TouchableOpacity>

                <View style={styles.placeOverlay}>
                  <View style={styles.placeNameRow}>
                    <Ionicons name="location-sharp" size={32} color="#F28C2E" />
                    <Text style={styles.placeName}>{place.name}</Text>
                  </View>

                  <View style={styles.addressBox}>
                    <Text style={styles.addressText}>{place.address}</Text>
                  </View>

                  <Text style={styles.moodText}>{place.mood}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.navButton, active && styles.activeNavButton]}>
      <Ionicons name={icon} size={36} color="#F28C2E" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDE8",
  },

  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 28,
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    width: 95,
    height: 75,
  },

  searchBox: {
    flex: 1,
    height: 58,
    borderRadius: 30,
    backgroundColor: "#FFFFF4",
    borderWidth: 1.5,
    borderColor: "#9BC9E8",
    marginHorizontal: 14,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  searchText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#222222",
  },

  profileArea: {
    width: 58,
    alignItems: "center",
  },

  profileName: {
    fontSize: 12,
    color: "#333333",
    marginTop: 2,
  },

  resultList: {
    marginTop: 28,
    gap: 24,
  },

  resultCard: {
    height: 260,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#FFFFF4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
  },

  cardBackground: {
    flex: 1,
    backgroundColor: "#EAF1E4",
    justifyContent: "flex-end",
    position: "relative",
  },

  placeholderIconBox: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  placeholderText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#6FA8DC",
  },

  arrowButton: {
    position: "absolute",
    top: 28,
    right: 18,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(160, 160, 160, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  heartButton: {
    position: "absolute",
    top: 92,
    right: 22,
  },

  placeOverlay: {
    paddingLeft: 34,
    paddingRight: 24,
    paddingBottom: 24,
  },

  placeNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  placeName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#333333",
    marginLeft: 4,
  },

  addressBox: {
    backgroundColor: "#FFD75E",
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginTop: 6,
  },

  addressText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#333333",
  },

  moodText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
    color: "#444444",
    lineHeight: 19,
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