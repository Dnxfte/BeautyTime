import React, { useState } from 'react';
import { View, FlatList, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../../styles';
import { MASTERS } from '../data/masters';
import SearchBar from '../components/molecules/SearchBar';
import FilterChip from '../components/molecules/FilterChip';
import IconButton from '../components/atoms/IconButton';
import MasterCard from '../components/organisms/MasterCard';

function HomeScreen() {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('Манікюр');
  const [viewMode, setViewMode] = useState('list');

  const renderMasterItem = ({ item }) => (
    <MasterCard
      master={item}
      onPress={() => navigation.navigate('MasterProfile', { master: item })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <SearchBar />
        <View style={styles.filtersRow}>
          <FilterChip
            label="Манікюр"
            iconName="options-outline"
            active={activeFilter === 'Манікюр'}
            onPress={() => setActiveFilter('Манікюр')}
          />
          <IconButton name="filter" onPress={() => {}} />
          <View style={{ flex: 1 }} />
          <IconButton
            name="map-outline"
            style={viewMode === 'map' ? styles.filterBtnActive : null}
            onPress={() => setViewMode('map')}
          />
          <IconButton
            name="list-outline"
            style={viewMode === 'list' ? styles.filterBtnActive : null}
            onPress={() => setViewMode('list')}
          />
        </View>
      </View>
      <FlatList
        data={MASTERS}
        renderItem={renderMasterItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

export default HomeScreen;
