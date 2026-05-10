import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
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
    name: "남산공원",
    address: "서울특별시 중구 삼일대로 231",
    similarity: 88,
    tags: ["전망좋은", "도심", "야경"],
    mood: "도심 속에서 전망을 즐길 수 있는 차분한 분위기",
  },
  {
    id: "3",
    name: "하늘공원",
    address: "서울특별시 마포구 하늘공원로 95",
    similarity: 84,
    tags: ["자연", "노을", "산책"],
    mood: "넓은 하늘과 자연 풍경이 느껴지는 여유로운 분위기",
  },
];

export default function ImageSearchScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("사진 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;

      setSelectedImage(imageUri);
      setHasSearched(true);
      setLoading(true);
      setPlaces([]);

      setTimeout(() => {
        setPlaces(mockPlaces);
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>이미지 검색</Text>

          <View style={styles.profileArea}>
            <Ionicons name="person-circle-outline" size={48} color="#263A56" />
            <Text style={styles.profileName}>수정님</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
          {selectedImage ? (
            <>
              <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
              <View style={styles.imageOverlay}>
                <Ionicons name="image-outline" size={64} color="#6FA8DC" />
              </View>
            </>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="image-outline" size={74} color="#6FA8DC" />
              <Text style={styles.placeholderText}>이미지를 선택해주세요</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.description}>
          {hasSearched
            ? "업로드한 사진과 비슷한 감성 여행지 찾는 중.."
            : "사진을 업로드하면 비슷한 감성의 여행지를 추천해드려요"}
        </Text>

        {loading && (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color="#6FA8DC" />
          </View>
        )}

        {!loading && places.length > 0 && (
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>추천 결과</Text>
            <Text style={styles.resultCount}>{places.length}개의 장소</Text>
          </View>
        )}

        {!loading &&
          places.map((place, index) => (
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
        <NavButton icon="home-outline" />
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
    fontSize: 24,
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

  uploadBox: {
    marginTop: 28,
    width: "100%",
    height: 275,
    borderRadius: 30,
    backgroundColor: "#EEE9D0",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadedImage: {
    width: "100%",
    height: "100%",
  },

  imageOverlay: {
    position: "absolute",
    width: 92,
    height: 92,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6FA8DC",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 253, 232, 0.25)",
  },

  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "700",
    color: "#5D6B73",
  },

  description: {
    marginTop: 26,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#2C2C2C",
    lineHeight: 26,
  },

  loadingArea: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },

  resultHeader: {
    marginTop: 28,
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