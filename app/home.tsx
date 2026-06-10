import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState, useEffect } from "react";
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

import * as SecureStore from 'expo-secure-store';

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
};

const overseasPlaces: OverseasPlace[] = [
  {
    id: "1",
    country: "일본",
    city: "교토시, 카엔지",
    mood: "고즈넉한",
    description: "전통적이고 차분한 분위기",
    backgroundColor: "#DDECF8",
  },
  {
    id: "2",
    country: "프랑스",
    city: "파리",
    mood: "낭만적인",
    description: "감성적이고 로맨틱한 분위기",
    backgroundColor: "#F6E3E8",
  },
  {
    id: "3",
    country: "스위스",
    city: "인터라켄",
    mood: "청량한",
    description: "맑고 자연적인 분위기",
    backgroundColor: "#DFF1EA",
  },
  {
    id: "4",
    country: "인도네시아",
    city: "발리",
    mood: "이국적인",
    description: "휴양지 느낌의 여유로운 분위기",
    backgroundColor: "#F8E7C8",
  },
];

export default function HomeScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profileEditMenuVisible, setProfileEditMenuVisible] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const loadUserInfo = async () => {
      const userId = await SecureStore.getItemAsync("user_id");
      const nickname = await SecureStore.getItemAsync("nickname");
      if (userId) setUserId(userId);
      if (nickname) setNickname(nickname);
    };
    loadUserInfo();
  }, []);

  const handleCardScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / (CARD_WIDTH + CARD_SPACING));
    setActiveIndex(index);
  };

  const goToMoodResult = (mood: string) => {
    router.push({
      pathname: "/keyword-result",
      params: {
        mood,
        region: "국내",
      },
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
          params: {
            imageUri,
          },
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

          <TouchableOpacity
            style={styles.profileArea}
            onPress={() => {
              setProfileMenuVisible(!profileMenuVisible);
              setProfileEditMenuVisible(false);
            }}
            activeOpacity={0.75}
          >
            <Ionicons name="person-circle-outline" size={48} color="#263A56" />
            <Text style={styles.profileName}>{nickname}님</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons size={27} color="#2C2C2C" />
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
                onPress={() => goToMoodResult(item.mood)}
              >
                <View
                  style={[
                    styles.overseasImagePlaceholder,
                    { backgroundColor: item.backgroundColor },
                  ]}
                >
                  <Ionicons name="image-outline" size={78} color="#6FA8DC" />
                  <Text style={styles.overseasMood}>#{item.mood}</Text>
                  <Text style={styles.overseasDescription}>
                    {item.description}
                  </Text>
                </View>

                <View style={styles.arrowButton}>
                  <Ionicons name="arrow-forward" size={34} color="#FFFFFF" />
                </View>

                <View style={styles.overseasTextArea}>
                  <Ionicons name="location-sharp" size={30} color="#F28C2E" />
                  <Text style={styles.overseasTitle}>
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
              <Image source={{ uri: uploadedImage }} style={styles.uploadedImage} />

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

      {profileMenuVisible && (
        <>
          <TouchableOpacity
            style={styles.profileMenuBackdrop}
            onPress={() => {
              setProfileMenuVisible(false);
              setProfileEditMenuVisible(false);
              setAccountMenuVisible(false);
            }}
            activeOpacity={1}
          />

          <View style={styles.profileMenu}>
            <View style={styles.profileMenuHeader}>
              <View style={styles.menuIconBox}>
                <Ionicons name="person-circle-outline" size={42} color="#263A56" style={styles.menuIconShadow}/>
              </View>
              <Text style={styles.profileMenuName}>수정</Text>
            </View>

            <TouchableOpacity
              style={styles.profileMenuItem}
              activeOpacity={0.75}
              onPress={() => setProfileEditMenuVisible(!profileEditMenuVisible)}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name="person-outline" size={28} color="#263A56" style={styles.menuIconShadow} />
              </View>
              <Text style={styles.profileMenuText}>프로필 편집</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileMenuItem}
              activeOpacity={0.75}
              onPress={() => {
                setAccountMenuVisible(!accountMenuVisible);
                setProfileEditMenuVisible(false);
              }}
            >
              <View style={styles.menuIconBox}>
                <Ionicons
                  name="person-circle-outline" size={32} color="#263A56" style={styles.menuIconShadow} />
              </View>
              <Text style={styles.profileMenuText}>계정 관리</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuItem} activeOpacity={0.75}>
              <View style={styles.menuIconBox}>
                <Ionicons name="chatbox-ellipses-outline" size={28} color="#263A56" style={styles.menuIconShadow} />
              </View>
              <Text style={styles.profileMenuText}>피드백 보내기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileMenuItem} activeOpacity={0.75}>
              <View style={styles.menuIconBox}>
                <Ionicons name="information-circle-outline" size={30} color="#263A56" style={styles.menuIconShadow} />
              </View>
              <Text style={styles.profileMenuText}>사용 가이드</Text>
            </TouchableOpacity>
          </View>

          {profileEditMenuVisible && (
            <View style={styles.profileEditMenu}>
              <View style={styles.profileEditMenuItem}>
                <View style={styles.menuIconBox}>
                  <Ionicons name="person-outline" size={28} color="#263A56" style={styles.menuIconShadow} />
                </View>
                <Text style={styles.profileMenuText}>프로필 편집</Text>
              </View>

              <TouchableOpacity style={styles.profileEditOption} activeOpacity={0.75}>
                <Text style={styles.profileEditOptionText}>이름 변경</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.profileEditOption} activeOpacity={0.75}>
                <Text style={styles.profileEditOptionText}>프로필 사진 변경</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.profileEditOption} activeOpacity={0.75}>
                <Text style={styles.profileEditOptionText}>프로필 사진 삭제</Text>
              </TouchableOpacity>
            </View>
          )}

          {accountMenuVisible && (
            <View style={styles.accountMenu}>
              <View style={styles.accountMenuItem}>
                <View style={styles.menuIconBox}>
                  <Ionicons
                    name="person-circle-outline"
                    size={32}
                    color="#263A56"
                    style={styles.menuIconShadow}
                  />
                </View>
                <Text style={styles.profileMenuText}>계정 관리</Text>
              </View>

              <TouchableOpacity style={styles.accountOption} activeOpacity={0.75}>
                <Text style={styles.accountOptionText}>로그아웃</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.accountOption} activeOpacity={0.75}>
                <Text style={styles.accountOptionText}>백업 이메일 추가</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.accountOption} activeOpacity={0.75}>
                <Text style={styles.accountOptionText}>회원 탈퇴</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.accountOption} activeOpacity={0.75}>
                <Text style={styles.accountOptionText}>about</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

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
    width: 105,
    height: 78,
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


  profileMenuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },

  profileMenu: {
    position: "absolute",
    top: 86,
    right: 18,
    width: 200,
    height: 252,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 244, 0.85)",
    paddingTop: 16,
    paddingHorizontal: 17,
    zIndex: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
  },

  profileMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  profileMenuName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2C2C2C",
  },

  profileMenuItem: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
  },

  menuIconBox: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },

  menuIconShadow: {
  textShadowColor: "rgba(38, 58, 86, 0.35)",
  textShadowOffset: { width: 1.5, height: 2 },
  textShadowRadius: 2.5,  
  },  

  profileMenuText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#7A7A72",
  },

  profileEditMenu: {
    position: "absolute",
    top: 144,
    right: 13,
    width: 205,
    height: 210,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 244, 0.88)",
    paddingTop: 18,
    paddingLeft: 17,
    paddingRight: 17,
    zIndex: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 10,
  },

  profileEditMenuItem: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  profileEditOption: {
    height: 42,
    justifyContent: "center",
    paddingLeft: 20,
  },

  profileEditOptionText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#7A7A72",
  },

  accountMenu: {
  position: "absolute",
  top: 186,
  right: 13,
  width: 205,
  height: 250,
  borderRadius: 26,
  backgroundColor: "rgba(255, 255, 244, 0.88)",
  paddingTop: 18,
  paddingLeft: 17,
  paddingRight: 17,
  zIndex: 40,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 7 },
  shadowOpacity: 0.16,
  shadowRadius: 12,
  elevation: 10,
},

