import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles';

const InfoRow = ({ icon, text, style, size = 14, color = 'black', textStyle }) => (
  <View style={[styles.infoRow, style]}>
    <Ionicons name={icon} size={size} color={color} style={{ marginRight: 4 }} />
    <Text style={[styles.infoText, textStyle]}>{text}</Text>
  </View>
);

export default InfoRow;
