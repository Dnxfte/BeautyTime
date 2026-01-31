import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { apiRequest } from "../api/server";
import { styles } from "../../styles";
import MasterCard from "../components/MasterCard";
import { useAppTheme } from "../contexts/ThemeContext";
import { useBookings } from "../contexts/BookingsContext";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, theme } = useAppTheme();
  const { session, sessionLoading } = useBookings();
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      setLoading(false);
      return;
    }
    fetchMasters();
  }, [sessionLoading, session]);

  const fetchMasters = async () => {
    try {
      const data = await apiRequest("/masters");
      if (data) setMasters(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMasterPress = (master) => {
    navigation.navigate("MasterProfile", { master });
  };

  const filteredMasters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return masters;
    return masters.filter((m) => {
      const name = m.name || "";
      const tags = m.tags || "";
      const address = m.address || "";
      return (
        name.toLowerCase().includes(q) ||
        tags.toLowerCase().includes(q) ||
        address.toLowerCase().includes(q)
      );
    });
  }, [masters, query]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <View style={styles.headerContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Пошук майстра"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredMasters}
          renderItem={({ item }) => (
            <MasterCard
              master={item}
              onPress={handleMasterPress}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20, color: colors.textMuted }}>
              Список пустий
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
