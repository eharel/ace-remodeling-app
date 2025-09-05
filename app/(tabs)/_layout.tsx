import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { getThemeColor, currentTheme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: getThemeColor("interactive.primary"),
        tabBarInactiveTintColor: getThemeColor("text.tertiary"),
        tabBarStyle: {
          backgroundColor: getThemeColor("background.card"),
          borderTopColor: getThemeColor("border.primary"),
          ...Platform.select({
            ios: {
              position: "absolute",
            },
            default: {},
          }),
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bathrooms"
        options={{
          title: "Bathrooms",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bathroom" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="kitchens"
        options={{
          title: "Kitchens",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="kitchen" size={size} color={color} />
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
        }}
      />
    </Tabs>
  );
}
