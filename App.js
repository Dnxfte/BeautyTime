import React, { useState, useContext, createContext, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert
} from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// --- КОНТЕКСТ ---
const BookingsContext = createContext();

// --- ДАНІ (MOCK DATA) ---

const CITIES = [
  'Київ', 'Львів', 'Одеса', 'Дніпро', 'Харків', 'Вінниця', 
  'Запоріжжя', 'Івано-Франківськ', 'Луцьк', 'Тернопіль', 
  'Рівне', 'Хмельницький', 'Житомир', 'Чернівці', 'Ужгород',
  'Черкаси', 'Чернігів', 'Полтава', 'Суми', 'Миколаїв', 'Херсон'
];

const TIME_SLOTS = [
    '09:00', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00'
];

// Генерація дат (наступні 4 дні)
const getNextDays = () => {
    const days = [];
    const months = ['Січня', 'Лютого', 'Березня', 'Квітня', 'Травня', 'Червня', 'Липня', 'Серпня', 'Вересня', 'Жовтня', 'Листопада', 'Грудня'];
    
    for (let i = 0; i < 4; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i + 1); // Починаємо з завтра
        days.push({
            day: d.getDate(),
            month: months[d.getMonth()],
            fullDate: d // Об'єкт дати для логіки
        });
    }
    return days;
};

const MASTERS = [
  {
    id: '1',
    name: 'Мельник Олена',
    rating: 4.8,
    reviews: 144,
    tags: ['Манікюр', 'Педікюр', 'Комплекс'],
    address: 'Київ, проспект. Червоної Калини 14/13',
    nextSlot: 'завтра о 18:30',
    salon: 'Салон BeautyLand',
  },
  {
    id: '2',
    name: 'Шевченко Анастасія',
    rating: 4.7,
    reviews: 125,
    tags: ['Манікюр', 'Жіноча стрижка', 'Ламінування'],
    address: 'Київ, вул. Хрещатик 21',
    nextSlot: 'завтра о 10:00',
    salon: 'Салон Style',
  },
  {
    id: '3',
    name: 'Коваленко Ірина',
    rating: 4.9,
    reviews: 80,
    tags: ['Косметологія', 'Чистка', 'Масаж'],
    address: 'Київ, вул. Велика Васильківська 10',
    nextSlot: 'завтра о 12:00',
    salon: 'Beauty Zone',
  },
];

const CHATS = [
  { id: '1', name: 'Майстер Олена', unread: 0 },
  { id: '2', name: 'Майстер Наталія', unread: 0 },
  { id: '3', name: 'Майстер Вікторія', unread: 0 }
];

// --- ЕКРАНИ ---

