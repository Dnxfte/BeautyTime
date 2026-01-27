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

export default function BookingsScreen() {
  const navigation = useNavigation();
  const { bookings, cancelBooking, startChat, userEmail } = useBookings();
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
        { text: "Так", onPress: () => cancelBooking(booking.id) },
      ]
    );
  };

  const handleChatPress = (booking) => {
    const uniqueChatId = `${booking.master}:${userEmail}`;
    startChat(booking.master, booking.avatar_url);
    navigation.navigate("Чат", {
      screen: "ChatDetail",
      params: { chatId: uniqueChatId, name: booking.master, avatar: booking.avatar_url },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Мої записи</Text>
      </View>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "active" && styles.tabBtnActive]}
          onPress={() => setActiveTab("active")}
        >
          <Text style={activeTab === "active" ? { color: "#FFF" } : { color: "#000" }}>
            Активні
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "cancelled" && styles.tabBtnActive]}
          onPress={() => setActiveTab("cancelled")}
        >
          <Text style={activeTab === "cancelled" ? { color: "#FFF" } : { color: "#000" }}>
            Скасовані
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "history" && styles.tabBtnActive]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={activeTab === "history" ? { color: "#FFF" } : { color: "#000" }}>
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
          <Ionicons name="file-tray-outline" size={48} color="#CCC" />
          <Text style={{ color: "#999", marginTop: 10 }}>У цьому розділі порожньо</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
