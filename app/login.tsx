import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
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

import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [securePassword, setSecurePassword] = useState(true);

  const isPasswordValid =
    password.length >= 8 &&
    /[0-9]/.test(password) &&
    /[a-zA-Z]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password);

    const handleLogin = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: id,
              password,
            }),
          }
        );
    
        const data = await response.json();
    
        if (!response.ok) {
          alert(data.detail);
          return;
        }
    
        await SecureStore.setItemAsync("user_id", String(data.user_id));
        await SecureStore.setItemAsync("nickname", String(data.nickname));

        router.replace("/home");
            
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
  style={[
    styles.loginButton,
    (!id || !isPasswordValid) && styles.disabledLoginButton,
  ]}
  onPress={handleLogin}
  disabled={!id || !isPasswordValid}
  activeOpacity={0.85}
>
  <Text style={styles.loginButtonText}>로그인</Text>
</TouchableOpacity>

          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => router.push("/signup")}>
  <Text style={styles.linkText}>회원가입</Text>
</TouchableOpacity>

            <Text style={styles.linkDivider}>|</Text>

            <TouchableOpacity>
              <Text style={styles.linkText}>아이디 찾기</Text>
            </TouchableOpacity>

            <Text style={styles.linkDivider}>|</Text>

            <TouchableOpacity>
              <Text style={styles.linkText}>비밀번호 찾기</Text>
            </TouchableOpacity>
          </View>
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
  },

  passwordInputBox: {
    height: 62,
    borderWidth: 1.2,
    borderColor: "#B9B9B9",
    borderRadius: 10,
    backgroundColor: "#FFFFF4",
    paddingLeft: 24,
    paddingRight: 16,
    marginTop: 8,
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

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#263A56",
    borderRadius: 3,
    backgroundColor: "#FFFDE8",
    alignItems: "center",
    justifyContent: "center",
  },

  checkedBox: {
    backgroundColor: "#FFD75E",
  },

  loginButton: {
    height: 64,
    borderRadius: 22,
    backgroundColor: "#FFC928",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 38,
  },

  disabledLoginButton: {
  backgroundColor: "#E0D6AA",
},

  loginButtonText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#263A56",
  },

  linkRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  linkText: {
    fontSize: 14,
    color: "#9A9A9A",
    fontWeight: "600",
  },

  linkDivider: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#9A9A9A",
  },
});