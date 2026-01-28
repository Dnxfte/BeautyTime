import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { supabase } from "../../supabaseConfig";
import { useAppTheme } from "../contexts/ThemeContext";

export default function AuthScreen() {
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert("Помилка", "Введіть Email та пароль");
      return;
    }
    if (!isLogin && (!firstName || !lastName)) {
      Alert.alert("Помилка", "Введіть Ім'я та Прізвище");
      return;
    }
    if (!isLogin && password.length < 6) {
      Alert.alert("Слабкий пароль", "Пароль має містити мінімум 6 символів");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });
        if (error) throw error;
        Alert.alert("Успішно!", "Акаунт створено. Тепер увійдіть.");
        setIsLogin(true);
      }
    } catch (error) {
      if (error.message?.includes("already registered")) {
        Alert.alert("Помилка", "Такий користувач вже існує. Спробуйте увійти.");
      } else {
        Alert.alert("Помилка", error.message || "Невідома помилка");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[authStyles.container, { backgroundColor: colors.background }]}>
      <View style={[authStyles.card, { backgroundColor: colors.card }]}>
        <Text style={[authStyles.title, { color: colors.text }]}>
          {isLogin ? "Вхід у BeautyTime" : "Реєстрація"}
        </Text>

        {!isLogin && (
          <>
            <TextInput
              placeholder="Ім'я"
              value={firstName}
              onChangeText={setFirstName}
              style={[authStyles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              placeholder="Прізвище"
              value={lastName}
              onChangeText={setLastName}
              style={[authStyles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
              placeholderTextColor={colors.textMuted}
            />
          </>
        )}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={[authStyles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Пароль (мін. 6 символів)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[authStyles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity
          style={[authStyles.button, { backgroundColor: colors.primary }]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={[authStyles.buttonText, { color: colors.primaryText }]}>
              {isLogin ? "Увійти" : "Зареєструватись"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsLogin(!isLogin)}
          style={{ marginTop: 20 }}
        >
          <Text style={[authStyles.switchText, { color: colors.accent }]}>
            {isLogin ? "Немає акаунту? Зареєструватись" : "Вже є акаунт? Увійти"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    backgroundColor: "#F0F0F0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  switchText: { textAlign: "center", color: "#007AFF", marginTop: 10 },
});
