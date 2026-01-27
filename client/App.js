import React, { useState, useContext, createContext, useEffect } from "react";
import { supabase } from "./supabaseConfig";
import {
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
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  StyleSheet
} from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker'; 
import { WebView } from 'react-native-webview'; // ✅ Імпорт для карти

// Імпорти для свайпів
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

// ПІДКЛЮЧАЄМО СТИЛІ
import { styles } from "./styles";

// --- КОНТЕКСТ ---
const BookingsContext = createContext();

// --- ДАНІ (MOCK DATA) ---
const CITIES = [
  "Київ", "Львів", "Одеса", "Дніпро", "Харків", "Вінниця", "Запоріжжя",
  "Івано-Франківськ", "Луцьк", "Тернопіль", "Рівне", "Хмельницький",
  "Житомир", "Чернівці", "Ужгород", "Черкаси", "Чернігів", "Полтава",
  "Суми", "Миколаїв", "Херсон",
];

const TIME_SLOTS = [
  "09:00", "10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00",
];

const getNextDays = () => {
  const days = [];
  const months = ["Січня", "Лютого", "Березня", "Квітня", "Травня", "Червня", "Липня", "Серпня", "Вересня", "Жовтня", "Листопада", "Грудня"];
  for (let i = 0; i < 4; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    days.push({ day: d.getDate(), month: months[d.getMonth()], fullDate: d });
  }
  return days;
};

