import React, { useContext, useMemo, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, Alert } from 'react-native';
import { styles } from '../../styles';
import { BookingsContext } from '../context/BookingsContext';
import BookingTabs from '../components/organisms/BookingTabs';
import BookingCard from '../components/organisms/BookingCard';
import BookingsEmptyState from '../components/organisms/BookingsEmptyState';

function BookingsScreen() {
  const { bookings, cancelBooking } = useContext(BookingsContext);
  const [activeTab, setActiveTab] = useState('active');

  const filteredBookings = useMemo(() => (
    bookings.filter((item) => {
      if (activeTab === 'active') return item.status === 'active';
      if (activeTab === 'cancelled') return item.status === 'cancelled';
      if (activeTab === 'history') return item.status === 'history';
      return true;
    })
  ), [bookings, activeTab]);

  const handleCancel = (id) => {
    Alert.alert('Скасувати?', "Запис буде переміщено у вкладку 'Скасовані'", [
      { text: 'Ні', style: 'cancel' },
      { text: 'Так', onPress: () => cancelBooking(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Мої записи</Text>
      </View>
      <BookingTabs activeTab={activeTab} onChange={setActiveTab} />

      {filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <BookingCard
              item={item}
              onCancelPress={() => handleCancel(item.id)}
              onChatPress={() => {}}
            />
          )}
        />
      ) : (
        <BookingsEmptyState />
      )}
    </SafeAreaView>
  );
}

export default BookingsScreen;
