import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../styles";

export default function MasterCard({ master, onPress }) {
  const tagsList = master.tags ? master.tags.split(",").map((tag) => tag.trim()) : [];

  return (
    <TouchableOpacity
      style={styles.card}
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
          <Text style={styles.masterName}>{master.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.ratingText}>★ {master.rating || 0} / 5</Text>
            <Text style={styles.reviewsText}>({master.reviews_count || 0} відгуки)</Text>
          </View>
        </View>
      </View>

      {tagsList.length > 0 && (
        <View style={styles.tagsRow}>
          {tagsList.map((tag, index) => (
            <View key={`${tag}-${index}`} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
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
              style={styles.galleryPlaceholder}
              resizeMode="cover"
            />
          ))
        ) : (
          <>
            <View style={styles.galleryPlaceholder} />
            <View style={styles.galleryPlaceholder} />
            <View style={styles.galleryPlaceholder} />
          </>
        )}
      </View>

      <View style={styles.footerInfo}>
        <View style={[styles.infoRow, { marginBottom: 4 }]}>
          <Ionicons name="location-outline" size={16} color="#000" style={{ marginRight: 4 }} />
          <Text style={styles.infoText}>{master.address}</Text>
        </View>
        {master.next_slot && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#000" style={{ marginRight: 4 }} />
            <Text style={styles.infoText}>Найближча дата: {master.next_slot}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
