import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";
import { useAppTheme } from "../contexts/ThemeContext";

export default function MasterCard({ master, onPress }) {
  const { colors } = useAppTheme();
  const tagsList = master.tags ? master.tags.split(",").map((tag) => tag.trim()) : [];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      activeOpacity={0.9}
      onPress={() => onPress?.(master)}
    >
      <View style={styles.cardHeader}>
        {master.avatar_url ? (
          <Image
            source={{ uri: master.avatar_url }}
            style={styles.avatarPlaceholder}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <View style={styles.masterInfo}>
          <Text style={[styles.masterName, { color: colors.text }]}>{master.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[styles.ratingText, { color: colors.text }]}>★ {master.rating || 0} / 5</Text>
            <Text style={[styles.reviewsText, { color: colors.textMuted }]}>({master.reviews_count || 0} відгуки)</Text>
          </View>
        </View>
      </View>

      {tagsList.length > 0 && (
        <View style={styles.tagsRow}>
          {tagsList.map((tag, index) => (
            <View key={`${tag}-${index}`} style={[styles.tag, { backgroundColor: colors.inputBg }]}>
              <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.galleryRow}>
        {master.portfolio_urls && master.portfolio_urls.length > 0 ? (
          master.portfolio_urls.slice(0, 3).map((url, index) => (
            <Image
              key={`${url}-${index}`}
              source={{ uri: url }}
              style={[styles.galleryPlaceholder, { backgroundColor: colors.inputBg }]}
              resizeMode="cover"
            />
          ))
        ) : (
          <>
            <View style={[styles.galleryPlaceholder, { backgroundColor: colors.inputBg }]} />
            <View style={[styles.galleryPlaceholder, { backgroundColor: colors.inputBg }]} />
            <View style={[styles.galleryPlaceholder, { backgroundColor: colors.inputBg }]} />
          </>
        )}
      </View>

      <View style={[styles.footerInfo, { borderTopColor: colors.border }]}>
        <View style={[styles.infoRow, { marginBottom: 4 }]}>
          <Ionicons name="location-outline" size={16} color={colors.text} style={{ marginRight: 4 }} />
          <Text style={[styles.infoText, { color: colors.text }]}>{master.address}</Text>
        </View>
        {master.next_slot && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color={colors.text} style={{ marginRight: 4 }} />
            <Text style={[styles.infoText, { color: colors.text }]}>Найближча дата: {master.next_slot}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
