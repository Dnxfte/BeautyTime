import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { styles } from '../../../styles';
import AvatarPlaceholder from '../atoms/AvatarPlaceholder';
import Tag from '../atoms/Tag';
import GalleryRow from '../molecules/GalleryRow';
import InfoRow from '../molecules/InfoRow';

const MasterCard = ({ master, onPress }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
    <View style={styles.cardHeader}>
      <AvatarPlaceholder />
      <View style={styles.masterInfo}>
        <Text style={styles.masterName}>{master.name}</Text>
        <Text style={styles.ratingText}>
          ★ {master.rating} / 5{' '}
          <Text style={styles.reviewsText}>({master.reviews} відгуки)</Text>
        </Text>
      </View>
    </View>

    <View style={styles.tagsRow}>
      {master.tags.map((tag, index) => (
        <Tag key={`${master.id}-${index}`} label={tag} />
      ))}
    </View>

    <GalleryRow />

    <View style={styles.footerInfo}>
      <InfoRow icon="location-outline" text={master.address} />
      <InfoRow icon="time-outline" text={`Найближча дата: ${master.nextSlot}`} style={{ marginTop: 4 }} />
    </View>
  </TouchableOpacity>
);

export default MasterCard;