// 1. ГОЛОВНА
function HomeScreen() {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('Манікюр');
  const [viewMode, setViewMode] = useState('list'); 

  const renderMasterItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('MasterProfile', { master: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarPlaceholder} />
        <View style={styles.masterInfo}>
          <Text style={styles.masterName}>{item.name}</Text>
          <Text style={styles.ratingText}>★ {item.rating} / 5 <Text style={styles.reviewsText}>({item.reviews} відгуки)</Text></Text>
        </View>
      </View>
      <View style={styles.tagsRow}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
        ))}
      </View>
      <View style={styles.galleryRow}>
        <View style={styles.galleryPlaceholder} />
        <View style={styles.galleryPlaceholder} />
        <View style={styles.galleryPlaceholder} />
      </View>
      <View style={styles.footerInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="black" style={{marginRight:4}} />
          <Text style={styles.infoText}>{item.address}</Text>
        </View>
        <View style={[styles.infoRow, { marginTop: 4 }]}>
          <Ionicons name="time-outline" size={14} color="black" style={{marginRight:4}} />
          <Text style={styles.infoText}>Найближча дата: {item.nextSlot}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#888" style={{marginRight:8}} />
          <TextInput style={styles.searchInput} placeholder="Пошук майстра" />
        </View>
        <View style={styles.filtersRow}>
          <TouchableOpacity 
            style={[styles.filterBtn, activeFilter === 'Манікюр' && styles.filterBtnActive]}
            onPress={() => setActiveFilter('Манікюр')}
          >
            <Ionicons name="options-outline" size={16} color="black" style={{marginRight: 4}}/>
            <Text style={[styles.filterText, activeFilter === 'Манікюр' && styles.filterTextActive]}>Манікюр</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="filter" size={20} color="black" /></TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={[styles.iconBtn, viewMode === 'map' && styles.filterBtnActive]} onPress={() => setViewMode('map')}>
             <Ionicons name="map-outline" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, viewMode === 'list' && styles.filterBtnActive]} onPress={() => setViewMode('list')}>
             <Ionicons name="list-outline" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={MASTERS}
        renderItem={renderMasterItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// 2. ПРОФІЛЬ МАЙСТРА (З динамічними датами)
function MasterProfileScreen({ route }) {
  const navigation = useNavigation();
  const { master } = route.params;
  const { addBooking } = useContext(BookingsContext);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  
  // Генеруємо дати динамічно
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
          status: 'active' // Статус нового запису
      };

      addBooking(newBooking);
      
      Alert.alert(
          "Успішно!", 
          `Ви записані до ${master.name} на ${dateStr} о ${selectedTime}`,
          [
              { text: "OK", onPress: () => navigation.navigate('Main', { screen: 'Записи' }) }
          ]
      );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{paddingBottom: 100}}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="share-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={{paddingHorizontal: 16}}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
             <View>
                <Text style={styles.detailName}>{master.name}</Text>
                <Text style={styles.ratingText}>★ {master.rating} / 5</Text>
             </View>
             <View style={[styles.avatarPlaceholder, {width: 60, height: 60, borderRadius: 30}]} />
          </View>
          
          <View style={{marginTop: 15}}>
             <Text style={{fontSize: 16, fontWeight: '500'}}>{master.salon}</Text>
             <View style={{flexDirection:'row', alignItems:'center', marginTop: 4}}>
                <Ionicons name="location-sharp" size={16} color="black" />
                <Text style={[styles.infoText, {marginLeft: 4}]}>{master.address}</Text>
             </View>
          </View>
          
          <View style={styles.mapPlaceholder} />

          <Text style={styles.sectionTitle}>Календар для запису</Text>
          <View style={styles.calendarRow}>
             {dates.map((d, i) => (
                <TouchableOpacity 
                    key={i} 
                    style={[styles.dateBox, selectedDateIndex === i && styles.dateBoxActive]}
                    onPress={() => setSelectedDateIndex(i)}
                >
                   <Text style={[styles.dateText, selectedDateIndex === i && {color:'#FFF', fontWeight:'bold'}]}>
                       {d.day}{'\n'}{d.month}
                   </Text>
                </TouchableOpacity>
             ))}
          </View>
          
          <View style={styles.timePickerRow}>
             <Text style={{fontSize:14, color:'#444'}}>Оберіть бажаний час:</Text>
             <TouchableOpacity style={styles.timeSelect} onPress={() => setTimeModalVisible(true)}>
                 <Text style={{fontWeight:'bold'}}>{selectedTime}</Text>
                 <Ionicons name="chevron-down" size={16}/>
             </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleBooking}>
            <Text style={styles.primaryBtnText}>Записатись</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Послуги</Text>
          {[
            {name: 'Манікюр', price: '500 грн'},
            {name: 'Педікюр', price: '600 грн'},
            {name: 'Комплекс', price: '1000 грн'},
          ].map((s, i) => (
            <View key={i} style={styles.serviceRow}>
              <Text style={styles.serviceName}>{s.name}</Text>
              <Text style={styles.servicePrice}>{s.price}</Text>
            </View>
          ))}
          
          <Text style={styles.sectionTitle}>Портфоліо</Text>
          <View style={styles.galleryRow}>
             <View style={styles.galleryPlaceholder} />
             <View style={styles.galleryPlaceholder} />
             <View style={styles.galleryPlaceholder} />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.stickyFooter}>
          <TouchableOpacity style={[styles.primaryBtn, {flex:1, marginRight: 10}]}>
             <Text style={styles.primaryBtnText}>Вибрати дату</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryBtn, {flex:1}]}>
             <Text style={styles.secondaryBtnText}>Консультація</Text>
          </TouchableOpacity>
      </View>

      <Modal visible={timeModalVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Оберіть час</Text>
                  <FlatList 
                      data={TIME_SLOTS}
                      keyExtractor={item => item}
                      numColumns={3}
                      renderItem={({item}) => (
                          <TouchableOpacity style={styles.timeSlotItem} onPress={() => { setSelectedTime(item); setTimeModalVisible(false); }}>
                              <Text style={{fontSize:16}}>{item}</Text>
                          </TouchableOpacity>
                      )}
                  />
                  <TouchableOpacity onPress={() => setTimeModalVisible(false)} style={{marginTop:20, alignSelf:'center'}}>
                      <Text style={{color:'red', fontSize:16}}>Скасувати</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
    </SafeAreaView>
  );
}

