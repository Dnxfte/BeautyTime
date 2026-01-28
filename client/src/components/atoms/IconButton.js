import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles';

const IconButton = ({ name, size = 20, color = 'black', onPress, style }) => (
  <TouchableOpacity style={[styles.iconBtn, style]} onPress={onPress}>
    <Ionicons name={name} size={size} color={color} />
  </TouchableOpacity>
);

export default IconButton;
