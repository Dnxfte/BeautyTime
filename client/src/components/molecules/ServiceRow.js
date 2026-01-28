import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../../../styles';

const ServiceRow = ({ name, price }) => (
  <View style={styles.serviceRow}>
    <Text style={styles.serviceName}>{name}</Text>
    <Text style={styles.servicePrice}>{price}</Text>
  </View>
);

export default ServiceRow;
