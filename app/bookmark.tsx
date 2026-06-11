import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
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
  View
} from "react-native";
// react-native-maps 라이브러리 추가
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

import * as SecureStore from "expo-secure-store";

type BookmarkMode = "list" | "map";

type Bookmark = {
  place_name: string;
  content_id: number;
  created_at: string;
  firstimage: string | null;
};

export default function BookmarkScreen() {
  const [mode, setMode] = useState<BookmarkMode>("list");
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profileEditMenuVisible, setProfileEditMenuVisible] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
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
    const loadAndFetch = async () => {
      const userId = await SecureStore.getItemAsync("user_id");
      const nickname = await SecureStore.getItemAsync("nickname");
      const profileImageUri = await SecureStore.getItemAsync("profile_image_uri");

      if (userId) setUserId(userId);
      if (nickname) setNickname(nickname);
      if (profileImageUri) setProfileImageUri(profileImageUri);

      if (userId) {
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/bookmarks/find?user_id=${userId}`
        );

        const data = await res.json();
        setBookmarks(Array.isArray(data.results) ? data.results : []);
      }
    };

    loadAndFetch();
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

  const bookmarkPlaces: Bookmark[] = bookmarks.map((item) => ({
    place_name: item.place_name,
    content_id: item.content_id,
    created_at: item.created_at,
    firstimage: item.firstimage,
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topArea}>
          <View style={styles.logoArea}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>나의 북마크</Text>

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
              <Ionicons name="person-circle-outline" size={44} color="#263A56" />
            )}

            <Text style={styles.profileName}>{nickname || "수정"}님</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modeTabs}>
          <TouchableOpacity onPress={() => setMode("list")}>
            <Text
              style={[
                styles.modeText,
                mode === "list" && styles.activeModeText,
              ]}
            >
              리스트형
            </Text>
          </TouchableOpacity>

          <Text style={styles.divider}>|</Text>

          <TouchableOpacity onPress={() => setMode("map")}>
            <Text
              style={[
                styles.modeText,
                mode === "map" && styles.activeModeText,
              ]}
            >
              지도형
            </Text>
          </TouchableOpacity>
        </View>

        {mode === "list" ? (
          <BookmarkList places={bookmarkPlaces} />
        ) : (
          <BookmarkMap />
        )}
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
        <NavButton icon="home-outline" onPress={() => router.push("/home")} />
        <NavButton icon="location-outline" onPress={() => router.push("/map")} />
        <NavButton icon="heart-outline" active />
      </View>
    </View>
  );
}

function BookmarkList({ places }: { places: Bookmark[] }) {
  if (places.length === 0) {
    return (
      <View style={styles.emptyArea}>
        <Ionicons name="heart-outline" size={48} color="#CCCCCC" />
        <Text style={styles.emptyText}>아직 북마크한 장소가 없어요</Text>
      </View>
    );
  }

  return (
    <View style={styles.listArea}>
      {places.map((item) => (
        <View key={item.content_id} style={styles.bookmarkCard}>
          {item.firstimage ? (
            <Image source={{ uri: item.firstimage }} style={styles.imagePlaceholder} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageText}>장소 이미지</Text>
            </View>
          )}

          <TouchableOpacity style={styles.heartButton}>
            <Ionicons name="heart" size={34} color="#F28C2E" />
          </TouchableOpacity>

          <View style={styles.cardBottom}>
            <View style={styles.placeNameRow}>
              <Ionicons name="location" size={28} color="#F28C2E" />
              <Text style={styles.placeName}>{item.place_name}</Text>
            </View>

            <View style={styles.addressBadge}>
              <Text style={styles.addressText}>
                {new Date(item.created_at).toLocaleDateString("ko-KR")}
              </Text>
            </View>

            <TouchableOpacity style={styles.arrowButton}>
              <Ionicons name="arrow-forward" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

function BookmarkMap() {
  return (
    <View style={styles.mapModeArea}>
      <View style={styles.mapPlaceholder}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: 37.5665,
            longitude: 126.978,
            latitudeDelta: 0.16,
            longitudeDelta: 0.16,
          }}
        />
      </View>

      <View style={styles.mapCard}>
        <View style={styles.mapCardImage}>
          <Text style={styles.mapCardTitle}>덕수궁 돌담길</Text>
          <View style={styles.mapAddressBadge}>
            <Text style={styles.addressText}>
              서울 중구 세종대로19길 24 영국대사관
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.mapHeartButton}>
          <Ionicons name="heart" size={34} color="#F28C2E" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.mapArrowButton}>
          <Ionicons name="arrow-forward" size={28} color="#FFFFFF" />
        </TouchableOpacity>
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
  },

  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 26,
    paddingBottom: 130,
  },

  topArea: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
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

  modeTabs: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 14,
  },

  modeText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "600",
  },

  activeModeText: {
    color: "#F28C2E",
  },

  divider: {
    marginHorizontal: 8,
    color: "#333333",
  },

  listArea: {
    gap: 28,
  },

  bookmarkCard: {
    height: 245,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#D9D9D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },

  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#9EA8AF",
    alignItems: "center",
    justifyContent: "center",
  },

  imageText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#69747C",
  },

  heartButton: {
    position: "absolute",
    top: 24,
    right: 20,
  },

  cardBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  placeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  placeName: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  addressBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFD957",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },

  addressText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333333",
  },

  arrowButton: {
    position: "absolute",
    right: 18,
    bottom: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(80,80,80,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  mapModeArea: {
    position: "relative",
  },

  mapPlaceholder: {
    width: "100%",
    height: 540,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#E2E2E2",
    alignItems: "center",
    justifyContent: "center",
  },

  mapText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#8C8C8C",
  },

  mapCard: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 28,
    height: 210,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#9EA8AF",
  },

  mapCardImage: {
    flex: 1,
    justifyContent: "flex-end",
    paddingLeft: 22,
    paddingBottom: 18,
  },

  mapCardTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 8,
  },

  mapAddressBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFD957",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },

  mapHeartButton: {
    position: "absolute",
    top: 20,
    right: 18,
  },

  mapArrowButton: {
    position: "absolute",
    right: 18,
    bottom: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(80,80,80,0.55)",
    alignItems: "center",
    justifyContent: "center",
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

  emptyArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },

  emptyText: {
    fontSize: 16,
    color: "#AAAAAA",
    fontWeight: "600",
  },
});