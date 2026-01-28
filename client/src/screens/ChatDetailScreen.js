import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../supabaseConfig";
import { styles } from "../../styles";
import { useAppTheme } from "../contexts/ThemeContext";

export default function ChatDetailScreen({ route }) {
  const { chatId, name, avatar } = route.params;
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchHistory();
    const channel = supabase
      .channel("realtime_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => [
            {
              id: newMsg.id.toString(),
              text: newMsg.text,
              isMe: newMsg.sender === "client",
              time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const formatted = data.map((m) => ({
        id: m.id.toString(),
        text: m.text,
        isMe: m.sender === "client",
        time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));
      setMessages(formatted);
    }
  };

  const sendMessage = async () => {
    const textToSend = inputText.trim();
    if (textToSend.length === 0 || sending) return;
    setSending(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert("Помилка", "Потрібно увійти");
        setSending(false);
        return;
      }

      const { error } = await supabase.from("messages").insert([
        { chat_id: chatId, sender: "client", text: textToSend, client_id: user?.id },
      ]);
      if (error) {
        Alert.alert("Помилка", "Не вдалося надіслати повідомлення");
        return;
      }
      setInputText("");
    } catch (e) {
      console.log(e);
      Alert.alert("Помилка", "Не вдалося надіслати повідомлення");
    } finally {
      setSending(false);
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.navHeader, { backgroundColor: colors.card, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 10 }]}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate("ChatList"))}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width: 35, height: 35, borderRadius: 17.5, marginLeft: 10 }} />
          ) : (
            <View style={[styles.avatarPlaceholder, { width: 35, height: 35, marginLeft: 10 }]} />
          )}
          <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10, color: colors.text }}>{name}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={{ transform: [{ scaleY: -1 }], alignItems: "center", marginTop: 50, opacity: 0.6 }}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
            <Text style={{ textAlign: "center", color: colors.textMuted, marginTop: 20 }}>Немає повідомлень</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.isMe ? styles.myMessage : styles.theirMessage,
              { backgroundColor: item.isMe ? colors.primary : colors.card },
            ]}
          >
            <Text style={[styles.messageText, { color: item.isMe ? colors.primaryText : colors.text }]}>{item.text}</Text>
            <Text style={[styles.messageTime, { color: item.isMe ? colors.textMuted : colors.textMuted }]}>{item.time}</Text>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={10}>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.chatInput, { backgroundColor: colors.inputBg, color: colors.text }]}
            placeholder="Написати повідомлення..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity onPress={sendMessage} style={[styles.sendButton, { backgroundColor: colors.primary }]} disabled={sending}>
            <Ionicons name="arrow-up" size={20} color={colors.primaryText} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
