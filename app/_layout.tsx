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

import { FloatingChecklistButton } from "@/features/checklist";
import { ErrorBoundary } from "@/shared/components";
import {
  AuthProvider,
  ProjectsProvider,
  ThemeProvider,
  useTheme,
} from "@/shared/contexts";
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
        {/* 
          Centralized Stack navigation configuration
          Headers are managed by PageHeader component for full styling control
          Individual screens can still use native headers if needed by setting headerShown: true
        */}
        <Stack
          screenOptions={{
            headerShown: false, // Hide all navigation headers by default
            animation: "slide_from_right", // Smooth page transitions
          }}
        >
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
      {/* Provider hierarchy: Theme -> Auth -> Projects */}
      {/* ThemeProvider must be outermost as auth UI may need theme */}
      <ThemeProvider>
        <AuthProvider>
          <ProjectsProvider>
            <Navigation />
            <FloatingChecklistButton />
          </ProjectsProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
