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

      <View style={styles.buttonContainer}>
        {/* Auto/Manual Toggle */}
        <TouchableOpacity
          style={[
            dynamicStyles.button,
            themeMode === "auto" && dynamicStyles.activeButton,
          ]}
          onPress={handleToggleTheme}
        >
          <MaterialIcons
            name="auto-awesome"
            size={20}
            color={
              themeMode === "auto"
                ? getThemeColor("text.inverse")
                : getThemeColor("text.tertiary")
            }
          />
        </TouchableOpacity>

        {/* Light/Dark Toggle */}
        <TouchableOpacity
          style={[
            dynamicStyles.button,
            themeMode !== "auto" && dynamicStyles.activeButton,
          ]}
          onPress={handleExplicitToggle}
        >
          <MaterialIcons
            name={getThemeIcon()}
            size={20}
            color={
              themeMode !== "auto"
                ? getThemeColor("text.inverse")
                : getThemeColor("text.tertiary")
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    flex: 1,
    marginRight: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
