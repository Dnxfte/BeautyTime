import React, { useState, useContext, createContext, useEffect } from "react";
import { ActivityIndicator } from "react-native";
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
} from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// ПІДКЛЮЧАЄМО СТИЛІ
import { styles } from "./styles";

// --- КОНТЕКСТ ---
const BookingsContext = createContext();

// --- ДАНІ (MOCK DATA) ---
const CITIES = [
  "Київ",
  "Львів",
  "Одеса",
  "Дніпро",
  "Харків",
  "Вінниця",
  "Запоріжжя",
  "Івано-Франківськ",
  "Луцьк",
  "Тернопіль",
  "Рівне",
  "Хмельницький",
  "Житомир",
  "Чернівці",
  "Ужгород",
  "Черкаси",
  "Чернігів",
  "Полтава",
  "Суми",
  "Миколаїв",
  "Херсон",
];

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:30",
  "13:00",
  "14:30",
  "16:00",
  "17:30",
  "19:00",
];

// Генерація дат (наступні 4 дні)
const getNextDays = () => {
  const days = [];
  const months = [
    "Січня",
    "Лютого",
    "Березня",
    "Квітня",
    "Травня",
    "Червня",
    "Липня",
    "Серпня",
    "Вересня",
    "Жовтня",
    "Листопада",
    "Грудня",
  ];

  for (let i = 0; i < 4; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    days.push({
      day: d.getDate(),
      month: months[d.getMonth()],
      fullDate: d,
    });
  }
  return days;
};

// --- ЕКРАНИ ---

