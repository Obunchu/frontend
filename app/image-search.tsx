import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

type Place = {
  id: number;
  image_id: string;
  place_name: string;
  region: string;
  season: string;
  time: string;
  weather: string;
  scene: string;
  primary_mood: string;
  secondary_mood: string;
  caption: string;
  content_id: number;
  similarity: number;
  firstimage?: string | null;
  overview?: string | null;
};

export default function ImageSearchScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profileEditMenuVisible, setProfileEditMenuVisible] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);

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

  useEffect(() => {
    if (imageUri) fetchRecommendations(imageUri);
  }, [imageUri]);

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

  async function fetchRecommendations(uri: string) {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "query.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(`${API_URL}/recommend?top_k=5`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail ?? "서버 오류");
      }

      const data = await response.json();
      setPlaces(data.results);
    } catch (e: any) {
      setError(e.message ?? "알 수 없는 오류");
      Alert.alert("오류", e.message ?? "추천을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const handleBookmark = async (place: Place) => {
    if (!userId) return;

    const isLiked = likedMap[place.id];

    setLikedMap((prev) => ({
      ...prev,
      [place.id]: !isLiked,
    }));

    await fetch(`${process.env.EXPO_PUBLIC_API_URL}/bookmarks/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        content_id: place.content_id,
        place_name: place.place_name,
      }),
    });
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

          <Text style={styles.title}>이미지 검색 결과</Text>

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

        {imageUri && (
          <View style={styles.selectedImageBox}>
            <Image source={{ uri: imageUri }} style={styles.selectedImage} />
          </View>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#F28C2E" />
            <Text style={styles.loadingText}>감성 분석 중...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => imageUri && fetchRecommendations(imageUri)}
            >
              <Text style={styles.retryText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && places.length > 0 && (
          <>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>비슷한 감성 여행지</Text>
              <Text style={styles.resultCount}>{places.length}개의 장소</Text>
            </View>

            {places.map((place, index) => (
              <TouchableOpacity
                key={place.id}
                style={styles.listCard}
                onPress={() =>
                  router.push({
                    pathname: "/detail",
                    params: {
                      place: JSON.stringify(place),
                    },
                  })
                }
              >
                {place.firstimage ? (
                  <Image
                    source={{ uri: place.firstimage }}
                    style={styles.placeImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeImageFallback}>
                    <Ionicons name="image-outline" size={36} color="#C4BFA3" />
                  </View>
                )}

                <View style={styles.cardBody}>
                  <View style={styles.placeTitleRow}>
                    <View style={styles.rankCircle}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>

                    <Ionicons name="location-sharp" size={20} color="#F28C2E" />

                    <Text style={styles.placeName} numberOfLines={1}>
                      {place.place_name}
                    </Text>
                  </View>

                  <View style={styles.addressBox}>
                    <Text style={styles.addressText}>{place.region}</Text>
                  </View>

                  <Text style={styles.moodText} numberOfLines={2}>
                    {place.overview}
                  </Text>

                  <Text style={styles.matchText}>
                    업로드한 사진과의 유사도 {place.similarity}%
                  </Text>

                  <Text style={styles.tagText}>
                    {[place.primary_mood, place.secondary_mood, place.scene]
                      .filter((tag) => tag && tag !== "nan")
                      .map((tag) => `#${tag}`)
                      .join(" ")}
                  </Text>
                </View>

                <View style={styles.rightArea}>
                  <TouchableOpacity onPress={() => handleBookmark(place)}>
                    <Ionicons
                      name={likedMap[place.id] ? "heart" : "heart-outline"}
                      size={34}
                      color={likedMap[place.id] ? "#FF4D6D" : "#FFD75E"}
                    />
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
          </>
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

  loadingBox: {
    marginTop: 60,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },

  errorBox: {
    marginTop: 40,
    alignItems: "center",
  },

  errorText: {
    fontSize: 14,
    color: "#c0392b",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    backgroundColor: "#F28C2E",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },

  retryText: {
    color: "#fff",
    fontWeight: "700",
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
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 4,
  },

  placeImage: {
    width: "100%",
    height: 150,
  },

  placeImageFallback: {
    width: "100%",
    height: 150,
    backgroundColor: "#EEE9D0",
    alignItems: "center",
    justifyContent: "center",
  },

  cardBody: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  placeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFD75E",
    alignItems: "center",
    justifyContent: "center",
  },

  rankText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#333333",
  },

  placeName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#202020",
    flex: 1,
  },

  addressBox: {
    backgroundColor: "#FFD75E",
    borderRadius: 18,
    paddingVertical: 5,
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
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
    lineHeight: 19,
  },

  matchText: {
    marginTop: 6,
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
    position: "absolute",
    top: 160,
    right: 16,
    alignItems: "center",
  },

  chevron: {
    marginTop: 8,
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