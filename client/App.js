import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthScreen from "./src/screens/AuthScreen";
import RootNavigator from "./src/navigation/RootNavigator";
import { BookingsProvider, useBookings } from "./src/contexts/BookingsContext";

function AppContent() {
  const { session } = useBookings();

  return session ? (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  ) : (
    <AuthScreen />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BookingsProvider>
        <AppContent />
      </BookingsProvider>
    </GestureHandlerRootView>
  );
}
