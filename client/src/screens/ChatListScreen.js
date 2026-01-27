import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";
import { useBookings } from "../contexts/BookingsContext";
import ChatRow from "../components/ChatRow";

export default function ChatListScreen() {
  const navigation = useNavigation();
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
    deleteChat(chat.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Листування</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Ionicons name="chatbubbles-outline" size={48} color="#CCC" />
              <Text style={{ color: "#999", marginTop: 10 }}>Поки немає діалогів</Text>
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
