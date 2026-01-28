import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "../../styles";
import { CITIES } from "../constants/data";
import { useAppTheme } from "../contexts/ThemeContext";

const CITY_STORAGE_KEY = "beautytime.city";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, theme, toggleTheme } = useAppTheme();
  const [city, setCity] = useState("Київ");
  const [cityModalVisible, setCityModalVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CITY_STORAGE_KEY).then((stored) => {
      if (stored) setCity(stored);
    });
  }, []);

  const handleSelectCity = async (selectedCity) => {
    setCity(selectedCity);
    await AsyncStorage.setItem(CITY_STORAGE_KEY, selectedCity);
    setCityModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navHeader, { alignItems: "center" }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Налаштування</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <TouchableOpacity
          style={[styles.menuItem, { borderColor: colors.border }]}
          onPress={() => setCityModalVisible(true)}
        >
          <Ionicons name="business" size={20} color={colors.text} />
          <Text style={{ flex: 1, marginLeft: 10, fontSize: 16, color: colors.text }}>
            Поточне місто: {city}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={[styles.menuItem, { borderColor: colors.border, justifyContent: "space-between" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons name="moon" size={20} color={colors.text} />
            <Text style={{ marginLeft: 10, fontSize: 16, color: colors.text }}>Темна тема</Text>
          </View>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={theme === "dark" ? colors.onAccent : colors.card}
          />
        </View>

      </View>

      <Modal visible={cityModalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, padding: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.text }}>Оберіть місто</Text>
            <TouchableOpacity onPress={() => setCityModalVisible(false)}>
              <Text style={{ fontSize: 18, color: colors.accent }}>Закрити</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={CITIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ paddingVertical: 15, borderBottomWidth: 1, borderColor: colors.border, paddingHorizontal: 20 }}
                onPress={() => handleSelectCity(item)}
              >
                <Text style={{ fontSize: 18, color: colors.text }}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}
