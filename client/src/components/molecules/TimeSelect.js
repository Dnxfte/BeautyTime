import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles';

const TimeSelect = ({ value, onPress }) => (
  <TouchableOpacity style={styles.timeSelect} onPress={onPress}>
    <Text style={{ fontWeight: 'bold' }}>{value}</Text>
    <Ionicons name="chevron-down" size={16} />
  </TouchableOpacity>
);

export default TimeSelect;
