import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../styles';

const DateBox = ({ day, month, active, onPress }) => (
  <TouchableOpacity
    style={[styles.dateBox, active && styles.dateBoxActive]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.dateText,
        active && { color: '#FFF', fontWeight: 'bold' },
      ]}
    >
      {day}{'\n'}{month}
    </Text>
  </TouchableOpacity>
);

export default DateBox;
