import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles';

const FilterChip = ({ label, active, onPress, iconName }) => (
  <TouchableOpacity
    style={[styles.filterBtn, active && styles.filterBtnActive]}
    onPress={onPress}
  >
    {iconName ? (
      <Ionicons name={iconName} size={16} color="black" style={{ marginRight: 4 }} />
    ) : null}
    <Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text>
  </TouchableOpacity>
);

export default FilterChip;
