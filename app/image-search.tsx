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
  similarity: number;
  tags: string[];
  mood: string;
};

const mockPlaces: Place[] = [
  {
    id: "1",
    name: "수원화성",
    address: "경기도 수원시 장안구 영화동 320-2",
    similarity: 92,
    tags: ["웅장한", "고즈넉한", "산책"],
    mood: "성곽길과 도시 풍경이 어우러진 고즈넉한 분위기",
  },
  {
    id: "2",
    name: "북촌한옥마을",
    address: "서울 종로구 계동길 37",
    similarity: 89,
    tags: ["전통", "차분한", "골목"],
    mood: "한옥과 골목길이 어우러진 차분한 분위기",
  },
  {
    id: "3",
    name: "남산공원",
    address: "서울특별시 중구 삼일대로 231",
    similarity: 86,
    tags: ["전망좋은", "도심", "야경"],
    mood: "도심 속에서 전망을 즐길 수 있는 여유로운 분위기",
  },
];

export default function ImageSearchScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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

        {imageUri && (
          <View style={styles.selectedImageBox}>
            <Image source={{ uri: imageUri }} style={styles.selectedImage} />
          </View>
        )}

        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>비슷한 감성 여행지</Text>
          <Text style={styles.resultCount}>{mockPlaces.length}개의 장소</Text>
        </View>

        {mockPlaces.map((place, index) => (
          <TouchableOpacity key={place.id} style={styles.listCard}>
            <View style={styles.rankCircle}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>

            <View style={styles.listContent}>
              <View style={styles.placeTitleRow}>
                <Ionicons name="location-sharp" size={24} color="#F28C2E" />
                <Text style={styles.placeName}>{place.name}</Text>
              </View>

              <View style={styles.addressBox}>
                <Text style={styles.addressText}>{place.address}</Text>
              </View>

              <Text style={styles.moodText}>{place.mood}</Text>

              <Text style={styles.matchText}>
                업로드한 사진과의 유사도 {place.similarity}%
              </Text>

              <Text style={styles.tagText}>
                {place.tags.map((tag) => `#${tag}`).join(" ")}
              </Text>
            </View>

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
      </ScrollView>

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
  container: {
    flex: 1,
    backgroundColor: "#FFFDE8",
  },

  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 28,
    paddingBottom: 130,
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

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2C2C2C",
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

  selectedImageBox: {
    marginTop: 28,
    width: "100%",
    height: 210,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#EEE9D0",
  },

  selectedImage: {
    width: "100%",
    height: "100%",
  },

  resultHeader: {
    marginTop: 30,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2C2C2C",
  },

  resultCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8A866F",
  },

  listCard: {
    backgroundColor: "#FFFFF4",
    borderRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 4,
  },

  rankCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFD75E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 4,
  },

  rankText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#333333",
  },

  listContent: {
    flex: 1,
  },

  placeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  placeName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#202020",
    marginLeft: 4,
  },

  addressBox: {
    backgroundColor: "#FFD75E",
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },

  addressText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333333",
  },

  moodText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
    lineHeight: 19,
  },

  matchText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: "#555555",
  },

  tagText: {
    marginTop: 4,
    fontSize: 12,
    color: "#333333",
  },

  rightArea: {
    alignItems: "center",
    marginLeft: 8,
    paddingTop: 2,
  },

  chevron: {
    marginTop: 34,
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