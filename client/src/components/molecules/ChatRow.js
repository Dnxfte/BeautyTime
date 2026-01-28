import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { styles } from '../../../styles';
import AvatarPlaceholder from '../atoms/AvatarPlaceholder';

const ChatRow = ({ name, unread, onPress }) => (
  <TouchableOpacity style={styles.chatRow} onPress={onPress}>
    <AvatarPlaceholder />
    <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>{name}</Text>
      <Text style={{ color: '#999', fontSize: 13, marginTop: 2 }}>
        Натисніть, щоб написати...
      </Text>
    </View>
    {unread > 0 ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{unread}</Text>
      </View>
    ) : null}
  </TouchableOpacity>
);

export default ChatRow;