// --- ГЕНЕРАТОР HTML ДЛЯ КАРТИ LEAFLET (✅ НОВА ФУНКЦІЯ) ---
const getLeafletHTML = (lat, lng, name) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${lat}, ${lng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    L.marker([${lat}, ${lng}]).addTo(map)
      .bindPopup('<b>${name}</b><br>Салон краси')
      .openPopup();
  </script>
</body>
</html>
`;

// 👇👇👇 ЕКРАН АВТОРИЗАЦІЇ 👇👇👇
function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert("Помилка", "Введіть Email та пароль");
      return;
    }
    if (!isLogin && (!firstName || !lastName)) {
      Alert.alert("Помилка", "Введіть Ім'я та Прізвище");
      return;
    }
    
    if (!isLogin && password.length < 6) {
      Alert.alert("Слабкий пароль", "Пароль має містити мінімум 6 символів");
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        });
        if (error) throw error;
        Alert.alert("Успішно!", "Акаунт створено. Тепер увійдіть.");
        setIsLogin(true);
      }
    } catch (error) {
      if (error.message.includes("already registered")) {
        Alert.alert("Помилка", "Такий користувач вже існує. Спробуйте увійти.");
      } else {
        Alert.alert("Помилка", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={authStyles.container}>
      <View style={authStyles.card}>
        <Text style={authStyles.title}>{isLogin ? "Вхід у BeautyTime" : "Реєстрація"}</Text>
        
        {!isLogin && (
          <>
            <TextInput placeholder="Ім'я" value={firstName} onChangeText={setFirstName} style={authStyles.input} />
            <TextInput placeholder="Прізвище" value={lastName} onChangeText={setLastName} style={authStyles.input} />
          </>
        )}

        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={authStyles.input} keyboardType="email-address" />
        <TextInput placeholder="Пароль (мін. 6 символів)" value={password} onChangeText={setPassword} secureTextEntry style={authStyles.input} />

        <TouchableOpacity style={authStyles.button} onPress={handleAuth} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={authStyles.buttonText}>{isLogin ? "Увійти" : "Зареєструватись"}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 20 }}>
          <Text style={authStyles.switchText}>{isLogin ? "Немає акаунту? Зареєструватись" : "Вже є акаунт? Увійти"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const authStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: "#F5F5F5", padding: 20 },
  card: { backgroundColor: "white", padding: 30, borderRadius: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#333" },
  input: { backgroundColor: "#F0F0F0", padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: "#000", padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  switchText: { textAlign: "center", color: "#007AFF", marginTop: 10 },
});

// --- ЕКРАНИ ---

// 1. ГОЛОВНА
function HomeScreen() {
  const navigation = useNavigation();
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMasters(); }, []);

  const fetchMasters = async () => {
    try {
      const { data, error } = await supabase.from("masters").select("*");
      if (!error) setMasters(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const renderMasterItem = ({ item }) => {
    const tagsList = item.tags ? item.tags.split(",").map((tag) => tag.trim()) : [];
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => navigation.navigate("MasterProfile", { master: item })}>
        <View style={styles.cardHeader}>
          {item.avatar_url ? <Image source={{ uri: item.avatar_url }} style={styles.avatarPlaceholder} resizeMode="cover" /> : <View style={styles.avatarPlaceholder} />}
          <View style={styles.masterInfo}>
            <Text style={styles.masterName}>{item.name}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}><Text style={styles.ratingText}>★ {item.rating || 0} / 5</Text><Text style={styles.reviewsText}> ({item.reviews_count || 0} відгуки)</Text></View>
          </View>
        </View>
        {tagsList.length > 0 && <View style={styles.tagsRow}>{tagsList.map((tag, index) => <View key={index} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}</View>}
        <View style={styles.galleryRow}>
          {item.portfolio_urls && item.portfolio_urls.length > 0 ? item.portfolio_urls.slice(0, 3).map((url, index) => <Image key={index} source={{ uri: url }} style={styles.galleryPlaceholder} resizeMode="cover" />) : <><View style={styles.galleryPlaceholder}/><View style={styles.galleryPlaceholder}/><View style={styles.galleryPlaceholder}/></>}
        </View>
        <View style={styles.footerInfo}>
          <View style={[styles.infoRow, { marginBottom: 4 }]}><Ionicons name="location-outline" size={16} color="#000" style={{ marginRight: 4 }} /><Text style={styles.infoText}>{item.address}</Text></View>
          {item.next_slot && <View style={styles.infoRow}><Ionicons name="time-outline" size={16} color="#000" style={{ marginRight: 4 }} /><Text style={styles.infoText}>Найближча дата: {item.next_slot}</Text></View>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.headerContainer}>
        <View style={styles.searchBar}><Ionicons name="search" size={18} color="#888" style={{ marginRight: 8 }} /><TextInput style={styles.searchInput} placeholder="Пошук майстра" placeholderTextColor="#888" /></View>
      </View>
      {loading ? <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator size="large" color="#000" /></View> : 
      <FlatList data={masters} renderItem={renderMasterItem} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>Список пустий</Text>} />}
    </SafeAreaView>
  );
}

// 2. ПРОФІЛЬ МАЙСТРА
function MasterProfileScreen({ route }) {
  const navigation = useNavigation();
  const { master } = route.params;
  const { addBooking, startChat, userEmail } = useContext(BookingsContext);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [dates, setDates] = useState([]);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  useEffect(() => { setDates(getNextDays()); }, []);
  const screenWidth = Dimensions.get('window').width;
  const photoSize = (screenWidth - 32 - 20) / 3; 

  // ✅ КООРДИНАТИ ДЛЯ КАРТИ (Дефолт - Вінниця)
  const mapLat = master.lat || 49.2331;
  const mapLng = master.lng || 28.4682;

  const handleBooking = async () => {
    if (!selectedService) { Alert.alert("Увага", "Будь ласка, оберіть послугу зі списку перед записом."); return; }
    const d = dates[selectedDateIndex];
    const fullDateTime = `${d.day} ${d.month} ${d.fullDate.getFullYear()} о ${selectedTime}`;

    try {
      const { data, error } = await supabase.from("bookings").insert([{ master_name: master.name, client_name: userEmail, service_name: selectedService.name, date_time: fullDateTime, status: "active" }]).select();
      if (error) { Alert.alert("Помилка", "Не вдалося записатись."); } 
      else {
        const newBooking = { id: data[0].id.toString(), date: fullDateTime, master: master.name, address: master.address, status: "active", avatar_url: master.avatar_url };
        addBooking(newBooking);
        Alert.alert("Успішно!", `Ви записані на ${selectedService.name} до ${master.name}`, [{ text: "OK", onPress: () => navigation.navigate("Main", { screen: "Записи" }) }]);
      }
    } catch (e) { console.log(e); }
  };

  const handleConsultation = () => {
    startChat(master.name, master.avatar_url);
    const uniqueChatId = `${master.name}:${userEmail}`;
    navigation.navigate("Main", { screen: "Чат", params: { screen: "ChatDetail", params: { chatId: uniqueChatId, name: master.name, avatar: master.avatar_url } } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.navHeader}><TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="black" /></TouchableOpacity><TouchableOpacity><Ionicons name="share-outline" size={24} color="black" /></TouchableOpacity></View>
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View><Text style={styles.detailName}>{master.name}</Text><Text style={styles.ratingText}>★ {master.rating} / 5</Text></View>
            {master.avatar_url ? <Image source={{ uri: master.avatar_url }} style={{ width: 60, height: 60, borderRadius: 30 }} resizeMode="cover" /> : <View style={[styles.avatarPlaceholder, { width: 60, height: 60, borderRadius: 30 }]} />}
          </View>
          <View style={{ marginTop: 15 }}><Text style={{ fontSize: 16, fontWeight: "500" }}>Салон краси</Text><View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}><Ionicons name="location-sharp" size={16} color="black" /><Text style={[styles.infoText, { marginLeft: 4 }]}>{master.address}</Text></View></View>
          
          {/* ✅ КАРТА LEAFLET */}
          <View style={{ height: 200, marginTop: 15, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' }}>
             <WebView 
                originWhitelist={['*']}
                source={{ html: getLeafletHTML(mapLat, mapLng, master.name) }}
                style={{ flex: 1 }}
                scrollEnabled={false} // Щоб не конфліктувало зі скролом сторінки
             />
          </View>

          <Text style={styles.sectionTitle}>Календар для запису</Text>
          <View style={styles.calendarRow}>{dates.map((d, i) => (<TouchableOpacity key={i} style={[styles.dateBox, selectedDateIndex === i && styles.dateBoxActive]} onPress={() => setSelectedDateIndex(i)}><Text style={[styles.dateText, selectedDateIndex === i && { color: "#FFF", fontWeight: "bold" }]}>{d.day}{"\n"}{d.month}</Text></TouchableOpacity>))}</View>
          <View style={styles.timePickerRow}><Text style={{ fontSize: 14, color: "#444" }}>Оберіть бажаний час:</Text><TouchableOpacity style={styles.timeSelect} onPress={() => setTimeModalVisible(true)}><Text style={{ fontWeight: "bold" }}>{selectedTime}</Text><Ionicons name="chevron-down" size={16} /></TouchableOpacity></View>
          <Text style={styles.sectionTitle}>Послуги</Text>
          {master.services && Array.isArray(master.services) ? master.services.map((s, i) => { const isSelected = selectedService && selectedService.name === s.name; return (<TouchableOpacity key={i} style={[styles.serviceRow, isSelected && { backgroundColor: "#E0E0E0", borderColor: "#000", borderWidth: 1 }]} onPress={() => setSelectedService(s)}><Text style={[styles.serviceName, isSelected && { fontWeight: "bold" }]}>{s.name}</Text><Text style={[styles.servicePrice, isSelected && { fontWeight: "bold" }]}>{s.price}</Text></TouchableOpacity>); }) : <Text style={{ color: "#888", fontStyle: "italic", marginTop: 5 }}>Оберіть послугу зі списку (список пустий)</Text>}
          <Text style={styles.sectionTitle}>Портфоліо</Text>
          {master.portfolio_urls && master.portfolio_urls.length > 0 ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>{master.portfolio_urls.map((url, index) => (<TouchableOpacity key={index} onPress={() => setFullScreenImage(url)}><Image source={{ uri: url }} style={{ width: photoSize, height: photoSize, borderRadius: 12, backgroundColor: '#f0f0f0' }} resizeMode="cover" /></TouchableOpacity>))}</View> : <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}><View style={[styles.galleryPlaceholder, { width: photoSize, height: photoSize }]} /><View style={[styles.galleryPlaceholder, { width: photoSize, height: photoSize }]} /></View>}
        </View>
      </ScrollView>
      <View style={styles.stickyFooter}><TouchableOpacity style={[styles.primaryBtn, { flex: 1, marginRight: 10 }]} onPress={handleBooking}><Text style={styles.primaryBtnText}>Записатись</Text></TouchableOpacity><TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={handleConsultation}><Text style={styles.secondaryBtnText}>Консультація</Text></TouchableOpacity></View>
      <Modal visible={timeModalVisible} animationType="fade" transparent={true}><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Оберіть час</Text><FlatList data={TIME_SLOTS} keyExtractor={(item) => item} numColumns={3} renderItem={({ item }) => (<TouchableOpacity style={styles.timeSlotItem} onPress={() => { setSelectedTime(item); setTimeModalVisible(false); }}><Text style={{ fontSize: 16 }}>{item}</Text></TouchableOpacity>)} /><TouchableOpacity onPress={() => setTimeModalVisible(false)} style={{ marginTop: 20, alignSelf: "center" }}><Text style={{ color: "red", fontSize: 16 }}>Скасувати</Text></TouchableOpacity></View></View></Modal>
      <Modal visible={!!fullScreenImage} transparent={true} animationType="fade"><View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}><TouchableOpacity style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }} onPress={() => setFullScreenImage(null)}><Ionicons name="close-circle" size={40} color="white" /></TouchableOpacity>{fullScreenImage && <Image source={{ uri: fullScreenImage }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />}</View></Modal>
    </SafeAreaView>
  );
}

// 3. ЗАПИСИ
function BookingsScreen() {
  const navigation = useNavigation();
  const { bookings, cancelBooking, startChat, userEmail } = useContext(BookingsContext);
  const [activeTab, setActiveTab] = useState("active");
  const filteredBookings = bookings.filter((item) => {
    if (activeTab === "active") return item.status === "active";
    if (activeTab === "cancelled") return item.status === "cancelled";
    if (activeTab === "history") return item.status === "history";
    return true;
  });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.screenTitle}>Мої записи</Text></View>
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tabBtn, activeTab === "active" && styles.tabBtnActive]} onPress={() => setActiveTab("active")}><Text style={activeTab === "active" ? { color: "#FFF" } : { color: "#000" }}>Активні</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === "cancelled" && styles.tabBtnActive]} onPress={() => setActiveTab("cancelled")}><Text style={activeTab === "cancelled" ? { color: "#FFF" } : { color: "#000" }}>Скасовані</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, activeTab === "history" && styles.tabBtnActive]} onPress={() => setActiveTab("history")}><Text style={activeTab === "history" ? { color: "#FFF" } : { color: "#000" }}>Архів</Text></TouchableOpacity>
      </View>
      {filteredBookings.length > 0 ? <FlatList data={filteredBookings} keyExtractor={(item) => item.id} contentContainerStyle={{ padding: 16 }} renderItem={({ item }) => (<View style={[styles.card, { opacity: item.status === "cancelled" ? 0.7 : 1 }]}><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ fontWeight: "bold" }}>{item.date}</Text>{item.status === "cancelled" && <Text style={{ color: "red", fontWeight: "bold" }}>СКАСОВАНО</Text>}{item.status !== "cancelled" && <Ionicons name="ellipsis-horizontal" size={20} />}</View><View style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}>{item.avatar_url ? <Image source={{ uri: item.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20 }} resizeMode="cover" /> : <View style={[styles.avatarPlaceholder, { width: 40, height: 40 }]} />}<Text style={{ marginLeft: 10, fontSize: 16, fontWeight: "600" }}>{item.master}</Text></View><View style={{ flexDirection: "row", marginTop: 10 }}><Ionicons name="location-sharp" size={16} /><Text style={{ marginLeft: 5, color: "#555" }}>{item.address}</Text></View>{item.status === "active" && (<View style={styles.bookingActions}><TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }} onPress={() => { Alert.alert("Скасувати?", "Запис буде переміщено у вкладку 'Скасовані'", [{ text: "Ні", style: "cancel" }, { text: "Так", onPress: () => cancelBooking(item.id) }]); }}><Ionicons name="close-circle-outline" size={18} color="red" /><Text style={{ marginLeft: 4, color: "red" }}>Скасувати</Text></TouchableOpacity><TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => { const uniqueChatId = `${item.master}:${userEmail}`; startChat(item.master, item.avatar_url); navigation.navigate("Чат", { screen: "ChatDetail", params: { chatId: uniqueChatId, name: item.master, avatar: item.avatar_url } }); }}><Ionicons name="chatbubble-outline" size={18} /><Text style={{ marginLeft: 4 }}>Написати в чат</Text></TouchableOpacity></View>)}</View>)} /> : <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 }}><Ionicons name="file-tray-outline" size={48} color="#CCC" /><Text style={{ color: "#999", marginTop: 10 }}>У цьому розділі порожньо</Text></View>}
    </SafeAreaView>
  );
}

// 4. ЧАТИ
function ChatListScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const { chats, deleteChat } = useContext(BookingsContext);
  useEffect(() => { setLoading(false); }, []);
  const renderRightActions = (progress, dragX, chatId) => { return (<TouchableOpacity style={{ backgroundColor: '#ff4444', justifyContent: 'center', alignItems: 'center', width: 80, height: '100%' }} onPress={() => deleteChat(chatId)}><Ionicons name="trash-outline" size={30} color="#fff" /></TouchableOpacity>); };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.screenTitle}>Листування</Text></View>
      {loading ? <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} /> : <FlatList data={chats} keyExtractor={(item) => item.id} contentContainerStyle={{ paddingHorizontal: 16 }} ListEmptyComponent={<View style={{ alignItems: "center", marginTop: 50 }}><Ionicons name="chatbubbles-outline" size={48} color="#CCC" /><Text style={{ color: "#999", marginTop: 10 }}>Поки немає діалогів</Text></View>} renderItem={({ item }) => (<Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}><TouchableOpacity style={[styles.chatRow, { backgroundColor: 'white' }]} activeOpacity={1} onPress={() => { const uniqueChatId = item.id; navigation.navigate("ChatDetail", { chatId: uniqueChatId, name: item.name, avatar: item.avatar }); }}>{item.avatar ? <Image source={{ uri: item.avatar }} style={{ width: 50, height: 50, borderRadius: 25 }} resizeMode="cover" /> : <View style={styles.avatarPlaceholder} />}<View style={{ flex: 1, marginLeft: 12, justifyContent: "center" }}><Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text><Text numberOfLines={1} style={{ color: "#999", fontSize: 13, marginTop: 2 }}>{item.lastMessage}</Text></View></TouchableOpacity></Swipeable>)} />}
    </SafeAreaView>
  );
}

// ДЕТАЛІ ЧАТУ
function ChatDetailScreen({ route }) {
  const { chatId, name, avatar } = route.params;
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    fetchHistory();
    const channel = supabase.channel("realtime_messages").on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` }, (payload) => { const newMsg = payload.new; setMessages((prev) => [{ id: newMsg.id.toString(), text: newMsg.text, isMe: newMsg.sender === "client", time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...prev]); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchHistory = async () => { const { data, error } = await supabase.from("messages").select("*").eq("chat_id", chatId).order("created_at", { ascending: false }); if (!error && data) { const formatted = data.map((m) => ({ id: m.id.toString(), text: m.text, isMe: m.sender === "client", time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })); setMessages(formatted); } };
  const sendMessage = async () => { if (inputText.trim().length === 0) return; const textToSend = inputText; setInputText(""); try { await supabase.from("messages").insert([{ chat_id: chatId, sender: "client", text: textToSend }]); } catch (e) { console.log(e); } Keyboard.dismiss(); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F2F2F2" }}>
      <View style={[styles.navHeader, { backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#EEE", paddingVertical: 10 }]}>
        <TouchableOpacity onPress={() => navigation.navigate("ChatList")} style={{ flexDirection: "row", alignItems: "center" }}><Ionicons name="arrow-back" size={24} color="black" />{avatar ? <Image source={{ uri: avatar }} style={{ width: 35, height: 35, borderRadius: 17.5, marginLeft: 10 }} /> : <View style={[styles.avatarPlaceholder, { width: 35, height: 35, marginLeft: 10 }]} />}<Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>{name}</Text></TouchableOpacity>
      </View>
      <FlatList data={messages} keyExtractor={(item) => item.id} inverted contentContainerStyle={{ padding: 16 }} ListEmptyComponent={<View style={{ transform: [{ scaleY: -1 }], alignItems: "center", marginTop: 50, opacity: 0.5 }}><Ionicons name="chatbubbles-outline" size={48} color="#999" /><Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>Немає повідомлень</Text></View>} renderItem={({ item }) => (<View style={[styles.messageBubble, item.isMe ? styles.myMessage : styles.theirMessage]}><Text style={[styles.messageText, item.isMe ? { color: "#FFF" } : { color: "#000" }]}>{item.text}</Text><Text style={[styles.messageTime, item.isMe ? { color: "#CCC" } : { color: "#666" }]}>{item.time}</Text></View>)} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={10}><View style={styles.inputContainer}><TextInput style={styles.chatInput} placeholder="Написати повідомлення..." value={inputText} onChangeText={setInputText} /><TouchableOpacity onPress={sendMessage} style={styles.sendButton}><Ionicons name="arrow-up" size={20} color="#FFF" /></TouchableOpacity></View></KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 5. ПРОФІЛЬ (ОНОВЛЕНО: РЕДАГУВАННЯ ДАНИХ ТА ФОТО)
function ProfileScreen() {
  const [city, setCity] = useState("Київ");
  const [modalVisible, setModalVisible] = useState(false);
  const { userEmail, userMetadata, refreshUser } = useContext(BookingsContext);

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(userMetadata?.first_name || "");
  const [lastName, setLastName] = useState(userMetadata?.last_name || "");
  const [loading, setLoading] = useState(false);

  // Оновлюємо стейт, якщо дані прийшли пізніше
  useEffect(() => {
    if (userMetadata) {
        setFirstName(userMetadata.first_name || "");
        setLastName(userMetadata.last_name || "");
    }
  }, [userMetadata]);

  const handleLogout = async () => { await supabase.auth.signOut(); };
  const handleDeleteAccount = () => { Alert.alert("Видалити акаунт?", "Цю дію неможливо скасувати.", [{ text: "Скасувати", style: "cancel" }, { text: "Видалити", style: "destructive", onPress: async () => { await supabase.auth.signOut(); Alert.alert("Акаунт деактивовано"); } }]); };

  // --- ЛОГІКА ЗМІНИ ФОТО ---
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        uploadAvatar(selectedImage.uri);
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Помилка", "Не вдалося відкрити галерею");
    }
  };

  const uploadAvatar = async (uri) => {
    setLoading(true);
    try {
        // 1. Отримуємо файл у форматі FormData
        const formData = new FormData();
        formData.append('file', {
            uri: uri,
            name: `avatar_${Date.now()}.jpg`,
            type: 'image/jpeg',
        });

        const fileName = `avatars/${Date.now()}.jpg`;

        // 2. Вантажимо в Supabase
        const { error: uploadError } = await supabase.storage
            .from('images') // Використовуємо існуючий бакет 'images'
            .upload(fileName, formData, { contentType: 'multipart/form-data' });

        if (uploadError) throw uploadError;

        // 3. Отримуємо публічне посилання
        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        const publicUrl = data.publicUrl;

        // 4. Оновлюємо профіль юзера
        await updateProfile(firstName, lastName, publicUrl);

    } catch (e) {
        Alert.alert("Помилка", "Не вдалося завантажити фото");
        console.log(e);
    } finally {
        setLoading(false);
    }
  };

  const updateProfile = async (fName, lName, avatar = null) => {
    setLoading(true);
    try {
        const updates = {
            data: { 
                first_name: fName, 
                last_name: lName,
                ...(avatar && { avatar_url: avatar }) // Оновлюємо аватар тільки якщо він є
            }
        };

        const { error } = await supabase.auth.updateUser(updates);
        if (error) throw error;

        // Оновлюємо глобальний контекст
        refreshUser();
        setIsEditing(false);
        Alert.alert("Успішно", "Профіль оновлено!");

    } catch (e) {
        Alert.alert("Помилка", e.message);
    } finally {
        setLoading(false);
    }
  };

  const avatarSource = userMetadata?.avatar_url 
    ? { uri: userMetadata.avatar_url } 
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.screenTitle}>Мій профіль</Text></View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
          
          {/* Аватарка з можливістю кліку */}
          <TouchableOpacity onPress={handlePickImage} disabled={loading} style={{ position: 'relative' }}>
            {avatarSource ? (
                <Image source={avatarSource} style={{ width: 80, height: 80, borderRadius: 40 }} resizeMode="cover" />
            ) : (
                <View style={[styles.avatarPlaceholder, { width: 80, height: 80, borderRadius: 40 }]} />
            )}
            {loading && (
                <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 40 }}>
                    <ActivityIndicator color="#FFF" />
                </View>
            )}
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'blue', borderRadius: 12, padding: 4 }}>
                <Ionicons name="camera" size={14} color="white" />
            </View>
          </TouchableOpacity>

          <View style={{ marginLeft: 15, flex: 1 }}>
            {isEditing ? (
                <View>
                    <TextInput 
                        value={firstName} 
                        onChangeText={setFirstName} 
                        placeholder="Ім'я" 
                        style={{ borderBottomWidth: 1, marginBottom: 8, fontSize: 16 }} 
                    />
                    <TextInput 
                        value={lastName} 
                        onChangeText={setLastName} 
                        placeholder="Прізвище" 
                        style={{ borderBottomWidth: 1, fontSize: 16 }} 
                    />
                </View>
            ) : (
                <View>
                    <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                        {userMetadata?.first_name} {userMetadata?.last_name}
                    </Text>
                    <Text style={{ color: "gray", marginTop: 4 }}>{userEmail}</Text>
                </View>
            )}
          </View>
        </View>

        {/* Кнопки редагування */}
        {isEditing ? (
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <TouchableOpacity onPress={() => updateProfile(firstName, lastName)} style={{ backgroundColor: 'black', padding: 10, borderRadius: 8, flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Зберегти</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={{ backgroundColor: '#ccc', padding: 10, borderRadius: 8, flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: 'black' }}>Скасувати</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={{ alignSelf: 'flex-start', marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="pencil" size={16} color="blue" />
                <Text style={{ color: 'blue', marginLeft: 5, fontWeight: 'bold' }}>Редагувати профіль</Text>
            </TouchableOpacity>
        )}

        <View style={styles.loyaltyCard}><Text style={{ fontWeight: "500" }}>Програма лояльності</Text><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30 }}><Text style={{ fontSize: 32, fontWeight: "bold" }}>10%</Text><TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }}><Ionicons name="time-outline" size={16} /><Text style={{ marginLeft: 4 }}>Історія</Text></TouchableOpacity></View></View>
        <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(true)}><Ionicons name="business" size={20} color="black" /><Text style={{ flex: 1, marginLeft: 10, fontSize: 16 }}>Поточне місто: {city}</Text><Ionicons name="chevron-forward" size={16} color="#888" /></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}><Ionicons name="settings" size={20} color="black" /><Text style={{ flex: 1, marginLeft: 10, fontSize: 16 }}>Налаштування</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}><Ionicons name="log-out-outline" size={20} color="orange" /><Text style={{ flex: 1, marginLeft: 10, fontSize: 16, color: "orange" }}>Вийти</Text></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}><Ionicons name="trash-outline" size={20} color="red" /><Text style={{ flex: 1, marginLeft: 10, fontSize: 16, color: "red" }}>Видалити акаунт</Text></TouchableOpacity>
      </ScrollView>
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet"><View style={{ flex: 1, padding: 20 }}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><Text style={{ fontSize: 22, fontWeight: "bold" }}>Оберіть місто</Text><TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ fontSize: 18, color: "blue" }}>Закрити</Text></TouchableOpacity></View><FlatList data={CITIES} keyExtractor={(item) => item} renderItem={({ item }) => (<TouchableOpacity style={{ paddingVertical: 15, borderBottomWidth: 1, borderColor: "#EEE" }} onPress={() => { setCity(item); setModalVisible(false); }}><Text style={{ fontSize: 18 }}>{item}</Text></TouchableOpacity>)} /></View></Modal>
    </SafeAreaView>
  );
}

