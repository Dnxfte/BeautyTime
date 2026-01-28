import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../styles';

const Tag = ({ label }) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

export default Tag;
