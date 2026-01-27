import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import BookingsScreen from "../screens/BookingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChatStack from "./ChatStack";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { height: 70, paddingBottom: 10, backgroundColor: "#C4C4C4" },
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#555",
        tabBarLabelStyle: { fontSize: 10, marginTop: -5 },
        tabBarIcon: ({ focused, color }) => {
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
