import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../../styles';
import { TIME_SLOTS } from '../data/timeSlots';
import { getNextDays } from '../utils/dates';
import { BookingsContext } from '../context/BookingsContext';
import AvatarPlaceholder from '../components/atoms/AvatarPlaceholder';
import ActionButton from '../components/atoms/ActionButton';
import SectionTitle from '../components/atoms/SectionTitle';
import GalleryRow from '../components/molecules/GalleryRow';
import InfoRow from '../components/molecules/InfoRow';
import DateBox from '../components/molecules/DateBox';
import TimeSelect from '../components/molecules/TimeSelect';
import ServiceRow from '../components/molecules/ServiceRow';

const SERVICES = [
  { name: 'Манікюр', price: '500 грн' },
  { name: 'Педікюр', price: '600 грн' },
  { name: 'Комплекс', price: '1000 грн' },
];

function MasterProfileScreen({ route }) {
  const navigation = useNavigation();
  const { master } = route.params;
  const { addBooking } = useContext(BookingsContext);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [dates, setDates] = useState([]);

  useEffect(() => {
    setDates(getNextDays());
  }, []);

  const handleBooking = () => {
    if (dates.length === 0) return;
    const d = dates[selectedDateIndex];
    const dateStr = `${d.day} ${d.month} ${d.fullDate.getFullYear()}`;

    const newBooking = {
      id: Date.now().toString(),
      date: `${dateStr} о ${selectedTime}`,
      master: master.name,
      address: master.address,
      status: 'active',
    };

    addBooking(newBooking);

    Alert.alert(
      'Успішно!',
      `Ви записані до ${master.name} на ${dateStr} о ${selectedTime}`,
      [{ text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Записи' }) }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="share-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={styles.detailName}>{master.name}</Text>
              <Text style={styles.ratingText}>★ {master.rating} / 5</Text>
            </View>
            <AvatarPlaceholder size={60} />
          </View>

          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '500' }}>{master.salon}</Text>
            <InfoRow icon="location-sharp" text={master.address} size={16} style={{ marginTop: 4 }} />
          </View>

          <View style={styles.mapPlaceholder} />

          <SectionTitle>Календар для запису</SectionTitle>
          <View style={styles.calendarRow}>
            {dates.map((d, i) => (
              <DateBox
                key={`${d.day}-${i}`}
                day={d.day}
                month={d.month}
                active={selectedDateIndex === i}
                onPress={() => setSelectedDateIndex(i)}
              />
            ))}
          </View>

          <View style={styles.timePickerRow}>
            <Text style={{ fontSize: 14, color: '#444' }}>Оберіть бажаний час:</Text>
            <TimeSelect value={selectedTime} onPress={() => setTimeModalVisible(true)} />
          </View>

          <ActionButton title="Записатись" onPress={handleBooking} />

          <SectionTitle>Послуги</SectionTitle>
          {SERVICES.map((service) => (
            <ServiceRow key={service.name} name={service.name} price={service.price} />
          ))}

          <SectionTitle>Портфоліо</SectionTitle>
          <GalleryRow />
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        <ActionButton title="Вибрати дату" style={{ flex: 1, marginRight: 10 }} />
        <ActionButton title="Консультація" variant="secondary" style={{ flex: 1 }} />
      </View>

      <Modal visible={timeModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Оберіть час</Text>
            <FlatList
              data={TIME_SLOTS}
              keyExtractor={(item) => item}
              numColumns={3}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.timeSlotItem}
                  onPress={() => {
                    setSelectedTime(item);
                    setTimeModalVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setTimeModalVisible(false)} style={{ marginTop: 20, alignSelf: 'center' }}>
              <Text style={{ color: 'red', fontSize: 16 }}>Скасувати</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default MasterProfileScreen;
