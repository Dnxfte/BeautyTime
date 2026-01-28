import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../styles';

const ActionButton = ({ title, variant = 'primary', style, textStyle, onPress }) => {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[isPrimary ? styles.primaryBtn : styles.secondaryBtn, style]}
      onPress={onPress}
    >
      <Text style={[isPrimary ? styles.primaryBtnText : styles.secondaryBtnText, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default ActionButton;
