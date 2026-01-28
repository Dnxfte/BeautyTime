import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../styles';

const MessageBubble = ({ text, time, isMe }) => (
  <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
    <Text style={[styles.messageText, isMe ? { color: '#FFF' } : { color: '#000' }]}>
      {text}
    </Text>
    <Text style={[styles.messageTime, isMe ? { color: '#CCC' } : { color: '#666' }]}>
      {time}
    </Text>
  </View>
);

export default MessageBubble;
