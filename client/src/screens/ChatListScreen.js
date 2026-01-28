import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";
import { useBookings } from "../contexts/BookingsContext";
import ChatRow from "../components/ChatRow";
import { useAppTheme } from "../contexts/ThemeContext";

export default function ChatListScreen() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const { chats, deleteChat } = useBookings();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleChatPress = (chat) => {
    navigation.navigate("ChatDetail", {
      chatId: chat.id,
      name: chat.name,
      avatar: chat.avatar,
    });
  };

  const handleChatDelete = (chat) => {
    deleteChat(chat.id).then(({ error }) => {
      if (error) {
        Alert.alert("Помилка", "Не вдалося видалити чат");
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Листування</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, marginTop: 10 }}>Поки немає діалогів</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ChatRow
              chat={item}
              onPress={handleChatPress}
              onDelete={handleChatDelete}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