// 3. ЗАПИСИ (З фільтрацією по вкладках)
function BookingsScreen() {
  const { bookings, cancelBooking } = useContext(BookingsContext);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'cancelled' | 'history'

  // Фільтрація записів
  const filteredBookings = bookings.filter(item => {
      if (activeTab === 'active') return item.status === 'active';
      if (activeTab === 'cancelled') return item.status === 'cancelled';
      if (activeTab === 'history') return item.status === 'history';
      return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <Text style={styles.screenTitle}>Мої записи</Text>
      </View>
      <View style={styles.tabsContainer}>
         <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}
            onPress={() => setActiveTab('active')}
         >
             <Text style={activeTab === 'active' ? {color:'#FFF'} : {color:'#000'}}>Активні</Text>
         </TouchableOpacity>
         
         <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'cancelled' && styles.tabBtnActive]}
            onPress={() => setActiveTab('cancelled')}
         >
             <Text style={activeTab === 'cancelled' ? {color:'#FFF'} : {color:'#000'}}>Скасовані</Text>
         </TouchableOpacity>
         
         <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
            onPress={() => setActiveTab('history')}
         >
             <Text style={activeTab === 'history' ? {color:'#FFF'} : {color:'#000'}}>Архів</Text>
         </TouchableOpacity>
      </View>
      
      {filteredBookings.length > 0 ? (
          <FlatList 
            data={filteredBookings}
            keyExtractor={item => item.id}
            contentContainerStyle={{padding: 16}}
            renderItem={({item}) => (
                <View style={[styles.card, { opacity: item.status === 'cancelled' ? 0.7 : 1 }]}>
                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <Text style={{fontWeight:'bold'}}>{item.date}</Text>
                    {item.status === 'cancelled' && <Text style={{color:'red', fontWeight:'bold'}}>СКАСОВАНО</Text>}
                    {item.status !== 'cancelled' && <Ionicons name="ellipsis-horizontal" size={20} />}
                </View>
                <View style={{flexDirection:'row', marginTop: 10, alignItems:'center'}}>
                    <View style={[styles.avatarPlaceholder, {width:40, height:40}]} />
                    <Text style={{marginLeft: 10, fontSize: 16, fontWeight:'600'}}>{item.master}</Text>
                </View>
                <View style={{flexDirection:'row', marginTop: 10}}>
                    <Ionicons name="location-sharp" size={16} />
                    <Text style={{marginLeft: 5, color:'#555'}}>{item.address}</Text>
                </View>
                
                {/* Дії показуємо тільки для АКТИВНИХ записів */}
                {item.status === 'active' && (
                    <View style={styles.bookingActions}>
                        <TouchableOpacity 
                            style={{flexDirection:'row', alignItems:'center', marginRight: 20}}
                            onPress={() => {
                                Alert.alert("Скасувати?", "Запис буде переміщено у вкладку 'Скасовані'", [
                                    { text: "Ні", style: "cancel" },
                                    { text: "Так", onPress: () => cancelBooking(item.id) }
                                ])
                            }}
                        >
                            <Ionicons name="close-circle-outline" size={18} color="red" />
                            <Text style={{marginLeft: 4, color: 'red'}}>Скасувати</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}}>
                            <Ionicons name="chatbubble-outline" size={18} />
                            <Text style={{marginLeft: 4}}>Написати в чат</Text>
                        </TouchableOpacity>
                    </View>
                )}
                </View>
            )}
          />
      ) : (
          <View style={{flex:1, justifyContent:'center', alignItems:'center', marginTop: 50}}>
              <Ionicons name="file-tray-outline" size={48} color="#CCC" />
              <Text style={{color:'#999', marginTop: 10}}>У цьому розділі порожньо</Text>
          </View>
      )}
    </SafeAreaView>
  );
}

