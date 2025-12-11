import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { Platform, ViewStyle } from "react-native";

import { useTheme } from "@/shared/contexts";
import { useVersionCheck } from "@/shared/hooks";

export default function TabLayout() {
  const { theme } = useTheme();
  const { updateRequired } = useVersionCheck();

  // Memoize screen options to prevent re-renders
  const screenOptions = useMemo(() => {
    const tabBarStyle: ViewStyle = {
      backgroundColor: theme.colors.background.tertiary,
      borderTopColor: theme.colors.border.primary,
      ...(Platform.OS === "ios" && { position: "absolute" }),
    };

    return {
      tabBarActiveTintColor: theme.colors.interactive.primary,
      tabBarInactiveTintColor: theme.colors.text.tertiary,
      tabBarStyle,
      headerShown: false,
    };
  }, [theme]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Showcase",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="grid-view" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
          tabBarBadge: updateRequired ? "!" : undefined,
        }}
      />
    </Tabs>
  );
}
