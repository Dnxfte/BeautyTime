import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import BookingsScreen from '../screens/BookingsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MasterProfileScreen from '../screens/MasterProfileScreen';

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
        tabBarIcon: ({ focused, color }) => {
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

function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen name="MasterProfile" component={MasterProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
