import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../../styles';

const TABS = [
  { key: 'active', label: 'Активні' },
  { key: 'cancelled', label: 'Скасовані' },
  { key: 'history', label: 'Архів' },
];

const BookingTabs = ({ activeTab, onChange }) => (
  <View style={styles.tabsContainer}>
    {TABS.map((tab) => (
      <TouchableOpacity
        key={tab.key}
        style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
        onPress={() => onChange(tab.key)}
      >
        <Text style={activeTab === tab.key ? { color: '#FFF' } : { color: '#000' }}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default BookingTabs;
