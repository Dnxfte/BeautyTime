import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles';
import { CITIES } from '../data/cities';
import ProfileHeader from '../components/organisms/ProfileHeader';
import LoyaltyCard from '../components/organisms/LoyaltyCard';

function ProfileScreen() {
  const [name, setName] = useState('Володимир Шепель');
  const [isEditing, setIsEditing] = useState(false);
  const [city, setCity] = useState('Київ');
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Мій профіль</Text>
      </View>
      <View style={{ padding: 16 }}>
        <ProfileHeader
          name={name}
          isEditing={isEditing}
          onChangeName={setName}
          onEdit={() => setIsEditing(true)}
          onSave={() => setIsEditing(false)}
        />

        <LoyaltyCard onHistoryPress={() => {}} />

        <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(true)}>
          <Ionicons name="business" size={20} color="black" />
          <Text style={{ flex: 1, marginLeft: 10, fontSize: 16 }}>Поточне місто: {city}</Text>
          <Ionicons name="chevron-forward" size={16} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings" size={20} color="black" />
          <Text style={{ flex: 1, marginLeft: 10, fontSize: 16 }}>Налаштування</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Оберіть місто</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ fontSize: 18, color: 'blue' }}>Закрити</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={CITIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ paddingVertical: 15, borderBottomWidth: 1, borderColor: '#EEE' }}
                onPress={() => {
                  setCity(item);
                  setModalVisible(false);
                }}
              >
                <Text style={{ fontSize: 18 }}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default ProfileScreen;
