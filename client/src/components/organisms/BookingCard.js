import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles';
import AvatarPlaceholder from '../atoms/AvatarPlaceholder';

const BookingCard = ({ item, onCancelPress, onChatPress }) => (
  <View style={[styles.card, { opacity: item.status === 'cancelled' ? 0.7 : 1 }]}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontWeight: 'bold' }}>{item.date}</Text>
      {item.status === 'cancelled' ? (
        <Text style={{ color: 'red', fontWeight: 'bold' }}>СКАСОВАНО</Text>
      ) : (
        <Ionicons name="ellipsis-horizontal" size={20} />
      )}
    </View>

    <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
      <AvatarPlaceholder size={40} />
      <Text style={{ marginLeft: 10, fontSize: 16, fontWeight: '600' }}>{item.master}</Text>
    </View>

    <View style={{ flexDirection: 'row', marginTop: 10 }}>
      <Ionicons name="location-sharp" size={16} />
      <Text style={{ marginLeft: 5, color: '#555' }}>{item.address}</Text>
    </View>

    {item.status === 'active' ? (
      <View style={styles.bookingActions}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
          onPress={onCancelPress}
        >
          <Ionicons name="close-circle-outline" size={18} color="red" />
          <Text style={{ marginLeft: 4, color: 'red' }}>Скасувати</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={onChatPress}>
          <Ionicons name="chatbubble-outline" size={18} />
          <Text style={{ marginLeft: 4 }}>Написати в чат</Text>
        </TouchableOpacity>
      </View>
    ) : null}
  </View>
);

export default BookingCard;
