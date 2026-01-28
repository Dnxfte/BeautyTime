import React from 'react';
import { View } from 'react-native';
import { styles } from '../../../styles';

const GalleryRow = ({ count = 3 }) => (
  <View style={styles.galleryRow}>
    {Array.from({ length: count }).map((_, index) => (
      <View key={index} style={styles.galleryPlaceholder} />
    ))}
  </View>
);

export default GalleryRow;
