import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

type Place = {
  content_id: string;
  place_name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  address: string;
  firstimage: string;
};

const PASTEL_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f5f0e8" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b7355" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#fdf8f0" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#d4c4a8" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b8a898" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#e8f0d8" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#dcecd4" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8b9e78" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#c8e0b4" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7a9e68" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e8ddd0" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#fce8c8" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#f0d4a8" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a0845c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#e8e0d4" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a09080" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#b8d8e8" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7098b0" }],
  },
];

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);

  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

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

  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);

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
    getCurrentLocation();
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

  const getCurrentLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setRegion({
          latitude: 37.5665,
          longitude: 126.978,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.035,
        longitudeDelta: 0.035,
      });

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/places/nearby?lat=${latitude}&lng=${longitude}&radius_km=1.0`
      );

      const data = await res.json();
      setNearbyPlaces(data);
    } catch (error) {
      setRegion({
        latitude: 37.5665,
        longitude: 126.978,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });
    } finally {
      setLoading(false);
    }
  };

  const places: Place[] = nearbyPlaces.map((item) => ({
    place_name: item.place_name,
    content_id: String(item.content_id),
    latitude: item.latitude,
    longitude: item.longitude,
    distance_km: item.distance_km,
    address: item.address,
    firstimage: item.firstimage,
  }));

  const moveToPlace = (place: Place) => {
    const nextRegion = {
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };

    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#A8A8A8" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#A8A8A8"
            style={styles.searchInput}
          />
        </View>

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

      <View style={styles.mapArea}>
        {loading || !region ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#F28C2E" />
            <Text style={styles.loadingText}>현재 위치를 불러오는 중...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton
            customMapStyle={PASTEL_MAP_STYLE}
          >
            {places.map((place) => (
              <Marker
                key={place.content_id}
                coordinate={{
                  latitude: place.latitude,
                  longitude: place.longitude,
                }}
                title={place.place_name}
              />
            ))}
          </MapView>
        )}
      </View>

      <View style={styles.placeCardArea}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.placeCardContent}
        >
          {places.map((place) => (
            <TouchableOpacity
              key={place.content_id}
              style={styles.placeCard}
              onPress={() => moveToPlace(place)}
              activeOpacity={0.85}
            >
              {place.firstimage ? (
                <Image
                  source={{ uri: place.firstimage }}
                  style={styles.cardImage}
                />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="image-outline" size={36} color="#6FA8DC" />
                </View>
              )}

              <View style={styles.cardTextArea}>
                <Text style={styles.cardTitle}>{place.place_name}</Text>
                <Text style={styles.cardAddress}>주소: {place.address}</Text>
                <Text style={styles.cardDistance}>
                  {place.distance_km * 1000}m 떨어진 거리에 있어요!
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
        <NavButton icon="location-outline" active />
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
      <Ionicons name={icon} size={34} color="#F28C2E" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDE8",
  },

  topArea: {
    paddingTop: 45,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  logo: {
    width: 95,
    height: 75,
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

  mapArea: {
    marginHorizontal: 28,
    height: 460,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#E8E8E8",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#555555",
  },

  placeCardArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 110,
  },

  placeCardContent: {
    paddingHorizontal: 28,
  },

  placeCard: {
    width: width * 0.4,
    height: 150,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFF4",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
  },

  cardImagePlaceholder: {
    height: 58,
    backgroundColor: "#EAF1E4",
    alignItems: "center",
    justifyContent: "center",
  },

  cardTextArea: {
    padding: 8,
  },

  cardTitle: {
    color: "#333333",
    fontSize: 15,
    fontWeight: "900",
  },

  cardAddress: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "700",
    color: "#555555",
  },

  cardDistance: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "900",
    color: "#ffc374",
  },

  cardMood: {
    marginTop: 4,
    fontSize: 10,
    color: "#777777",
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

  cardImage: {
    height: 58,
    width: "100%",
  },
});