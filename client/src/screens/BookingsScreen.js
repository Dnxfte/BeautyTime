import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";
import { useBookings } from "../contexts/BookingsContext";
import BookingCard from "../components/BookingCard";
import { useAppTheme } from "../contexts/ThemeContext";

export default function BookingsScreen() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { bookings, cancelBooking, startChat, userEmail, getUserEmail } = useBookings();
  const [activeTab, setActiveTab] = useState("active");

  const filteredBookings = bookings.filter((item) => {
    if (activeTab === "active") return item.status === "active";
    if (activeTab === "cancelled") return item.status === "cancelled";
    if (activeTab === "history") return item.status === "history";
    return true;
  });

  const handleCancelPress = (booking) => {
    Alert.alert(
      "Скасувати?",
      "Запис буде переміщено у вкладку 'Скасовані'",
      [
        { text: "Ні", style: "cancel" },
        { text: "Так", onPress: async () => {
          const { error } = await cancelBooking(booking.id);
          if (error) {
            Alert.alert("Помилка", "Не вдалося скасувати запис");
          }
        } },
      ]
    );
  };

  const handleChatPress = async (booking) => {
    const email = userEmail || (await getUserEmail());
    if (!email) {
      Alert.alert("Помилка", "Потрібно увійти");
      return;
    }
    const uniqueChatId = startChat(booking.master, booking.avatar_url, email);
    if (!uniqueChatId) {
      Alert.alert("Помилка", "Не вдалося відкрити чат");
      return;
    }
    navigation.navigate("Чат", {
      screen: "ChatDetail",
      params: { chatId: uniqueChatId, name: booking.master, avatar: booking.avatar_url },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Мої записи</Text>
      </View>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            { backgroundColor: activeTab === "active" ? colors.accent : colors.card, borderWidth: 1, borderColor: colors.border },
          ]}
          onPress={() => setActiveTab("active")}
        >
          <Text style={activeTab === "active" ? { color: colors.onAccent } : { color: colors.text }}>
            Активні
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            { backgroundColor: activeTab === "cancelled" ? colors.accent : colors.card, borderWidth: 1, borderColor: colors.border },
          ]}
          onPress={() => setActiveTab("cancelled")}
        >
          <Text style={activeTab === "cancelled" ? { color: colors.onAccent } : { color: colors.text }}>
            Скасовані
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            { backgroundColor: activeTab === "history" ? colors.accent : colors.card, borderWidth: 1, borderColor: colors.border },
          ]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={activeTab === "history" ? { color: colors.onAccent } : { color: colors.text }}>
            Архів
          </Text>
        </TouchableOpacity>
      </View>

      {filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onCancelPress={handleCancelPress}
              onChatPress={handleChatPress}
            />
          )}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 }}>
          <Ionicons name="file-tray-outline" size={48} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, marginTop: 10 }}>У цьому розділі порожньо</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