accountMenuItem: {
  height: 42,
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 14,
},

accountOption: {
  height: 42,
  justifyContent: "center",
  paddingLeft: 20,
},

accountOptionText: {
  fontSize: 16,
  fontWeight: "800",
  color: "#7A7A72",
},

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 28,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2D2D2D",
  },

  recommendWrapper: {
    marginHorizontal: -28,
  },

  cardList: {
    paddingLeft: 28,
    paddingRight: 80,
    paddingVertical: 8,
  },

  overseasCard: {
    width: CARD_WIDTH,
    height: 340,
    borderRadius: 34,
    backgroundColor: "#FFFFF4",
    marginRight: CARD_SPACING,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
  },

  overseasImagePlaceholder: {
    flex: 1,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  overseasMood: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "900",
    color: "#263A56",
  },

  overseasDescription: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#555555",
  },

  arrowButton: {
    position: "absolute",
    top: 34,
    right: 30,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(160, 160, 160, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },

  overseasTextArea: {
    position: "absolute",
    left: 32,
    bottom: 32,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
  },

  overseasTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    marginLeft: 4,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5DDB8",
    marginHorizontal: 4,
  },

  activeDot: {
    width: 22,
    backgroundColor: "#FFD75E",
  },

  uploadTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 14,
  },

  uploadIcon: {
    fontSize: 23,
    marginRight: 8,
  },

  uploadTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2C2C2C",
  },

  uploadBox: {
    width: "100%",
    height: 250,
    borderRadius: 26,
    backgroundColor: "#DAD8C5",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadedImage: {
    width: "100%",
    height: "100%",
  },

  uploadOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 253, 232, 0.68)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  uploadInner: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 253, 232, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  uploadText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#333333",
    textAlign: "center",
    lineHeight: 25,
    marginTop: 12,
    marginBottom: 16,
  },

  uploadLoading: {
    marginTop: 4,
  },

  keywordTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 28,
    marginBottom: 14,
  },

  keywordTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2C2C2C",
  },

  keywordButton: {
    height: 58,
    backgroundColor: "#FFE18A",
    borderRadius: 30,
    paddingHorizontal: 26,
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