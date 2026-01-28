import React from "react";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RootNavigator from "./src/navigation/RootNavigator";
import { BookingsProvider, useBookings } from "./src/contexts/BookingsContext";
import { ThemeProvider, useAppTheme } from "./src/contexts/ThemeContext";
import SplashScreen from "./src/screens/SplashScreen";

function AppNavigator() {
  const { sessionLoading } = useBookings();
  const { theme, colors, isThemeLoading } = useAppTheme();
  const navTheme = React.useMemo(() => {
    const baseTheme = theme === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        primary: colors.accent,
      },
    };
  }, [theme, colors]);

  return (
    <NavigationContainer theme={navTheme}>
      {sessionLoading || isThemeLoading ? <SplashScreen /> : <RootNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <BookingsProvider>
          <AppNavigator />
        </BookingsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
