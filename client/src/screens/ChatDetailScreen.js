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

export default function ChatDetailScreen({ route }) {
  const { chatId, name, avatar } = route.params;
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

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
  }, []);

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
    if (inputText.trim().length === 0) return;
    const textToSend = inputText;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert("Помилка", "Потрібно увійти");
        return;
      }

      setInputText("");
      await supabase.from("messages").insert([
        { chat_id: chatId, sender: "client", text: textToSend, client_id: user?.id },
      ]);
    } catch (e) {
      console.log(e);
    }
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F2F2F2" }}>
      <View style={[styles.navHeader, { backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#EEE", paddingVertical: 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ChatList")}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width: 35, height: 35, borderRadius: 17.5, marginLeft: 10 }} />
          ) : (
            <View style={[styles.avatarPlaceholder, { width: 35, height: 35, marginLeft: 10 }]} />
          )}
          <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>{name}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={{ transform: [{ scaleY: -1 }], alignItems: "center", marginTop: 50, opacity: 0.5 }}>
            <Ionicons name="chatbubbles-outline" size={48} color="#999" />
            <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>Немає повідомлень</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.isMe ? styles.myMessage : styles.theirMessage]}>
            <Text style={[styles.messageText, item.isMe ? { color: "#FFF" } : { color: "#000" }]}>{item.text}</Text>
            <Text style={[styles.messageTime, item.isMe ? { color: "#CCC" } : { color: "#666" }]}>{item.time}</Text>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={10}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Написати повідомлення..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="arrow-up" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
