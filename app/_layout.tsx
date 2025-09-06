import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { FloatingChecklistButton } from "@/components/FloatingChecklistButton";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

// Navigation component that can use theme context
function Navigation() {
  const { currentTheme } = useTheme();

  return (
    <NavigationThemeProvider
      value={currentTheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider>
      <Navigation />
      <FloatingChecklistButton />
    </ThemeProvider>
  );
}