// 4. ЧАТИ
function ChatListScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.screenTitle}>Листування</Text></View>
      <FlatList 
        data={CHATS}
        keyExtractor={item => item.id}
        contentContainerStyle={{paddingHorizontal: 16}}
        renderItem={({item}) => (
           <TouchableOpacity 
              style={styles.chatRow}
              onPress={() => navigation.navigate('ChatDetail', { name: item.name })}
           >
              <View style={styles.avatarPlaceholder} />
              <View style={{flex:1, marginLeft: 12, justifyContent:'center'}}>
                 <Text style={{fontSize: 16, fontWeight:'600'}}>{item.name}</Text>
                 <Text style={{color:'#999', fontSize:13, marginTop:2}}>Натисніть, щоб написати...</Text>
              </View>
              {item.unread > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{item.unread}</Text></View>
              )}
           </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function ChatDetailScreen({ route }) {
    const { name } = route.params;
    const navigation = useNavigation();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');

    const sendMessage = () => {
        if (inputText.trim().length === 0) return;
        const newMessage = {
            id: Date.now().toString(),
            text: inputText,
            isMe: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [newMessage, ...prev]);
        setInputText('');
        Keyboard.dismiss();
    };

    return (
        <SafeAreaView style={{flex:1, backgroundColor:'#F2F2F2'}}>
            <View style={[styles.navHeader, {backgroundColor:'#FFF', borderBottomWidth:1, borderColor:'#EEE', paddingVertical: 10}]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{flexDirection:'row', alignItems:'center'}}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                    <View style={[styles.avatarPlaceholder, {width:30, height:30, marginLeft: 10}]} />
                    <Text style={{fontSize:18, fontWeight:'bold', marginLeft:10}}>{name}</Text>
                </TouchableOpacity>
            </View>

            <FlatList 
                data={messages}
                keyExtractor={item => item.id}
                inverted 
                contentContainerStyle={{padding: 16}}
                ListEmptyComponent={
                    <View style={{alignItems:'center', marginTop: 50, opacity: 0.5}}>
                        <Ionicons name="chatbubbles-outline" size={48} color="#999" />
                        <Text style={{color:'#999', marginTop:10}}>Історія повідомлень пуста.</Text>
                        <Text style={{color:'#999'}}>Напишіть перше повідомлення!</Text>
                    </View>
                }
                renderItem={({item}) => (
                    <View style={[
                        styles.messageBubble, 
                        item.isMe ? styles.myMessage : styles.theirMessage
                    ]}>
                        <Text style={[styles.messageText, item.isMe ? {color:'#FFF'} : {color:'#000'}]}>{item.text}</Text>
                        <Text style={[styles.messageTime, item.isMe ? {color:'#CCC'} : {color:'#666'}]}>{item.time}</Text>
                    </View>
                )}
            />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={10}>
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.chatInput}
                        placeholder="Написати повідомлення..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                        <Ionicons name="arrow-up" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

// 5. ПРОФІЛЬ
function ProfileScreen() {
  const [name, setName] = useState('Володимир Шепель');
  const [isEditing, setIsEditing] = useState(false);
  const [city, setCity] = useState('Київ');
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.screenTitle}>Мій профіль</Text></View>
      <View style={{padding: 16}}>
         <View style={{flexDirection:'row', alignItems:'center', marginBottom: 20}}>
            <View style={[styles.avatarPlaceholder, {width:60, height:60, borderRadius:30}]} />
            <View style={{marginLeft: 15, flex: 1}}>
               {isEditing ? (
                   <View style={{flexDirection:'row', alignItems:'center'}}>
                       <TextInput 
                           value={name}
                           onChangeText={setName}
                           style={{borderBottomWidth:1, fontSize: 20, fontWeight:'bold', flex:1, paddingVertical:0}}
                           autoFocus
                       />
                       <TouchableOpacity onPress={() => setIsEditing(false)} style={{marginLeft:10}}>
                           <Ionicons name="checkmark-circle" size={24} color="black"/>
                       </TouchableOpacity>
                   </View>
               ) : (
                   <View>
                        <Text style={{fontSize: 20, fontWeight:'bold'}}>{name}</Text>
                        <TouchableOpacity 
                            style={{flexDirection:'row', alignItems:'center', marginTop: 4}}
                            onPress={() => setIsEditing(true)}
                        >
                            <Ionicons name="pencil" size={12} color="black"/>
                            <Text style={{marginLeft: 4, fontWeight:'500'}}>Редагувати</Text>
                        </TouchableOpacity>
                   </View>
               )}
            </View>
         </View>

         <View style={styles.loyaltyCard}>
            <Text style={{fontWeight:'500'}}>Програма лояльності</Text>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-end', marginTop: 30}}>
               <Text style={{fontSize: 32, fontWeight:'bold'}}>10%</Text>
               <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}}>
                   <Ionicons name="time-outline" size={16} />
                   <Text style={{marginLeft: 4}}>Історія</Text>
               </TouchableOpacity>
            </View>
         </View>

         <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(true)}>
             <Ionicons name="business" size={20} color="black"/>
             <Text style={{flex:1, marginLeft: 10, fontSize: 16}}>Поточне місто: {city}</Text>
             <Ionicons name="chevron-forward" size={16} color="#888"/>
         </TouchableOpacity>

         <TouchableOpacity style={styles.menuItem}>
             <Ionicons name="settings" size={20} color="black"/>
             <Text style={{flex:1, marginLeft: 10, fontSize: 16}}>Налаштування</Text>
         </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
          <View style={{flex:1, padding: 20}}>
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
                  <Text style={{fontSize:22, fontWeight:'bold'}}>Оберіть місто</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={{fontSize:18, color:'blue'}}>Закрити</Text>
                  </TouchableOpacity>
              </View>
              <FlatList 
                  data={CITIES}
                  keyExtractor={item => item}
                  renderItem={({item}) => (
                      <TouchableOpacity 
                        style={{paddingVertical: 15, borderBottomWidth:1, borderColor:'#EEE'}}
                        onPress={() => { setCity(item); setModalVisible(false); }}
                      >
                          <Text style={{fontSize:18}}>{item}</Text>
                      </TouchableOpacity>
                  )}
              />
          </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- НАВІГАЦІЯ ---
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ChatStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        </Stack.Navigator>
    );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { height: 70, paddingBottom: 10, backgroundColor: '#C4C4C4' },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 10, marginTop: -5 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Головна') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Записи') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Чат') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          else if (route.name === 'Профіль') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Головна" component={HomeScreen} />
      <Tab.Screen name="Записи" component={BookingsScreen} />
      <Tab.Screen name="Чат" component={ChatStack} />
      <Tab.Screen name="Профіль" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  // Початкові дані теж динамічні (завтрашня дата)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getDate()}.${tomorrow.getMonth() + 1}.${tomorrow.getFullYear()}`;

  const [bookings, setBookings] = useState([
      {
        id: '1',
        date: `${tomorrowStr} о 18:30`,
        master: 'Мельник Олена',
        address: 'Київ, проспект. Червоної Калини 14/13',
        status: 'active',
      }
  ]);

  const addBooking = (newBooking) => {
      setBookings((prev) => [newBooking, ...prev]);
  };

  // Змінюємо статус на "cancelled" замість видалення
  const cancelBooking = (id) => {
      setBookings((prev) => prev.map(item => 
          item.id === id ? { ...item, status: 'cancelled' } : item
      ));
  };

  return (
    <BookingsContext.Provider value={{ bookings, addBooking, cancelBooking }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={BottomTabs} />
          <Stack.Screen name="MasterProfile" component={MasterProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </BookingsContext.Provider>
  );
}

// --- СТИЛІ ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  headerContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  header: { padding: 16 },
  screenTitle: { fontSize: 28, fontWeight: 'bold' },
  
  // Search & Filters
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 10, height: 44, borderWidth: 1, borderColor: '#E0E0E0' },
  searchInput: { flex: 1, fontSize: 16, color: '#000' },
  filtersRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  filterBtn: { flexDirection:'row', alignItems:'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E0E0E0' },
  filterBtnActive: { backgroundColor: '#C4C4C4' },
  filterText: { color: '#000' },
  filterTextActive: { fontWeight: '600', color: '#000' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },

  // Lists & Cards
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', marginBottom: 12 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#CCC' },
  masterInfo: { marginLeft: 12, justifyContent: 'center' },
  masterName: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  ratingText: { fontSize: 14, color: '#000', marginTop: 2, fontWeight: '600' },
  reviewsText: { color: '#666', fontWeight: '400' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 8 },
  tag: { backgroundColor: '#E0E0E0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 13, color: '#333' },

  galleryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  galleryPlaceholder: { width: '31%', aspectRatio: 1, backgroundColor: '#D1D1D1', borderRadius: 4 },

  footerInfo: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 13, color: '#333' },

  // Master Profile
  navHeader: { flexDirection: 'row', justifyContent:'space-between', padding: 16 },
  detailName: { fontSize: 24, fontWeight: 'bold' },
  mapPlaceholder: { height: 80, backgroundColor: '#CCC', borderRadius: 8, marginVertical: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, marginTop: 10 },
  
  calendarRow: { flexDirection: 'row', justifyContent:'space-between', marginBottom: 15 },
  dateBox: { width: '23%', aspectRatio: 1, borderWidth: 1, borderColor: '#CCC', borderRadius: 10, justifyContent:'center', alignItems:'center', backgroundColor: '#FFF' },
  dateBoxActive: { backgroundColor: '#999', borderColor: '#999' },
  dateText: { textAlign: 'center', fontSize: 12 },

  timePickerRow: { flexDirection: 'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'#DDD', padding: 10, borderRadius: 8, marginBottom: 15 },
  timeSelect: { flexDirection:'row', backgroundColor:'#FFF', padding: 5, borderRadius: 4, alignItems:'center', gap: 5, minWidth: 80, justifyContent:'center' },
  
  primaryBtn: { backgroundColor: '#000', paddingVertical: 14, borderRadius: 25, alignItems:'center', justifyContent:'center' },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  secondaryBtn: { backgroundColor: '#999', paddingVertical: 14, borderRadius: 25, alignItems:'center', justifyContent:'center' },
  secondaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#EEE' },
  serviceName: { fontSize: 16 },
  servicePrice: { fontWeight: '600' },
  
  stickyFooter: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', padding: 16, backgroundColor: '#F2F2F2', borderTopWidth: 1, borderColor: '#DDD' },

  // Bookings
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 10 },
  tabBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
  tabBtnActive: { backgroundColor: '#666' },
  bookingActions: { flexDirection: 'row', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderColor: '#F0F0F0' },

  // Chat
  chatRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#EEE' },
  badge: { backgroundColor: '#000', width: 20, height: 20, borderRadius: 10, justifyContent:'center', alignItems:'center' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight:'bold' },
  
  inputContainer: { flexDirection:'row', padding: 10, backgroundColor:'#FFF', alignItems:'center', borderTopWidth:1, borderColor:'#EEE' },
  chatInput: { flex:1, backgroundColor:'#F2F2F2', borderRadius:20, paddingHorizontal:15, paddingVertical:10, maxHeight:100, fontSize:16 },
  sendButton: { width:40, height:40, borderRadius:20, backgroundColor:'#000', justifyContent:'center', alignItems:'center', marginLeft:10 },
  messageBubble: { maxWidth:'80%', padding:12, borderRadius:16, marginBottom:10 },
  myMessage: { alignSelf:'flex-end', backgroundColor:'#000', borderBottomRightRadius:0 },
  theirMessage: { alignSelf:'flex-start', backgroundColor:'#FFF', borderBottomLeftRadius:0 },
  messageText: { fontSize:16 },
  messageTime: { fontSize:10, marginTop:4, alignSelf:'flex-end' },

  // Profile
  loyaltyCard: { backgroundColor: '#C4C4C4', borderRadius: 12, padding: 20, height: 160, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#E0E0E0' },

  // Modals
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  modalContent: { width:'80%', backgroundColor:'#FFF', borderRadius:20, padding:20, maxHeight:'50%' },
  modalTitle: { fontSize:20, fontWeight:'bold', marginBottom:20, textAlign:'center' },
  timeSlotItem: { flex:1, margin:5, backgroundColor:'#F2F2F2', padding:15, borderRadius:10, alignItems:'center' }
});