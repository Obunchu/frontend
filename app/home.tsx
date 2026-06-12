import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.78;
const CARD_SPACING = 18;

type OverseasPlace = {
  id: string;
  country: string;
  city: string;
  mood: string;
  description: string;
  backgroundColor: string;
  localImage: any;
};

const overseasPlaces: OverseasPlace[] = [
  {
    id: "1",
    country: "일본",
    city: "교토시, 카엔지",
    mood: "고즈넉한",
    description: "전통적이고 차분한 분위기",
    backgroundColor: "#DDECF8",
    localImage: require("../assets/images/kyoto.jpg"),
  },
  {
    id: "2",
    country: "프랑스",
    city: "파리",
    mood: "낭만적인",
    description: "감성적이고 로맨틱한 분위기",
    backgroundColor: "#F6E3E8",
    localImage: require("../assets/images/paris.jpg"),
  },
  {
    id: "3",
    country: "스위스",
    city: "인터라켄",
    mood: "청량한",
    description: "맑고 자연적인 분위기",
    backgroundColor: "#DFF1EA",
    localImage: require("../assets/images/interlaken.jpg"),
  },
  {
    id: "4",
    country: "인도네시아",
    city: "발리",
    mood: "이국적인",
    description: "휴양지 느낌의 여유로운 분위기",
    backgroundColor: "#F8E7C8",
    localImage: require("../assets/images/bali.jpg"),
  },
];

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [nickname, setNickname] = useState("");

  // 페이지가 포커스될 때마다 변경된 정보를 반영하기 위해 상태 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      const savedNickname = await SecureStore.getItemAsync("nickname");

      if (savedNickname) setNickname(savedNickname);
    };

    loadUserInfo();
  }, []);

  const handleCardScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(index);
  };

  const goToRecommendResult = (localImageModule: any) => {
    const asset = Image.resolveAssetSource(localImageModule);
    const imageUri = asset ? asset.uri : "";

    router.push({
      pathname: "/image-search",
      params: { imageUri },
    });
  };

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

      setUploadedImage(imageUri);
      setUploading(true);

      setTimeout(() => {
        setUploading(false);

        router.push({
          pathname: "/image-search",
          params: { imageUri },
        });
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

          {/* 프로필 아이콘 누르면 설정(setting) 페이지로 이동 */}
          <TouchableOpacity
            style={styles.profileArea}
            onPress={() => router.push("/setting")}
            activeOpacity={0.75}
          >
              <Ionicons name="person-circle-outline" size={48} color="#263A56" />
            <Text style={styles.profileName}>{nickname || "수정"}님</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons
            name="weather-partly-cloudy"
            size={27}
            color="#2C2C2C"
          />
          <Text style={styles.sectionTitle}>오늘의 분위기 여행지 추천</Text>
        </View>

        <View style={styles.recommendWrapper}>
          <FlatList
            data={overseasPlaces}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            decelerationRate="fast"
            bounces={false}
            onScroll={handleCardScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.cardList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.overseasCard}
                onPress={() => goToRecommendResult(item.localImage)}
              >
                <View
                  style={[
                    styles.overseasImagePlaceholder,
                    { backgroundColor: item.backgroundColor },
                  ]}
                >
                  {item.localImage ? (
                    <Image
                      source={item.localImage}
                      style={styles.overseasImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="image-outline" size={78} color="#6FA8DC" />
                  )}

                  <Text
                    style={[
                      styles.overseasMood,
                      { color: item.localImage ? "#FFFFFF" : "#7A7A72" },
                    ]}
                  >
                    #{item.mood}
                  </Text>
                  <Text
                    style={[
                      styles.overseasDescription,
                      { color: item.localImage ? "#FFFFFF" : "#7A7A72" },
                    ]}
                  >
                    {item.description}
                  </Text>
                </View>

                <View style={styles.overseasTextArea}>
                  <Ionicons name="location-sharp" size={30} color="#F28C2E" />
                  <Text
                    style={[
                      styles.overseasTitle,
                      { color: item.localImage ? "#FFFFFF" : "#7A7A72" },
                    ]}
                  >
                    {item.country}, {item.city}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />

          <View style={styles.dotsContainer}>
            {overseasPlaces.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, activeIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        <View style={styles.uploadTitleRow}>
          <Text style={styles.uploadIcon}>📷</Text>
          <Text style={styles.uploadTitle}>직접 이미지 업로드하기</Text>
        </View>

        <TouchableOpacity
          style={styles.uploadBox}
          onPress={pickImage}
          disabled={uploading}
          activeOpacity={0.85}
        >
          {uploadedImage ? (
            <>
              <Image
                source={{ uri: uploadedImage }}
                style={styles.uploadedImage}
              />

              {uploading && (
                <View style={styles.uploadOverlay}>
                  <Text style={styles.uploadText}>
                    업로드한 사진과 비슷한 감성 여행지 찾는 중
                  </Text>

                  <ActivityIndicator
                    size="large"
                    color="#F28C2E"
                    style={styles.uploadLoading}
                  />
                </View>
              )}
            </>
          ) : (
            <View style={styles.uploadInner}>
              <Ionicons name="image-outline" size={70} color="#F28C2E" />
              <Text style={styles.uploadText}>사진을 선택해주세요</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.keywordTitleRow}>
          <Ionicons name="search-outline" size={31} color="#2C2C2C" />
          <Text style={styles.keywordTitle}>감성 키워드로 검색하기</Text>
        </View>

        <TouchableOpacity
          style={styles.keywordButton}
          onPress={() => router.push("/keyword-search")}
          activeOpacity={0.85}
        >
          <Text style={styles.keywordButtonText}>키워드로 검색하기</Text>
          <Ionicons
            name="arrow-forward-circle-outline"
            size={28}
            color="#F49A36"
            style={styles.keywordButtonArrow}
          />
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavButton icon="home-outline" active onPress={() => router.push("/home")} />
        <NavButton icon="location-outline" onPress={() => router.push("/map")} />
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
  profileArea: {
    width: 58,
    alignItems: "center",
  },
  profileName: {
    fontSize: 12,
    color: "#333333",
    marginTop: 2,
  },
  headerProfileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#263A56",
    backgroundColor: "#FFFDE8",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#2C2C2C",
    marginLeft: 8,
  },
  recommendWrapper: {
    alignItems: "center",
  },
  cardList: {
    paddingRight: 0,
  },
  overseasImage: {
    width: "100%",
    height: "100%",
    borderRadius: 26,
    position: "absolute",
  },
  overseasCard: {
    width: CARD_WIDTH,
    height: 300,
    borderRadius: 34,
    backgroundColor: "#FFFFFF",
    marginRight: CARD_SPACING,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  overseasImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overseasMood: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "900",
    color: "#333333",
  },
  overseasDescription: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#555555",
  },
  overseasTextArea: {
    position: "absolute",
    left: 25,
    bottom: 26,
    flexDirection: "row",
    alignItems: "center",
  },
  overseasTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: "#333333",
    marginLeft: 3,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#E1C45E",
    marginHorizontal: 5,
    opacity: 0.45,
  },
  activeDot: {
    width: 23,
    borderRadius: 8,
    opacity: 1,
    backgroundColor: "#FFC928",
  },
  uploadTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 34,
    marginBottom: 15,
  },
  uploadIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  uploadTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#2C2C2C",
  },
  uploadBox: {
    width: "100%",
    height: 170,
    borderRadius: 30,
    backgroundColor: "#FFFFF4",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFD75E",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#777777",
    textAlign: "center",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 253, 232, 0.88)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  uploadLoading: {
    marginTop: 14,
  },
  keywordTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 34,
    marginBottom: 15,
  },
  keywordTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#2C2C2C",
    marginLeft: 8,
  },
  keywordButton: {
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FFFFF4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  keywordButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333333",
  },
  keywordButtonArrow: {
    position: "absolute",
    right: 24,
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