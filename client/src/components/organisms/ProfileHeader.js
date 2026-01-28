import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AvatarPlaceholder from '../atoms/AvatarPlaceholder';

const ProfileHeader = ({ name, isEditing, onChangeName, onEdit, onSave }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
    <AvatarPlaceholder size={60} />
    <View style={{ marginLeft: 15, flex: 1 }}>
      {isEditing ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            value={name}
            onChangeText={onChangeName}
            style={{ borderBottomWidth: 1, fontSize: 20, fontWeight: 'bold', flex: 1, paddingVertical: 0 }}
            autoFocus
          />
          <TouchableOpacity onPress={onSave} style={{ marginLeft: 10 }}>
            <Ionicons name="checkmark-circle" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{name}</Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}
            onPress={onEdit}
          >
            <Ionicons name="pencil" size={12} color="black" />
            <Text style={{ marginLeft: 4, fontWeight: '500' }}>Редагувати</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  </View>
);

export default ProfileHeader;
