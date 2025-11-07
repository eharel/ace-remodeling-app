import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { DesignTokens, ThemeSetting } from "@/core/themes";
import { useTheme } from "../contexts";
import { ThemedIconButton, ThemedText } from "./themed";

type ThemeOption = ThemeSetting;

export function ThemeToggle() {
  const { themeSetting, setThemeSetting, theme } = useTheme();

  const themeOptions: { key: ThemeOption; label: string; icon: string }[] = [
    { key: "main", label: "Main", icon: "business" },
    { key: "light", label: "Light", icon: "light-mode" },
    { key: "dark", label: "Dark", icon: "dark-mode" },
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

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.md,
          marginVertical: DesignTokens.spacing[2],
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          padding: DesignTokens.spacing[4],
        },
        buttonRow: {
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingHorizontal: DesignTokens.spacing[6],
        },
        buttonContainer: {
          alignItems: "center",
          gap: DesignTokens.spacing[1],
        },
      }),
    [theme]
  );

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.buttonRow}>
        {themeOptions.map((option) => {
          const active = isActive(option.key);
          return (
            <View key={option.key} style={dynamicStyles.buttonContainer}>
              <ThemedIconButton
                icon={option.icon as any}
                variant={active ? "primary" : "secondary"}
                size="large"
                onPress={() => handleThemeSelect(option.key)}
                disabled={active}
                accessibilityLabel={`${option.label} theme`}
                accessibilityState={{ selected: active }}
              />
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
    fontSize: DesignTokens.typography.fontSize.xs,
    lineHeight:
      DesignTokens.typography.fontSize.xs *
      DesignTokens.typography.lineHeight.tight,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textAlign: "center",
  },
});
