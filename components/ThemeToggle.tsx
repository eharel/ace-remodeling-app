import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "./ThemedText";

export function ThemeToggle() {
  const {
    themeMode,
    setThemeMode,
    currentTheme,
    isDark,
    isLight,
    getThemeColor,
  } = useTheme();

  const handleToggleTheme = () => {
    // Cycle through: auto → light → dark → auto
    if (themeMode === "auto") {
      setThemeMode("light");
    } else if (themeMode === "light") {
      setThemeMode("dark");
    } else {
      setThemeMode("auto");
    }
  };

  const getThemeIcon = () => {
    if (themeMode === "auto") {
      return "auto-awesome";
    } else if (themeMode === "light") {
      return "light-mode";
    } else {
      return "dark-mode";
    }
  };

  const getThemeLabel = () => {
    if (themeMode === "auto") {
      return `Auto (${currentTheme})`;
    }
    return currentTheme === "dark" ? "Dark" : "Light";
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: getThemeColor("background.secondary"),
      borderRadius: 8,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: getThemeColor("border.primary"),
    },
    button: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: getThemeColor("background.card"),
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: getThemeColor("border.primary"),
    },
    activeButton: {
      backgroundColor: getThemeColor("interactive.primary"),
      borderColor: getThemeColor("interactive.primary"),
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <ThemedText variant="caption" style={styles.label}>
        Theme: {getThemeLabel()}
      </ThemedText>

      <TouchableOpacity
        style={dynamicStyles.button}
        onPress={handleToggleTheme}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={getThemeIcon()}
          size={24}
          color={getThemeColor("text.primary")}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    flex: 1,
    marginRight: 16,
  },
});
