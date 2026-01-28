import React from 'react';
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../../styles';
import { CHATS } from '../data/chats';
import ChatRow from '../components/molecules/ChatRow';

function ChatListScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Листування</Text>
      </View>
      <FlatList
        data={CHATS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <ChatRow
            name={item.name}
            unread={item.unread}
            onPress={() => navigation.navigate('ChatDetail', { name: item.name })}
          />
        )}
      />
    </SafeAreaView>
  );
}

export default ChatListScreen;
