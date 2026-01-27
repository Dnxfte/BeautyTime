import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../supabaseConfig";
import { styles } from "../../styles";
import { CITIES } from "../constants/data";
import { useBookings } from "../contexts/BookingsContext";

export default function ProfileScreen() {
  const [city, setCity] = useState("Київ");
  const [modalVisible, setModalVisible] = useState(false);
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

  const handleDeleteAccount = () => {
    Alert.alert(
      "Видалити акаунт?",
      "Цю дію неможливо скасувати.",
      [
        { text: "Скасувати", style: "cancel" },
        {
          text: "Видалити",
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            Alert.alert("Акаунт деактивовано");
          },
        },
      ]
    );
  };

  const handlePickImage = async () => {
    try {
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
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: `avatar_${Date.now()}.jpg`,
        type: "image/jpeg",
      });

      const fileName = `avatars/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, formData, { contentType: "multipart/form-data" });

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Мій профіль</Text>
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
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius: 40,
                }}
              >
                <ActivityIndicator color="#FFF" />
              </View>
            )}
            <View
              style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "blue", borderRadius: 12, padding: 4 }}
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
                  style={{ borderBottomWidth: 1, marginBottom: 8, fontSize: 16 }}
                />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Прізвище"
                  style={{ borderBottomWidth: 1, fontSize: 16 }}
                />
              </View>
            ) : (
              <View>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                  {userMetadata?.first_name} {userMetadata?.last_name}
                </Text>
                <Text style={{ color: "gray", marginTop: 4 }}>{userEmail}</Text>
              </View>
            )}
          </View>
        </View>

        {isEditing ? (
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => updateProfile(firstName, lastName)}
              style={{ backgroundColor: "black", padding: 10, borderRadius: 8, flex: 1, alignItems: "center" }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Зберегти</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsEditing(false)}
              style={{ backgroundColor: "#ccc", padding: 10, borderRadius: 8, flex: 1, alignItems: "center" }}
            >
              <Text style={{ color: "black" }}>Скасувати</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={{ alignSelf: "flex-start", marginBottom: 20, flexDirection: "row", alignItems: "center" }}
          >
            <Ionicons name="pencil" size={16} color="blue" />
            <Text style={{ color: "blue", marginLeft: 5, fontWeight: "bold" }}>Редагувати профіль</Text>
          </TouchableOpacity>
        )}

        <View style={styles.loyaltyCard}>
          <Text style={{ fontWeight: "500" }}>Програма лояльності</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30 }}>
            <Text style={{ fontSize: 32, fontWeight: "bold" }}>10%</Text>
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="time-outline" size={16} />
              <Text style={{ marginLeft: 4 }}>Історія</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(true)}>
          <Ionicons name="business" size={20} color="black" />
          <Text style={{ flex: 1, marginLeft: 10, fontSize: 16 }}>Поточне місто: {city}</Text>
          <Ionicons name="chevron-forward" size={16} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings" size={20} color="black" />
          <Text style={{ flex: 1, marginLeft: 10, fontSize: 16 }}>Налаштування</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="orange" />
          <Text style={{ flex: 1, marginLeft: 10, fontSize: 16, color: "orange" }}>Вийти</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={20} color="red" />
          <Text style={{ flex: 1, marginLeft: 10, fontSize: 16, color: "red" }}>Видалити акаунт</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>Оберіть місто</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ fontSize: 18, color: "blue" }}>Закрити</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={CITIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ paddingVertical: 15, borderBottomWidth: 1, borderColor: "#EEE" }}
                onPress={() => {
                  setCity(item);
                  setModalVisible(false);
                }}
              >
                <Text style={{ fontSize: 18 }}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
