import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAppTheme } from "../contexts/ThemeContext";

export default function SplashScreen() {
  const { colors } = useAppTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}
