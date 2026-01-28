import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles';

const SearchBar = ({ placeholder = 'Пошук майстра', value, onChangeText }) => (
  <View style={styles.searchBar}>
    <Ionicons name="search" size={18} color="#888" style={{ marginRight: 8 }} />
    <TextInput
      style={styles.searchInput}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

export default SearchBar;