// 1. ГОЛОВНА
function HomeScreen() {
  const navigation = useNavigation();
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const { data, error } = await supabase.from("masters").select("*");
      if (error) {
        console.error("Помилка завантаження:", error);
      } else {
        setMasters(data);
      }
    } catch (error) {
      console.error("Системна помилка:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMasterItem = ({ item }) => {
    const tagsList = item.tags
      ? item.tags.split(",").map((tag) => tag.trim())
      : [];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("MasterProfile", { master: item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarPlaceholder} />
          <View style={styles.masterInfo}>
            <Text style={styles.masterName}>{item.name}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.ratingText}>★ {item.rating || 0} / 5</Text>
              <Text style={styles.reviewsText}>
                {" "}
                ({item.reviews || 0} відгуки)
              </Text>
            </View>
          </View>
        </View>

        {tagsList.length > 0 && (
          <View style={styles.tagsRow}>
            {tagsList.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.galleryRow}>
          <View style={styles.galleryPlaceholder} />
          <View style={styles.galleryPlaceholder} />
          <View style={styles.galleryPlaceholder} />
        </View>

        <View style={styles.footerInfo}>
          <View style={[styles.infoRow, { marginBottom: 4 }]}>
            <Ionicons
              name="location-outline"
              size={16}
              color="#000"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.infoText}>{item.address}</Text>
          </View>
          {item.next_slot && (
            <View style={styles.infoRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color="#000"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.infoText}>
                Найближча дата: {item.next_slot}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.headerContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color="#888"
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Пошук майстра"
            placeholderTextColor="#888"
          />
        </View>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={masters}
          renderItem={renderMasterItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>
              Список пустий
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

// 2. ПРОФІЛЬ МАЙСТРА
function MasterProfileScreen({ route }) {
  const navigation = useNavigation();
  const { master } = route.params;
  const { addBooking, startChat } = useContext(BookingsContext);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [dates, setDates] = useState([]);

  useEffect(() => {
    setDates(getNextDays());
  }, []);

  const handleBooking = async () => {
    if (!selectedService) {
      Alert.alert(
        "Увага",
        "Будь ласка, оберіть послугу зі списку перед записом.",
      );
      return;
    }

    const d = dates[selectedDateIndex];
    const dateStr = `${d.day} ${d.month} ${d.fullDate.getFullYear()}`;
    const fullDateTime = `${dateStr} о ${selectedTime}`;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([
          {
            master_name: master.name,
            client_name: "Володимир Шепель",
            service_name: selectedService.name,
            date_time: fullDateTime,
            status: "active",
          },
        ])
        .select();

      if (error) {
        Alert.alert("Помилка", "Не вдалося записатись.");
      } else {
        const newBooking = {
          id: data[0].id.toString(),
          date: fullDateTime,
          master: master.name,
          address: master.address,
          status: "active",
        };
        addBooking(newBooking);

        Alert.alert(
          "Успішно!",
          `Ви записані на ${selectedService.name} до ${master.name}`,
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Main", { screen: "Записи" }),
            },
          ],
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleConsultation = () => {
    startChat(master.name);
    navigation.navigate("Main", {
      screen: "Чат",
      params: { screen: "ChatDetail", params: { name: master.name } },
    });
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View>
              <Text style={styles.detailName}>{master.name}</Text>
              <Text style={styles.ratingText}>★ {master.rating} / 5</Text>
            </View>
            <View
              style={[
                styles.avatarPlaceholder,
                { width: 60, height: 60, borderRadius: 30 },
              ]}
            />
          </View>

          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "500" }}>Салон краси</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Ionicons name="location-sharp" size={16} color="black" />
              <Text style={[styles.infoText, { marginLeft: 4 }]}>
                {master.address}
              </Text>
            </View>
          </View>

          <View style={styles.mapPlaceholder} />

          <Text style={styles.sectionTitle}>Календар для запису</Text>
          <View style={styles.calendarRow}>
            {dates.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.dateBox,
                  selectedDateIndex === i && styles.dateBoxActive,
                ]}
                onPress={() => setSelectedDateIndex(i)}
              >
                <Text
                  style={[
                    styles.dateText,
                    selectedDateIndex === i && {
                      color: "#FFF",
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {d.day}
                  {"\n"}
                  {d.month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.timePickerRow}>
            <Text style={{ fontSize: 14, color: "#444" }}>
              Оберіть бажаний час:
            </Text>
            <TouchableOpacity
              style={styles.timeSelect}
              onPress={() => setTimeModalVisible(true)}
            >
              <Text style={{ fontWeight: "bold" }}>{selectedTime}</Text>
              <Ionicons name="chevron-down" size={16} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Послуги</Text>
          {master.services && Array.isArray(master.services) ? (
            master.services.map((s, i) => {
              const isSelected =
                selectedService && selectedService.name === s.name;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.serviceRow,
                    isSelected && {
                      backgroundColor: "#E0E0E0",
                      borderColor: "#000",
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setSelectedService(s)}
                >
                  <Text
                    style={[
                      styles.serviceName,
                      isSelected && { fontWeight: "bold" },
                    ]}
                  >
                    {s.name}
                  </Text>
                  <Text
                    style={[
                      styles.servicePrice,
                      isSelected && { fontWeight: "bold" },
                    ]}
                  >
                    {s.price}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ color: "#888", fontStyle: "italic", marginTop: 5 }}>
              Оберіть послугу зі списку (список пустий)
            </Text>
          )}

          <Text style={styles.sectionTitle}>Портфоліо</Text>
          <View style={styles.galleryRow}>
            <View style={styles.galleryPlaceholder} />
            <View style={styles.galleryPlaceholder} />
            <View style={styles.galleryPlaceholder} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.primaryBtn, { flex: 1, marginRight: 10 }]}
          onPress={handleBooking}
        >
          <Text style={styles.primaryBtnText}>Записатись</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, { flex: 1 }]}
          onPress={handleConsultation}
        >
          <Text style={styles.secondaryBtnText}>Консультація</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={timeModalVisible} animationType="fade" transparent={true}>
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
            <TouchableOpacity
              onPress={() => setTimeModalVisible(false)}
              style={{ marginTop: 20, alignSelf: "center" }}
            >
              <Text style={{ color: "red", fontSize: 16 }}>Скасувати</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 3. ЗАПИСИ
function BookingsScreen() {
  const navigation = useNavigation();
  const { bookings, cancelBooking, startChat } = useContext(BookingsContext);
  const [activeTab, setActiveTab] = useState("active");

  const filteredBookings = bookings.filter((item) => {
    if (activeTab === "active") return item.status === "active";
    if (activeTab === "cancelled") return item.status === "cancelled";
    if (activeTab === "history") return item.status === "history";
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Мої записи</Text>
      </View>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "active" && styles.tabBtnActive]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={
              activeTab === "active" ? { color: "#FFF" } : { color: "#000" }
            }
          >
            Активні
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "cancelled" && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab("cancelled")}
        >
          <Text
            style={
              activeTab === "cancelled" ? { color: "#FFF" } : { color: "#000" }
            }
          >
            Скасовані
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "history" && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={
              activeTab === "history" ? { color: "#FFF" } : { color: "#000" }
            }
          >
            Архів
          </Text>
        </TouchableOpacity>
      </View>

      {filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { opacity: item.status === "cancelled" ? 0.7 : 1 },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>{item.date}</Text>
                {item.status === "cancelled" && (
                  <Text style={{ color: "red", fontWeight: "bold" }}>
                    СКАСОВАНО
                  </Text>
                )}
                {item.status !== "cancelled" && (
                  <Ionicons name="ellipsis-horizontal" size={20} />
                )}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  alignItems: "center",
                }}
              >
                <View
                  style={[styles.avatarPlaceholder, { width: 40, height: 40 }]}
                />
                <Text
                  style={{ marginLeft: 10, fontSize: 16, fontWeight: "600" }}
                >
                  {item.master}
                </Text>
              </View>

              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <Ionicons name="location-sharp" size={16} />
                <Text style={{ marginLeft: 5, color: "#555" }}>
                  {item.address}
                </Text>
              </View>

              {item.status === "active" && (
                <View style={styles.bookingActions}>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 20,
                    }}
                    onPress={() => {
                      Alert.alert(
                        "Скасувати?",
                        "Запис буде переміщено у вкладку 'Скасовані'",
                        [
                          { text: "Ні", style: "cancel" },
                          {
                            text: "Так",
                            onPress: () => cancelBooking(item.id),
                          },
                        ],
                      );
                    }}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={18}
                      color="red"
                    />
                    <Text style={{ marginLeft: 4, color: "red" }}>
                      Скасувати
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => {
                      startChat(item.master);
                      navigation.navigate("Чат", {
                        screen: "ChatDetail",
                        params: { name: item.master },
                      });
                    }}
                  >
                    <Ionicons name="chatbubble-outline" size={18} />
                    <Text style={{ marginLeft: 4 }}>Написати в чат</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <Ionicons name="file-tray-outline" size={48} color="#CCC" />
          <Text style={{ color: "#999", marginTop: 10 }}>
            У цьому розділі порожньо
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// 4. ЧАТИ
function ChatListScreen() {
  const navigation = useNavigation();
  const [loadedChats, setLoadedChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("chat_id, created_at, text")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const uniqueChats = [];
        const seen = new Set();
        data.forEach((msg) => {
          if (!seen.has(msg.chat_id)) {
            seen.add(msg.chat_id);
            uniqueChats.push({
              id: msg.chat_id,
              name: msg.chat_id,
              lastMessage: msg.text,
              unread: 0,
            });
          }
        });
        setLoadedChats(uniqueChats);
      }
      setLoading(false);
    };

    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Листування</Text>
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#000"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={loadedChats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Ionicons name="chatbubbles-outline" size={48} color="#CCC" />
              <Text style={{ color: "#999", marginTop: 10 }}>
                Поки немає діалогів
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatRow}
              onPress={() =>
                navigation.navigate("ChatDetail", { name: item.name })
              }
            >
              <View style={styles.avatarPlaceholder} />
              <View
                style={{ flex: 1, marginLeft: 12, justifyContent: "center" }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {item.name}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ color: "#999", fontSize: 13, marginTop: 2 }}
                >
                  {item.lastMessage}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function ChatDetailScreen({ route }) {
  const { name } = route.params;
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    fetchHistory();
    const channel = supabase
      .channel("realtime_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${name}`,
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => [
            {
              id: newMsg.id.toString(),
              text: newMsg.text,
              isMe: newMsg.sender === "client",
              time: new Date(newMsg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            ...prev,
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", name)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const formatted = data.map((m) => ({
        id: m.id.toString(),
        text: m.text,
        isMe: m.sender === "client",
        time: new Date(m.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setMessages(formatted);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim().length === 0) return;
    const textToSend = inputText;
    setInputText("");

    try {
      await supabase
        .from("messages")
        .insert([{ chat_id: name, sender: "client", text: textToSend }]);
    } catch (e) {
      console.log(e);
    }
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F2F2F2" }}>
      <View
        style={[
          styles.navHeader,
          {
            backgroundColor: "#FFF",
            borderBottomWidth: 1,
            borderColor: "#EEE",
            paddingVertical: 10,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("ChatList")}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
          <View
            style={[
              styles.avatarPlaceholder,
              { width: 30, height: 30, marginLeft: 10 },
            ]}
          />
          <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
            {name}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
            Немає повідомлень
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.isMe ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.isMe ? { color: "#FFF" } : { color: "#000" },
              ]}
            >
              {item.text}
            </Text>
            <Text
              style={[
                styles.messageTime,
                item.isMe ? { color: "#CCC" } : { color: "#666" },
              ]}
            >
              {item.time}
            </Text>
          </View>
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={10}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Написати повідомлення..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Ionicons name="arrow-up" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 5. ПРОФІЛЬ
function ProfileScreen() {
  const [name, setName] = useState("Володимир Шепель");
  const [isEditing, setIsEditing] = useState(false);
  const [city, setCity] = useState("Київ");
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Мій профіль</Text>
      </View>
      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View
            style={[
              styles.avatarPlaceholder,
              { width: 60, height: 60, borderRadius: 30 },
            ]}
          />
          <View style={{ marginLeft: 15, flex: 1 }}>
            {isEditing ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={{
                    borderBottomWidth: 1,
                    fontSize: 20,
                    fontWeight: "bold",
                    flex: 1,
                    paddingVertical: 0,
                  }}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  style={{ marginLeft: 10 }}
                >
                  <Ionicons name="checkmark-circle" size={24} color="black" />
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>{name}</Text>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                  onPress={() => setIsEditing(true)}
                >
                  <Ionicons name="pencil" size={12} color="black" />
                  <Text style={{ marginLeft: 4, fontWeight: "500" }}>
                    Редагувати
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.loyaltyCard}>
          <Text style={{ fontWeight: "500" }}>Програма лояльності</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: 30,
            }}
          >
            <Text style={{ fontSize: 32, fontWeight: "bold" }}>10%</Text>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Ionicons name="time-outline" size={16} />
              <Text style={{ marginLeft: 4 }}>Історія</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="business" size={20} color="black" />
          <Text style={{ flex: 1, marginLeft: 10, fontSize: 16 }}>
            Поточне місто: {city}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings" size={20} color="black" />
          <Text style={{ flex: 1, marginLeft: 10, fontSize: 16 }}>
            Налаштування
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, padding: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>
              Оберіть місто
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ fontSize: 18, color: "blue" }}>Закрити</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={CITIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  paddingVertical: 15,
                  borderBottomWidth: 1,
                  borderColor: "#EEE",
                }}
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
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          backgroundColor: "#C4C4C4",
        },
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#555",
        tabBarLabelStyle: { fontSize: 10, marginTop: -5 },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Головна")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Записи")
            iconName = focused ? "list" : "list-outline";
          else if (route.name === "Чат")
            iconName = focused
              ? "chatbubble-ellipses"
              : "chatbubble-ellipses-outline";
          else if (route.name === "Профіль")
            iconName = focused ? "person" : "person-outline";
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
  const [bookings, setBookings] = useState([]);
  const [chats, setChats] = useState([]);

  const addBooking = (newBooking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const cancelBooking = (id) => {
    setBookings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "cancelled" } : item,
      ),
    );
  };

  const startChat = (masterName) => {
    const exists = chats.find((c) => c.name === masterName);
    if (!exists) {
      const newChat = {
        id: Date.now().toString(),
        name: masterName,
        unread: 0,
      };
      setChats((prev) => [newChat, ...prev]);
    }
  };

  return (
    <BookingsContext.Provider
      value={{ bookings, addBooking, cancelBooking, chats, startChat }}
    >
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={BottomTabs} />
          <Stack.Screen name="MasterProfile" component={MasterProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </BookingsContext.Provider>
  );
}
