import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

// Disable development error overlay to test ErrorBoundary
import { LogBox } from "react-native";

import { FloatingChecklistButton } from "@/components/checklist";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProjectsProvider, ThemeProvider, useTheme } from "@/contexts";
LogBox.ignoreAllLogs(true);

// Disable error overlay in development
if (__DEV__) {
  // @ts-ignore
  global.ErrorUtils?.setGlobalHandler(() => {});
}

// Navigation component that can use theme context
function Navigation() {
  const { currentTheme } = useTheme();

  return (
    <ErrorBoundary>
      <NavigationThemeProvider
        value={currentTheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="category/[category]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="pdf-viewer"
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </NavigationThemeProvider>
    </ErrorBoundary>
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <ProjectsProvider>
          <Navigation />
          <FloatingChecklistButton />
        </ProjectsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
