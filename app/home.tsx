import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  const [nameChangeVisible, setNameChangeVisible] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [changingNickname, setChangingNickname] = useState(false);

  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      const savedUserId = await SecureStore.getItemAsync("user_id");
      const savedNickname = await SecureStore.getItemAsync("nickname");
      const savedProfileImageUri = await SecureStore.getItemAsync(
        "profile_image_uri"
      );

      if (savedUserId) setUserId(savedUserId);
      if (savedNickname) setNickname(savedNickname);
      if (savedProfileImageUri) setProfileImageUri(savedProfileImageUri);
    };

    loadUserInfo();
  }, []);

  const closeAllProfileMenus = () => {
    setProfileMenuVisible(false);
    setProfileEditMenuVisible(false);
    setAccountMenuVisible(false);
  };

  const openProfileMenu = () => {
    setProfileMenuVisible((prev) => !prev);
    setProfileEditMenuVisible(false);
    setAccountMenuVisible(false);
  };

  const openProfileEditMenu = () => {
    setProfileEditMenuVisible(true);
    setAccountMenuVisible(false);
  };

  const openAccountMenu = () => {
    setAccountMenuVisible(true);
    setProfileEditMenuVisible(false);
  };

  const openNameChangeBox = () => {
    setNewNickname(nickname);
    setNameChangeVisible(true);
    setDeleteAccountVisible(false);
    closeAllProfileMenus();
  };

  const closeNameChangeBox = () => {
    if (changingNickname) return;

    setNameChangeVisible(false);
    setNewNickname("");
  };

  const openDeleteAccountBox = () => {
    setDeletePassword("");
    setDeleteAccountVisible(true);
    setNameChangeVisible(false);
    closeAllProfileMenus();
  };

  const closeDeleteAccountBox = () => {
    if (deletingAccount) return;

    setDeleteAccountVisible(false);
    setDeletePassword("");
  };

  const handleChangeNickname = async () => {
    const trimmedNickname = newNickname.trim();

    if (!trimmedNickname) {
      Alert.alert("이름 변경", "변경할 이름을 입력해주세요.");
      return;
    }

    if (!userId) {
      Alert.alert(
        "이름 변경 실패",
        "로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요."
      );
      return;
    }

    try {
      setChangingNickname(true);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/${userId}/nickname`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            nickname: trimmedNickname,
          }),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || "이름 변경에 실패했습니다.");
      }

      setNickname(trimmedNickname);
      await SecureStore.setItemAsync("nickname", trimmedNickname);

      setNameChangeVisible(false);
      setNewNickname("");

      Alert.alert("이름 변경", "이름이 변경되었습니다.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "이름 변경 중 오류가 발생했습니다.";

      Alert.alert("이름 변경 실패", message);
    } finally {
      setChangingNickname(false);
    }
  };

  const handleDeleteAccount = async () => {
    const trimmedPassword = deletePassword.trim();

    if (!trimmedPassword) {
      Alert.alert("회원 탈퇴", "비밀번호를 입력해주세요.");
      return;
    }

    if (!userId) {
      Alert.alert(
        "회원 탈퇴 실패",
        "로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요."
      );
      return;
    }

    try {
      setDeletingAccount(true);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            password: trimmedPassword,
          }),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || "회원 탈퇴에 실패했습니다.");
      }

      await SecureStore.deleteItemAsync("user_id");
      await SecureStore.deleteItemAsync("nickname");
      await SecureStore.deleteItemAsync("profile_image_uri");

      setUserId("");
      setNickname("");
      setProfileImageUri(null);
      setDeletePassword("");
      setDeleteAccountVisible(false);

      Alert.alert("회원 탈퇴", "회원 탈퇴가 완료되었습니다.");
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "회원 탈퇴 중 오류가 발생했습니다.";

      Alert.alert("회원 탈퇴 실패", message);
    } finally {
      setDeletingAccount(false);
    }
  };

  const changeProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "사진 접근 권한",
        "프로필 사진을 변경하려면 사진 접근 권한이 필요합니다."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;

      setProfileImageUri(selectedImageUri);
      await SecureStore.setItemAsync("profile_image_uri", selectedImageUri);

      closeAllProfileMenus();
    }
  };

  const deleteProfilePhoto = async () => {
    if (!profileImageUri) {
      return;
    }

    setProfileImageUri(null);
    await SecureStore.deleteItemAsync("profile_image_uri");

    closeAllProfileMenus();
  };

  const handleLogout = async () => {
    closeAllProfileMenus();

    await SecureStore.deleteItemAsync("user_id");
    await SecureStore.deleteItemAsync("nickname");

    router.replace("/login");
  };

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
            onPress={openProfileMenu}
            activeOpacity={0.75}
          >
            {profileImageUri ? (
              <Image
                source={{ uri: profileImageUri }}
                style={styles.headerProfileImage}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={48} color="#263A56" />
            )}

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

      {profileMenuVisible && (
        <>
          <TouchableOpacity
            style={styles.profileMenuBackdrop}
            onPress={closeAllProfileMenus}
            activeOpacity={1}
          />

          <View style={styles.profileMenu}>
              <View style={styles.profileMenuHeader}>
                <View style={styles.menuIconBox}>
                  {profileImageUri ? (
                    <Image
                      source={{ uri: profileImageUri }}
                      style={styles.menuProfileImage}
                    />
                  ) : (
                    <Ionicons
                      name="person-circle-outline"
                      size={42}
                      color="#263A56"
                      style={styles.menuIconShadow}
                    />
                  )}
                </View>

                <Text style={styles.profileMenuName}>{nickname || "수정"}</Text>
              </View>

              <TouchableOpacity
                style={styles.profileMenuItem}
                activeOpacity={0.75}
                onPress={openProfileEditMenu}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons
                    name="person-outline"
                    size={28}
                    color="#263A56"
                    style={styles.menuIconShadow}
                  />
                </View>
                <Text style={styles.profileMenuText}>프로필 편집</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.profileMenuItem}
                activeOpacity={0.75}
                onPress={openAccountMenu}
              >
                <View style={styles.menuIconBox}>
                  <Ionicons
                    name="person-circle-outline"
                    size={32}
                    color="#263A56"
                    style={styles.menuIconShadow}
                  />
                </View>
                <Text style={styles.profileMenuText}>계정 관리</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.profileMenuItem} activeOpacity={0.75}>
                <View style={styles.menuIconBox}>
                  <Ionicons
                    name="chatbox-ellipses-outline"
                    size={28}
                    color="#263A56"
                    style={styles.menuIconShadow}
                  />
                </View>
                <Text style={styles.profileMenuText}>피드백 보내기</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.profileMenuItem} activeOpacity={0.75}>
                <View style={styles.menuIconBox}>
                  <Ionicons
                    name="information-circle-outline"
                    size={30}
                    color="#263A56"
                    style={styles.menuIconShadow}
                  />
                </View>
                <Text style={styles.profileMenuText}>사용 가이드</Text>
              </TouchableOpacity>
            </View>

          {profileEditMenuVisible && (
            <View style={styles.profileEditMenu}>
              <View style={styles.profileEditMenuItem}>
                <View style={styles.menuIconBox}>
                  <Ionicons
                    name="person-outline"
                    size={28}
                    color="#263A56"
                    style={styles.menuIconShadow}
                  />
                </View>
                <Text style={styles.profileMenuText}>프로필 편집</Text>
              </View>

              <TouchableOpacity
                style={styles.profileEditOption}
                activeOpacity={0.75}
                onPress={openNameChangeBox}
              >
                <Text style={styles.profileEditOptionText}>이름 변경</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.profileEditOption}
                activeOpacity={0.75}
                onPress={changeProfilePhoto}
              >
                <Text style={styles.profileEditOptionText}>프로필 사진 변경</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.profileEditOption}
                activeOpacity={0.75}
                onPress={deleteProfilePhoto}
              >
                <Text style={styles.profileEditOptionText}>프로필 사진 삭제</Text>
              </TouchableOpacity>
            </View>
          )}

          {accountMenuVisible && (
            <View style={styles.accountMenu}>
              <TouchableOpacity
                style={styles.accountOption}
                activeOpacity={0.75}
                onPress={handleLogout}
              >
                <Text style={styles.accountOptionText}>로그아웃</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.accountOption}
                activeOpacity={0.75}
                onPress={openDeleteAccountBox}
              >
                <Text style={styles.accountOptionText}>회원 탈퇴</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.accountOption} activeOpacity={0.75}>
                <Text style={styles.accountOptionText}>about</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {nameChangeVisible && (
        <KeyboardAvoidingView
          style={styles.nameChangeOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            style={styles.nameChangeBackdrop}
            activeOpacity={1}
            onPress={closeNameChangeBox}
          />

          <View style={styles.nameChangeBox}>
            <Text style={styles.nameChangeTitle}>이름 편집</Text>
            <Text style={styles.nameChangeDescription}>이름을 입력하세요</Text>

            <TextInput
              style={styles.nameChangeInput}
              value={newNickname}
              onChangeText={setNewNickname}
              placeholder="변경할 이름"
              placeholderTextColor="#B3AD93"
              autoFocus
              editable={!changingNickname}
              returnKeyType="done"
              onSubmitEditing={handleChangeNickname}
            />

            <View style={styles.nameChangeButtonRow}>
              <TouchableOpacity
                style={styles.nameChangeCancelButton}
                activeOpacity={0.8}
                onPress={closeNameChangeBox}
                disabled={changingNickname}
              >
                <Text style={styles.nameChangeCancelText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nameChangeSubmitButton}
                activeOpacity={0.8}
                onPress={handleChangeNickname}
                disabled={changingNickname}
              >
                <Text style={styles.nameChangeSubmitText}>
                  {changingNickname ? "변경 중" : "변경"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {deleteAccountVisible && (
        <KeyboardAvoidingView
          style={styles.deleteAccountOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            style={styles.deleteAccountBackdrop}
            activeOpacity={1}
            onPress={closeDeleteAccountBox}
          />

          <View style={styles.deleteAccountBox}>
            <Text style={styles.deleteAccountDescription}>
              탈퇴를 원하시면{"\n"}비밀번호를 입력해주세요.
            </Text>

            <TextInput
              style={styles.deleteAccountInput}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder=""
              placeholderTextColor="#B3AD93"
              autoFocus
              editable={!deletingAccount}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleDeleteAccount}
            />

            <View style={styles.deleteAccountButtonRow}>
              <TouchableOpacity
                style={styles.deleteAccountCancelButton}
                activeOpacity={0.8}
                onPress={closeDeleteAccountBox}
                disabled={deletingAccount}
              >
                <Text style={styles.deleteAccountCancelText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteAccountSubmitButton}
                activeOpacity={0.8}
                onPress={handleDeleteAccount}
                disabled={deletingAccount}
              >
                <Text style={styles.deleteAccountSubmitText}>
                  {deletingAccount ? "탈퇴 중" : "탈퇴"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

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

  menuProfileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#263A56",
    backgroundColor: "#FFFDE8",
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
    top: 144,
    right: 13,
    width: 205,
    height: 150,
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

  accountOption: {
    height: 40,
    justifyContent: "center",
    paddingLeft: 20,
  },

  accountOptionText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#7A7A72",
  },

  nameChangeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  nameChangeBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  nameChangeBox: {
    width: "78%",
    minHeight: 188,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 244, 0.94)",
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 12,
  },

  nameChangeTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2C2C2C",
    marginBottom: 8,
  },

  nameChangeDescription: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8A8677",
    marginBottom: 13,
  },

  nameChangeInput: {
    width: "100%",
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF4BE",
    borderWidth: 1,
    borderColor: "#F2DF9B",
    paddingHorizontal: 18,
    fontSize: 16,
    fontWeight: "800",
    color: "#333333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },

  nameChangeButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 20,
  },

  nameChangeCancelButton: {
    width: 96,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF6D1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },

  nameChangeSubmitButton: {
    width: 96,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF0B3",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },

  nameChangeCancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7A7A72",
  },

  nameChangeSubmitText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7A7A72",
  },

  deleteAccountOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 65,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteAccountBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  deleteAccountBox: {
    width: "78%",
    minHeight: 160,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 244, 0.94)",
    paddingTop: 22,
    paddingHorizontal: 24,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 12,
  },

  deleteAccountDescription: {
    fontSize: 15,
    fontWeight: "800",
    color: "#6F6A5E",
    textAlign: "center",
    lineHeight: 25,
    marginBottom: 12,
  },

  deleteAccountInput: {
    width: "100%",
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF4BE",
    borderWidth: 1,
    borderColor: "#F2DF9B",
    paddingHorizontal: 18,
    fontSize: 16,
    fontWeight: "800",
    color: "#333333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },

  deleteAccountButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 20,
  },

  deleteAccountCancelButton: {
    width: 96,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF6D1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },

  deleteAccountSubmitButton: {
    width: 96,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF0B3",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },

  deleteAccountCancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7A7A72",
  },

  deleteAccountSubmitText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7A7A72",
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

  arrowButton: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(160, 160, 160, 0.72)",
    alignItems: "center",
    justifyContent: "center",
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