import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { ThemedText } from "./ThemedText";

export function ThemeToggle() {
  const { themeMode, setThemeMode, currentTheme, isDark, isLight } = useTheme();

  const handleToggleTheme = () => {
    if (themeMode === "auto") {
      // If auto, switch to explicit light/dark
      setThemeMode(isDark ? "light" : "dark");
    } else {
      // If explicit, switch to auto
      setThemeMode("auto");
    }
  };

  const handleExplicitToggle = () => {
    if (themeMode !== "auto") {
      setThemeMode(isDark ? "light" : "dark");
    }
  };

  const getThemeIcon = () => {
    if (themeMode === "auto") {
      return "auto-awesome";
    }
    return isDark ? "light-mode" : "dark-mode";
  };

  const getThemeLabel = () => {
    if (themeMode === "auto") {
      return `Auto (${currentTheme})`;
    }
    return currentTheme === "dark" ? "Dark" : "Light";
  };

  return (
    <View style={styles.container}>
      <ThemedText variant="caption" style={styles.label}>
        Theme: {getThemeLabel()}
      </ThemedText>

      <View style={styles.buttonContainer}>
        {/* Auto/Manual Toggle */}
        <TouchableOpacity
          style={[styles.button, themeMode === "auto" && styles.activeButton]}
          onPress={handleToggleTheme}
        >
          <MaterialIcons
            name="auto-awesome"
            size={20}
            color={themeMode === "auto" ? "#ffffff" : "#666666"}
          />
        </TouchableOpacity>

        {/* Light/Dark Toggle */}
        <TouchableOpacity
          style={[styles.button, themeMode !== "auto" && styles.activeButton]}
          onPress={handleExplicitToggle}
        >
          <MaterialIcons
            name={getThemeIcon()}
            size={20}
            color={themeMode !== "auto" ? "#ffffff" : "#666666"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    marginVertical: 8,
  },
  label: {
    flex: 1,
    marginRight: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  activeButton: {
    backgroundColor: "#3b82f6",
    borderColor: "#2563eb",
  },
});

