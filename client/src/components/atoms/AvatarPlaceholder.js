import React from 'react';
import { View } from 'react-native';
import { styles } from '../../../styles';

const AvatarPlaceholder = ({ size = 50, style }) => (
  <View
    style={[
      styles.avatarPlaceholder,
      { width: size, height: size, borderRadius: size / 2 },
      style,
    ]}
  />
);

export default AvatarPlaceholder;
