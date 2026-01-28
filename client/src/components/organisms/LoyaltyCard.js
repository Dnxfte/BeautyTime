import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles';

const LoyaltyCard = ({ percent = '10%', onHistoryPress }) => (
  <View style={styles.loyaltyCard}>
    <Text style={{ fontWeight: '500' }}>Програма лояльності</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 30 }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold' }}>{percent}</Text>
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={onHistoryPress}>
        <Ionicons name="time-outline" size={16} />
        <Text style={{ marginLeft: 4 }}>Історія</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default LoyaltyCard;
