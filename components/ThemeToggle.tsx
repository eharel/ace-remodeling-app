import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { ThemeSetting } from "@/themes";
import { ThemedText } from "./themed";

type ThemeOption = ThemeSetting;

export function ThemeToggle() {
  const { themeSetting, setThemeSetting, theme } = useTheme();

  const themeOptions: { key: ThemeOption; label: string; icon: string }[] = [
    { key: "light", label: "Light", icon: "light-mode" },
    { key: "dark", label: "Dark", icon: "dark-mode" },
    { key: "blue", label: "Blue", icon: "palette" },
    { key: "system", label: "System", icon: "auto-awesome" },
  ];

  const handleThemeSelect = (theme: ThemeOption) => {
    setThemeSetting(theme);
  };

  const isActive = (theme: ThemeOption) => {
    if (theme === "system") {
      return themeSetting === "system";
    }
    return themeSetting === theme;
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 8,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      padding: 16,
    },
    title: {
      marginBottom: 12,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    themeButton: {
      width: 60,
      height: 60,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 30,
      borderWidth: 2,
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.card,
    },
    activeButton: {
      backgroundColor: theme.colors.interactive.primary,
      borderColor: theme.colors.interactive.primary,
    },
    buttonIcon: {
      // No margin needed for circular buttons
    },
    buttonContainer: {
      alignItems: "center",
      gap: 6,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <ThemedText variant="subtitle" style={dynamicStyles.title}>
        Theme
      </ThemedText>

      <View style={dynamicStyles.buttonRow}>
        {themeOptions.map((option) => {
          const active = isActive(option.key);
          return (
            <View key={option.key} style={dynamicStyles.buttonContainer}>
              <TouchableOpacity
                style={[
                  dynamicStyles.themeButton,
                  active && dynamicStyles.activeButton,
                ]}
                onPress={() => handleThemeSelect(option.key)}
                activeOpacity={0.7}
                disabled={active}
              >
                <MaterialIcons
                  name={option.icon as any}
                  size={24}
                  color={
                    active
                      ? theme.colors.text.inverse
                      : theme.colors.text.primary
                  }
                  style={dynamicStyles.buttonIcon}
                />
              </TouchableOpacity>
              <ThemedText
                variant="caption"
                style={[
                  styles.buttonLabel,
                  {
                    color: active
                      ? theme.colors.interactive.primary
                      : theme.colors.text.secondary,
                  },
                ]}
              >
                {option.label}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
});
