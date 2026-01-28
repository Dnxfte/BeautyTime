import React from 'react';
import { Text } from 'react-native';
import { styles } from '../../../styles';

const SectionTitle = ({ children, style }) => (
  <Text style={[styles.sectionTitle, style]}>{children}</Text>
);

export default SectionTitle;
