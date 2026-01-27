import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { supabase } from "../../supabaseConfig";
import { styles } from "../../styles";
import { TIME_SLOTS } from "../constants/data";
import { getNextDays } from "../utils/date";
import { getLeafletHTML } from "../utils/leaflet";
import { useBookings } from "../contexts/BookingsContext";

export default function MasterProfileScreen({ route }) {
  const navigation = useNavigation();
  const { master } = route.params;
  const { addBooking, startChat, userEmail } = useBookings();

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [dates, setDates] = useState([]);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  useEffect(() => {
    setDates(getNextDays());
  }, []);

  const screenWidth = Dimensions.get("window").width;
  const photoSize = (screenWidth - 32 - 20) / 3;

  const mapLat = master.lat || 49.2331;
  const mapLng = master.lng || 28.4682;

  const handleBooking = async () => {
    if (!selectedService) {
      Alert.alert("Увага", "Будь ласка, оберіть послугу зі списку перед записом.");
      return;
    }
    const d = dates[selectedDateIndex];
    const fullDateTime = `${d.day} ${d.month} ${d.fullDate.getFullYear()} о ${selectedTime}`;

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([
          {
            master_name: master.name,
            client_name: userEmail,
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
          avatar_url: master.avatar_url,
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
          ]
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleConsultation = () => {
    startChat(master.name, master.avatar_url);
    const uniqueChatId = `${master.name}:${userEmail}`;
    navigation.navigate("Main", {
      screen: "Чат",
      params: {
        screen: "ChatDetail",
        params: { chatId: uniqueChatId, name: master.name, avatar: master.avatar_url },
      },
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
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <View>
              <Text style={styles.detailName}>{master.name}</Text>
              <Text style={styles.ratingText}>★ {master.rating} / 5</Text>
            </View>
            {master.avatar_url ? (
              <Image
                source={{ uri: master.avatar_url }}
                style={{ width: 60, height: 60, borderRadius: 30 }}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { width: 60, height: 60, borderRadius: 30 }]} />
            )}
          </View>

          <View style={{ marginTop: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: "500" }}>Салон краси</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <Ionicons name="location-sharp" size={16} color="black" />
              <Text style={[styles.infoText, { marginLeft: 4 }]}>{master.address}</Text>
            </View>
          </View>

          <View
            style={{
              height: 200,
              marginTop: 15,
              borderRadius: 12,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#eee",
            }}
          >
            <WebView
              originWhitelist={["*"]}
              source={{ html: getLeafletHTML(mapLat, mapLng, master.name) }}
              style={{ flex: 1 }}
              scrollEnabled={false}
            />
          </View>

          <Text style={styles.sectionTitle}>Календар для запису</Text>
          <View style={styles.calendarRow}>
            {dates.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dateBox, selectedDateIndex === i && styles.dateBoxActive]}
                onPress={() => setSelectedDateIndex(i)}
              >
                <Text
                  style={[
                    styles.dateText,
                    selectedDateIndex === i && { color: "#FFF", fontWeight: "bold" },
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
            <Text style={{ fontSize: 14, color: "#444" }}>Оберіть бажаний час:</Text>
            <TouchableOpacity style={styles.timeSelect} onPress={() => setTimeModalVisible(true)}>
              <Text style={{ fontWeight: "bold" }}>{selectedTime}</Text>
              <Ionicons name="chevron-down" size={16} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Послуги</Text>
          {master.services && Array.isArray(master.services) ? (
            master.services.map((s, i) => {
              const isSelected = selectedService && selectedService.name === s.name;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.serviceRow,
                    isSelected && { backgroundColor: "#E0E0E0", borderColor: "#000", borderWidth: 1 },
                  ]}
                  onPress={() => setSelectedService(s)}
                >
                  <Text style={[styles.serviceName, isSelected && { fontWeight: "bold" }]}>{s.name}</Text>
                  <Text style={[styles.servicePrice, isSelected && { fontWeight: "bold" }]}>{s.price}</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={{ color: "#888", fontStyle: "italic", marginTop: 5 }}>
              Оберіть послугу зі списку (список пустий)
            </Text>
          )}

          <Text style={styles.sectionTitle}>Портфоліо</Text>
          {master.portfolio_urls && master.portfolio_urls.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              {master.portfolio_urls.map((url, index) => (
                <TouchableOpacity key={index} onPress={() => setFullScreenImage(url)}>
                  <Image
                    source={{ uri: url }}
                    style={{ width: photoSize, height: photoSize, borderRadius: 12, backgroundColor: "#f0f0f0" }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <View style={[styles.galleryPlaceholder, { width: photoSize, height: photoSize }]} />
              <View style={[styles.galleryPlaceholder, { width: photoSize, height: photoSize }]} />
            </View>
          )}
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
            <TouchableOpacity
              onPress={() => setTimeModalVisible(false)}
              style={{ marginTop: 20, alignSelf: "center" }}
            >
              <Text style={{ color: "red", fontSize: 16 }}>Скасувати</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!fullScreenImage} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity
            style={{ position: "absolute", top: 50, right: 20, zIndex: 10 }}
            onPress={() => setFullScreenImage(null)}
          >
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
          {fullScreenImage && (
            <Image source={{ uri: fullScreenImage }} style={{ width: "100%", height: "80%" }} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