// --- НАВІГАЦІЯ ---
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 👇 ОГОЛОШУЄМО STACK ТУТ
const MainStack = createNativeStackNavigator(); // Для навігації всередині авторизованої зони

function ChatStack() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="ChatList" component={ChatListScreen} />
      <MainStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </MainStack.Navigator>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { height: 70, paddingBottom: 10, backgroundColor: "#C4C4C4" },
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#555",
        tabBarLabelStyle: { fontSize: 10, marginTop: -5 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Головна") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Записи") iconName = focused ? "list" : "list-outline";
          else if (route.name === "Чат") iconName = focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline";
          else if (route.name === "Профіль") iconName = focused ? "person" : "person-outline";
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

// --- ОСНОВНИЙ КОМПОНЕНТ APP ---
export default function App() {
  const [session, setSession] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); });
    return () => subscription.unsubscribe();
  }, []);

  const parseDateString = (dateStr) => {
    try {
      const monthsMap = { "січня": 0, "лютого": 1, "березня": 2, "квітня": 3, "травня": 4, "червня": 5, "липня": 6, "серпня": 7, "вересня": 8, "жовтня": 9, "листопада": 10, "грудня": 11, "Січня": 0, "Лютого": 1, "Березня": 2, "Квітня": 3, "Травня": 4, "Червня": 5, "Липня": 6, "Серпня": 7, "Вересня": 8, "Жовтня": 9, "Листопада": 10, "Грудня": 11 };
      const parts = dateStr.split(" ");
      if (parts.length < 5) return new Date(); 
      const day = parseInt(parts[0]);
      const month = monthsMap[parts[1]];
      const year = parseInt(parts[2]);
      const timeParts = parts[4].split(":");
      const hour = parseInt(timeParts[0]);
      const minute = parseInt(timeParts[1]);
      return new Date(year, month, day, hour, minute);
    } catch (e) { return new Date(); }
  };

  const refreshUser = async () => {
      // Функція для оновлення даних користувача після редагування профілю
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
  };

  useEffect(() => {
    if (session && session.user && session.user.email) {
      const userEmail = session.user.email;
      const loadData = async () => {
        try {
          const { data: mastersData } = await supabase.from("masters").select("name, avatar_url, address");
          const mastersMap = {};
          if (mastersData) { mastersData.forEach(m => { mastersMap[m.name] = m; }); }

          const { data: messagesData } = await supabase.from("messages").select("chat_id, created_at, text").order("created_at", { ascending: false });
          if (messagesData) {
            const uniqueChats = [];
            const seen = new Set();
            messagesData.forEach((msg) => {
              if (msg.chat_id.includes(userEmail)) {
                  if (!seen.has(msg.chat_id)) {
                    seen.add(msg.chat_id);
                    const masterName = msg.chat_id.split(':')[0];
                    const masterInfo = mastersMap[masterName];
                    uniqueChats.push({ id: msg.chat_id, name: masterName, lastMessage: msg.text, avatar: masterInfo ? masterInfo.avatar_url : null, unread: 0 });
                  }
              }
            });
            setChats(uniqueChats);
          }

          const { data: bookingsData } = await supabase.from("bookings").select("*").eq('client_name', userEmail).order("created_at", { ascending: false });
          if (bookingsData) {
              const now = new Date(); 
              const formattedBookings = bookingsData.map(b => {
                  const masterInfo = mastersMap[b.master_name];
                  const bookingDate = parseDateString(b.date_time);
                  let currentStatus = b.status;
                  if (currentStatus === 'active' && bookingDate < now) { currentStatus = 'history'; }
                  return { id: b.id.toString(), date: b.date_time, master: b.master_name, status: currentStatus, address: masterInfo ? masterInfo.address : "Адреса не вказана", avatar_url: masterInfo ? masterInfo.avatar_url : null };
              });
              setBookings(formattedBookings);
          }
        } catch (error) { console.error("Помилка завантаження даних:", error); }
      };
      loadData();
    }
  }, [session]); 

  const addBooking = (newBooking) => { setBookings((prev) => [newBooking, ...prev]); };
  const cancelBooking = async (id) => { setBookings((prev) => prev.map((item) => (item.id === id ? { ...item, status: "cancelled" } : item))); await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id); };
  const startChat = (masterName, avatarUrl) => { const userEmail = session?.user?.email; const uniqueChatId = `${masterName}:${userEmail}`; const exists = chats.find((c) => c.id === uniqueChatId); if (!exists) { const newChat = { id: uniqueChatId, name: masterName, avatar: avatarUrl, unread: 0, lastMessage: "Початок діалогу" }; setChats((prev) => [newChat, ...prev]); } };
  const deleteChat = async (chatId) => { setChats(prev => prev.filter(c => c.id !== chatId)); await supabase.from('messages').delete().eq('chat_id', chatId); };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {session ? (
        <BookingsContext.Provider value={{ bookings, addBooking, cancelBooking, chats, startChat, deleteChat, userEmail: session.user.email, userMetadata: session.user.user_metadata, refreshUser }}>
          <NavigationContainer>
            <MainStack.Navigator screenOptions={{ headerShown: false }}>
              <MainStack.Screen name="Main" component={BottomTabs} />
              <MainStack.Screen name="MasterProfile" component={MasterProfileScreen} />
            </MainStack.Navigator>
          </NavigationContainer>
        </BookingsContext.Provider>
      ) : (
        <AuthScreen />
      )}
    </GestureHandlerRootView>
  );
}