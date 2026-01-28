import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../supabaseConfig";
import { styles } from "../../styles";
import { useBookings } from "../contexts/BookingsContext";
import { useAppTheme } from "../contexts/ThemeContext";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { userEmail, userMetadata, refreshUser } = useBookings();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(userMetadata?.first_name || "");
  const [lastName, setLastName] = useState(userMetadata?.last_name || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userMetadata) {
      setFirstName(userMetadata.first_name || "");
      setLastName(userMetadata.last_name || "");
    }
  }, [userMetadata]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Потрібен доступ", "Дозвольте доступ до фото, щоб змінити аватар.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        uploadAvatar(selectedImage.uri);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Помилка", "Не вдалося відкрити галерею");
    }
  };

  const uploadAvatar = async (uri) => {
    setLoading(true);
    try {
      const fileName = `avatars/${Date.now()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, blob, { contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      await updateProfile(firstName, lastName, publicUrl);
    } catch (e) {
      Alert.alert("Помилка", "Не вдалося завантажити фото");
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (fName, lName, avatar = null) => {
    setLoading(true);
    try {
      const updates = {
        data: {
          first_name: fName,
          last_name: lName,
          ...(avatar && { avatar_url: avatar }),
        },
      };

      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      refreshUser();
      setIsEditing(false);
      Alert.alert("Успішно", "Профіль оновлено!");
    } catch (e) {
      Alert.alert("Помилка", e.message);
    } finally {
      setLoading(false);
    }
  };

  const avatarSource = userMetadata?.avatar_url ? { uri: userMetadata.avatar_url } : null;

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Мій профіль</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={handlePickImage} disabled={loading} style={{ position: "relative" }}>
            {avatarSource ? (
              <Image source={avatarSource} style={{ width: 80, height: 80, borderRadius: 40 }} resizeMode="cover" />
            ) : (
              <View style={[styles.avatarPlaceholder, { width: 80, height: 80, borderRadius: 40 }]} />
            )}
            {loading && (
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: colors.overlay,
                  borderRadius: 40,
                }}
              >
                <ActivityIndicator color="#FFF" />
              </View>
            )}
            <View
              style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: colors.accent, borderRadius: 12, padding: 4 }}
            >
              <Ionicons name="camera" size={14} color="white" />
            </View>
          </TouchableOpacity>

          <View style={{ marginLeft: 15, flex: 1 }}>
            {isEditing ? (
              <View>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Ім'я"
                  placeholderTextColor={colors.textMuted}
                  style={{ borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 8, fontSize: 16, color: colors.text }}
                />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Прізвище"
                  placeholderTextColor={colors.textMuted}
                  style={{ borderBottomWidth: 1, borderBottomColor: colors.border, fontSize: 16, color: colors.text }}
                />
              </View>
            ) : (
              <View>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
                  {userMetadata?.first_name} {userMetadata?.last_name}
                </Text>
                <Text style={{ color: colors.textMuted, marginTop: 4 }}>{userEmail}</Text>
              </View>
            )}
          </View>
        </View>

        {isEditing ? (
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => updateProfile(firstName, lastName)}
              style={{ backgroundColor: colors.primary, padding: 10, borderRadius: 8, flex: 1, alignItems: "center" }}
            >
              <Text style={{ color: colors.primaryText, fontWeight: "bold" }}>Зберегти</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsEditing(false)}
              style={{ backgroundColor: colors.border, padding: 10, borderRadius: 8, flex: 1, alignItems: "center" }}
            >
              <Text style={{ color: colors.text }}>Скасувати</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={{ alignSelf: "flex-start", marginBottom: 20, flexDirection: "row", alignItems: "center" }}
          >
            <Ionicons name="pencil" size={16} color={colors.accent} />
            <Text style={{ color: colors.accent, marginLeft: 5, fontWeight: "bold" }}>Редагувати профіль</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.loyaltyCard, { backgroundColor: colors.card }]}>
          <Text style={{ fontWeight: "500", color: colors.text }}>Програма лояльності</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30 }}>
            <Text style={{ fontSize: 32, fontWeight: "bold", color: colors.text }}>10%</Text>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => Alert.alert("Скоро", "Історія лояльності буде доступна згодом")}
            >
              <Ionicons name="time-outline" size={16} color={colors.text} />
              <Text style={{ marginLeft: 4, color: colors.text }}>Історія</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.menuItem, { borderColor: colors.border }]} onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings" size={20} color={colors.text} />
          <Text style={{ flex: 1, marginLeft: 10, fontSize: 16, color: colors.text }}>Налаштування</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { borderColor: colors.border }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="orange" />
          <Text style={{ flex: 1, marginLeft: 10, fontSize: 16, color: "orange" }}>Вийти</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
