import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../../styles';
import ChatHeader from '../components/organisms/ChatHeader';
import MessageBubble from '../components/molecules/MessageBubble';

function ChatDetailScreen({ route }) {
  const { name } = route.params;
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim().length === 0) return;
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [newMessage, ...prev]);
    setInputText('');
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F2F2' }}>
      <ChatHeader name={name} onBack={() => navigation.goBack()} />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50, opacity: 0.5 }}>
            <Ionicons name="chatbubbles-outline" size={48} color="#999" />
            <Text style={{ color: '#999', marginTop: 10 }}>Історія повідомлень пуста.</Text>
            <Text style={{ color: '#999' }}>Напишіть перше повідомлення!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <MessageBubble text={item.text} time={item.time} isMe={item.isMe} />
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={10}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Написати повідомлення..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="arrow-up" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default ChatDetailScreen;
