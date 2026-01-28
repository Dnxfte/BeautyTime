import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BookingsEmptyState = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
    <Ionicons name="file-tray-outline" size={48} color="#CCC" />
    <Text style={{ color: '#999', marginTop: 10 }}>У цьому розділі порожньо</Text>
  </View>
);

export default BookingsEmptyState;
