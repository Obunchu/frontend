import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Alert,
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

          <TouchableOpacity
            style={styles.profileArea}
            onPress={() => {
              setProfileMenuVisible(!profileMenuVisible);
              setProfileEditMenuVisible(false);
              setAccountMenuVisible(false);
            }}
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

        <View style={styles.resultList}>
          {mockResults.map((place) => (
            <TouchableOpacity key={place.id} style={styles.resultCard}>
              <View style={styles.cardBackground}>
                <View style={styles.placeholderIconBox}>
                  <Ionicons name="image-outline" size={82} color="#6FA8DC" />
                  <Text style={styles.placeholderText}>장소 이미지</Text>
                </View>

                <TouchableOpacity
                  style={styles.arrowButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    router.push({
                      pathname: "/detail",
                      params: {
                        title: place.name,
                        firstimage: "",
                        overview: place.mood,
                        region: place.address,
                        sub_title: `${place.name}에서 느끼는 고요한 여유`,
                      },
                    });
                  }}
                >
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
              onPress={() => {
                setProfileEditMenuVisible(!profileEditMenuVisible);
                setAccountMenuVisible(false);
              }}
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
              onPress={() => {
                setAccountMenuVisible(!accountMenuVisible);
                setProfileEditMenuVisible(false);
              }}
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
    paddingHorizontal: 22,
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
    top: 186,
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