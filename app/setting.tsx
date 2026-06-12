import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingScreen() {
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");

  // 모달 상태 관리
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // 입력 값 상태 관리
  const [newNickname, setNewNickname] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  // 로딩 상태
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      const savedUserId = await SecureStore.getItemAsync("user_id");
      const savedNickname = await SecureStore.getItemAsync("nickname");
      if (savedUserId) setUserId(savedUserId);
      if (savedNickname) setNickname(savedNickname);
    };
    loadUserInfo();
  }, []);

  // 1. 이름 변경 프로세스
  const handleNicknameChange = async () => {
    const trimmed = newNickname.trim();
    if (!trimmed) {
      Alert.alert("이름 변경", "변경할 이름을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/${userId}/nickname`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ nickname: trimmed }),
        }
      );

      if (!response.ok) throw new Error("이름 변경에 실패했습니다.");

      setNickname(trimmed);
      await SecureStore.setItemAsync("nickname", trimmed);
      setNameModalVisible(false);
      Alert.alert("완료", "이름이 성공적으로 변경되었습니다.");
    } catch (error) {
      Alert.alert("오류", "이름 변경 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 2. 비밀번호 변경 프로세스 (새로 추가된 기능)
  const handlePasswordChange = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      Alert.alert("비밀번호 변경", "기존 비밀번호와 새 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/${userId}/password`, // 필요시 백엔드 엔드포인트 규격에 맞춰 조정하세요.
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            currentPassword: currentPassword.trim(),
            newPassword: newPassword.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error("비밀번호 변경에 실패했습니다.");

      setPasswordModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("완료", "비밀번호가 안전하게 변경되었습니다.");
    } catch (error) {
      Alert.alert("오류", "비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 3. 로그아웃 프로세스
  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("user_id");
          await SecureStore.deleteItemAsync("nickname");
          await SecureStore.deleteItemAsync("profile_image_uri");
          router.replace("/login");
        },
      },
    ]);
  };

  // 4. 회원 탈퇴 프로세스
  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      Alert.alert("회원 탈퇴", "본인 확인을 위해 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ password: deletePassword.trim() }),
        }
      );

      if (!response.ok) throw new Error("회원 탈퇴에 실패했습니다.");

      await SecureStore.deleteItemAsync("user_id");
      await SecureStore.deleteItemAsync("nickname");
      await SecureStore.deleteItemAsync("profile_image_uri");

      setDeleteModalVisible(false);
      Alert.alert("탈퇴 완료", "그동안 서비스를 이용해 주셔서 감사합니다.");
      router.replace("/login");
    } catch (error) {
      Alert.alert("탈퇴 실패", "비밀번호가 일치하지 않거나 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 커스텀 상단 네비게이션 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={30} color="#2C2C2C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 프로필 편집 섹션 */}
        <Text style={styles.sectionHeader}>프로필 편집</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setNewNickname(nickname);
              setNameModalVisible(true);
            }}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="text-outline" size={22} color="#263A56" />
              <Text style={styles.menuText}>이름 변경</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#7A7A72" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => setPasswordModalVisible(true)}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="lock-closed-outline" size={22} color="#263A56" />
              <Text style={styles.menuText}>비밀번호 변경</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#7A7A72" />
          </TouchableOpacity>
        </View>

        {/* 계정 관리 섹션 */}
        <Text style={styles.sectionHeader}>계정 관리</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <Ionicons name="log-out-outline" size={22} color="#F28C2E" />
              <Text style={[styles.menuText, { color: "#F28C2E" }]}>로그아웃</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#7A7A72" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => {
              setDeletePassword("");
              setDeleteModalVisible(true);
            }}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="trash-outline" size={22} color="#D9534F" />
              <Text style={[styles.menuText, { color: "#D9534F" }]}>회원 탈퇴</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#7A7A72" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 모달 레이어 모음 */}
      {/* 1. 이름 변경 모달 */}
      {nameModalVisible && (
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>이름 편집</Text>
            <TextInput
              style={styles.modalInput}
              value={newNickname}
              onChangeText={setNewNickname}
              placeholder="변경할 이름"
              autoFocus
              editable={!loading}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setNameModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleNicknameChange}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "변경 중" : "변경"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* 2. 비밀번호 변경 모달 */}
      {passwordModalVisible && (
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>비밀번호 변경</Text>
            <TextInput
              style={styles.modalInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="현재 비밀번호"
              secureTextEntry
              editable={!loading}
            />
            <TextInput
              style={[styles.modalInput, { marginTop: 10 }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="새 비밀번호"
              secureTextEntry
              editable={!loading}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setCurrentPassword("");
                  setNewPassword("");
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handlePasswordChange}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "변경 중" : "변경"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* 3. 회원 탈퇴 모달 */}
      {deleteModalVisible && (
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>회원 탈퇴</Text>
            <Text style={styles.modalDescription}>
              정말 탈퇴하시겠습니까?{"\n"}비밀번호를 한번 더 입력해 주세요.
            </Text>
            <TextInput
              style={styles.modalInput}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="비밀번호 입력"
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: "#FFA3A3" }]}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                <Text style={[styles.submitButtonText, { color: "#D9534F" }]}>
                  {loading ? "탈퇴 중" : "탈퇴"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDE8", // 홈화면과 동일한 메인 배경 아이보리색
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "#FFFDE8",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2C2C2C",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 15,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: "#7A7A72",
    marginTop: 24,
    marginBottom: 10,
    paddingLeft: 4,
  },
  menuGroup: {
    backgroundColor: "#FFFFF4", // 홈화면 카드/박스 형태의 밝은 미색
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F2DF9B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#FFF0B3",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    width: "80%",
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 244, 0.98)",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2C2C2C",
    marginBottom: 14,
  },
  modalDescription: {
    fontSize: 14,
    color: "#6F6A5E",
    lineHeight: 20,
    marginBottom: 14,
  },
  modalInput: {
    width: "100%",
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFF4BE",
    borderWidth: 1,
    borderColor: "#F2DF9B",
    paddingHorizontal: 18,
    fontSize: 15,
    fontWeight: "700",
    color: "#333333",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 22,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: "#FFF6D1",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7A7A72",
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: "#FFF0B3",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#7A7A72",
  },
});