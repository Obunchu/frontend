import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupScreen() {
  const [nickname, setNickname] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [securePassword, setSecurePassword] = useState(true);

  const isPasswordValid =
    password.length >= 8 &&
    /[0-9]/.test(password) &&
    /[a-zA-Z]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password);

  const canSignup = nickname.length > 0 && id.length > 0 && isPasswordValid;

  const handleSignup = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: id,
            nickname,
            password,
          }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.detail);
        return;
      }
  
      alert("회원가입 성공!");
      router.replace("/login");
  
    } catch (error) {
      console.error(error);
      alert("서버 연결 실패");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.logoArea}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formArea}>
          <TextInput
            style={styles.input}
            placeholder="닉네임을 설정해주세요."
            placeholderTextColor="#B9B9B9"
            value={nickname}
            onChangeText={setNickname}
          />

          <TextInput
            style={styles.input}
            placeholder="아이디를 입력해주세요."
            placeholderTextColor="#B9B9B9"
            value={id}
            onChangeText={setId}
            autoCapitalize="none"
          />

          <View style={styles.passwordInputBox}>
            <TextInput
              style={styles.passwordInput}
              placeholder="비밀번호를 입력해주세요."
              placeholderTextColor="#B9B9B9"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={securePassword}
              autoCapitalize="none"
            />

            <TouchableOpacity onPress={() => setSecurePassword((prev) => !prev)}>
              <Ionicons
                name={securePassword ? "eye-off-outline" : "eye-outline"}
                size={26}
                color="#333333"
              />
            </TouchableOpacity>
          </View>

          {password.length > 0 && !isPasswordValid && (
            <Text style={styles.passwordGuide}>
              *비밀번호는 8자 이상 숫자, 영문, 특수문자 조합이어야 합니다.
            </Text>
          )}

          <TouchableOpacity
            style={[styles.signupButton, !canSignup && styles.disabledButton]}
            onPress={handleSignup}
            disabled={!canSignup}
            activeOpacity={0.85}
          >
            <Text style={styles.signupButtonText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFDE8",
  },

  container: {
    flex: 1,
    paddingHorizontal: 36,
  },

  logoArea: {
    alignItems: "center",
    marginTop: 75,
    marginBottom: 36,
  },

  logo: {
    width: 175,
    height: 130,
  },

  formArea: {
    width: "100%",
  },

  input: {
    height: 62,
    borderWidth: 1.2,
    borderColor: "#B9B9B9",
    borderRadius: 10,
    backgroundColor: "#FFFFF4",
    paddingHorizontal: 24,
    fontSize: 16,
    color: "#333333",
    marginBottom: 8,
  },

  passwordInputBox: {
    height: 62,
    borderWidth: 1.2,
    borderColor: "#B9B9B9",
    borderRadius: 10,
    backgroundColor: "#FFFFF4",
    paddingLeft: 24,
    paddingRight: 16,
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
  },

  passwordGuide: {
    marginTop: 8,
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#FF6B4A",
  },

  signupButton: {
    height: 64,
    borderRadius: 22,
    backgroundColor: "#FFC928",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 38,
  },

  disabledButton: {
    backgroundColor: "#E0D6AA",
  },

  signupButtonText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#263A56",
  },
});