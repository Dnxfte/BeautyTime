import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { styles } from "../../styles";
import { useAppTheme } from "../contexts/ThemeContext";

export default function ChatRow({ chat, onPress, onDelete }) {
  const { colors } = useAppTheme();

  const renderRightActions = () => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.danger,
        justifyContent: "center",
        alignItems: "center",
        width: 80,
        height: "100%",
      }}
      onPress={() => onDelete?.(chat)}
    >
      <Ionicons name="trash-outline" size={30} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={[styles.chatRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={1}
        onPress={() => onPress?.(chat)}
      >
        {chat.avatar ? (
          <Image source={{ uri: chat.avatar }} style={{ width: 50, height: 50, borderRadius: 25 }} resizeMode="cover" />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <View style={{ flex: 1, marginLeft: 12, justifyContent: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>{chat.name}</Text>
          <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>
            {chat.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}
