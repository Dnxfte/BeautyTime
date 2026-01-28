import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";
import { useAppTheme } from "../contexts/ThemeContext";

export default function BookingCard({ booking, onCancelPress, onChatPress }) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, opacity: booking.status === "cancelled" ? 0.7 : 1 }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontWeight: "bold", color: colors.text }}>{booking.date}</Text>
        {booking.status === "cancelled" && (
          <Text style={{ color: colors.danger, fontWeight: "bold" }}>СКАСОВАНО</Text>
        )}
        {booking.status !== "cancelled" && (
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
        )}
      </View>

      <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}>
        {booking.avatar_url ? (
          <Image
            source={{ uri: booking.avatar_url }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { width: 40, height: 40 }]} />
        )}
        <Text style={{ marginLeft: 10, fontSize: 16, fontWeight: "600", color: colors.text }}>
          {booking.master}
        </Text>
      </View>

      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <Ionicons name="location-sharp" size={16} color={colors.text} />
        <Text style={{ marginLeft: 5, color: colors.textMuted }}>{booking.address}</Text>
      </View>

      {booking.status === "active" && (
        <View style={[styles.bookingActions, { borderColor: colors.border }]}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}
            onPress={() => onCancelPress?.(booking)}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
            <Text style={{ marginLeft: 4, color: colors.danger }}>Скасувати</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => onChatPress?.(booking)}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
            <Text style={{ marginLeft: 4, color: colors.text }}>Написати в чат</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
