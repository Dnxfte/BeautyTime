import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';

// 1. MOCK DATA (Дані з твого скріншоту)
const MASTERS = [
  {
    id: '1',
    name: 'Мельник Олена',
    rating: 4.8,
    reviews: 144,
    avatar: 'https://i.pravatar.cc/150?img=5', // Випадкове фото
    tags: ['Манікюр', 'Педікюр', 'Комплекс'],
    address: 'Київ, проспект. Червоної Калини 14/13',
    nextSlot: 'сьогодні о 18:30',
  },
  {
    id: '2',
    name: 'Шевченко Анастасія',
    rating: 4.7,
    reviews: 125,
    avatar: 'https://i.pravatar.cc/150?img=9',
    tags: ['Манікюр', 'Жіноча стрижка', 'Ламінування'],
    address: 'Київ, вул. Хрещатик 21',
    nextSlot: 'завтра о 10:00',
  },
];

export default function HomeScreen() {
  
  // Рендер однієї картки майстра
  const renderMasterItem = ({ item }) => (
    <View style={styles.card}>
      {/* Header картки: Аватар + Інфо */}
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.masterInfo}>
          <Text style={styles.masterName}>{item.name}</Text>
          <Text style={styles.ratingText}>
            ★ {item.rating} / 5 <Text style={styles.reviewsText}>({item.reviews} відгуки)</Text>
          </Text>
        </View>
      </View>

      {/* Теги послуг */}
      <View style={styles.tagsRow}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Галерея (3 сірі блоки як на макеті) */}
      <View style={styles.galleryRow}>
        <View style={styles.galleryPlaceholder} />
        <View style={styles.galleryPlaceholder} />
        <View style={styles.galleryPlaceholder} />
      </View>

      {/* Адреса та час */}
      <View style={styles.footerInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.infoText}>{item.address}</Text>
        </View>
        <View style={[styles.infoRow, { marginTop: 4 }]}>
          <Text style={styles.icon}>🕒</Text>
          <Text style={styles.infoText}>Найближча дата: {item.nextSlot}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* --- HEADER SECTION --- */}
      <View style={styles.headerContainer}>
        {/* Пошук */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            style={styles.searchInput}
            placeholder="Пошук майстра"
            placeholderTextColor="#888"
          />
        </View>

        {/* Фільтри (Рядок з кнопками) */}
        <View style={styles.filtersRow}>
          <TouchableOpacity style={[styles.filterBtn, styles.filterBtnActive]}>
            <Text style={styles.filterTextActive}>💅 Манікюр</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.btnIconText}>🎚️</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} /> 

          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.btnIconText}>🗺️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconBtn}>
             <Text style={styles.btnIconText}>⬇️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- MAIN CONTENT (LIST) --- */}
      <FlatList
        data={MASTERS}
        renderItem={renderMasterItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* --- BOTTOM NAVIGATION --- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navActive]}>🏠</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Головна</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navLabel}>Записи</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💬</Text>
          <Text style={styles.navLabel}>Чат</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Профіль</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2', // Світло-сірий фон екрану
  },
  
  // Header Styles
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#F2F2F2',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 44,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  filterBtnActive: {
    backgroundColor: '#BDBDBD', // Темніший сірий для активного
  },
  filterTextActive: {
    fontWeight: '600',
    color: '#000',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0', // Круглі кнопки
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnIconText: {
    fontSize: 18,
  },

  // List Styles
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Відступ під нижнє меню
  },

  // Card Styles
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Тінь (Shadow)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2, // Android shadow
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#CCC',
  },
  masterInfo: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  masterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  ratingText: {
    fontSize: 14,
    color: '#000',
    marginTop: 2,
    fontWeight: '600',
  },
  reviewsText: {
    color: '#666',
    fontWeight: '400',
  },
  
  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#333',
  },

  // Gallery
  galleryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  galleryPlaceholder: {
    width: '31%', // Щоб влізло 3 штуки
    aspectRatio: 1, // Квадрат
    backgroundColor: '#D1D1D1',
    borderRadius: 4,
  },

  // Footer Info
  footerInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
    fontSize: 14,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
  },

  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70, // Висота таббару
    backgroundColor: '#C4C4C4', // Темно-сірий фон як на макеті
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    color: '#555',
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 10,
    color: '#555',
  },
  navActive: {
    color: '#000',
    fontWeight: 'bold',
  },
});