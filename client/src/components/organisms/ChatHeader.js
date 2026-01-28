import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles';
import AvatarPlaceholder from '../atoms/AvatarPlaceholder';

const ChatHeader = ({ name, onBack }) => (
  <View style={[styles.navHeader, { backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 10 }]}>
    <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="arrow-back" size={24} color="black" />
      <AvatarPlaceholder size={30} style={{ marginLeft: 10 }} />
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 10 }}>{name}</Text>
    </TouchableOpacity>
  </View>
);

export default ChatHeader;
