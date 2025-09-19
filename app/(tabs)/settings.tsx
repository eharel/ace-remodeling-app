import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText, ThemedView } from "@/components/themed";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";

export default function SettingsScreen() {
  const { theme, isMain } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: isMain
            ? theme.colors.background.primary
            : theme.colors.background.secondary,
        },
        scrollView: {
          flex: 1,
        },
        content: {
          padding: DesignTokens.spacing[4],
          paddingTop: DesignTokens.spacing[10],
        },
        section: {
          marginBottom: DesignTokens.spacing[6],
        },
        sectionTitle: {
          marginBottom: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[2],
        },
        settingItem: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "transparent",
          padding: DesignTokens.spacing[4],
          marginBottom: DesignTokens.spacing[2],
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 0,
        },
        settingItemContent: {
          flex: 1,
          marginRight: DesignTokens.spacing[3],
        },
        settingItemTitle: {
          marginBottom: DesignTokens.spacing[1],
        },
        settingItemDescription: {
          opacity: 0.7,
        },
        settingItemIcon: {
          marginRight: DesignTokens.spacing[3],
        },
        settingItemAction: {
          alignItems: "center",
          justifyContent: "center",
        },
        comingSoon: {
          opacity: 0.5,
        },
        versionInfo: {
          textAlign: "center",
          opacity: 0.6,
          marginTop: DesignTokens.spacing[2],
        },
        appearanceContainer: {
          backgroundColor: isMain
            ? theme.colors.background.secondary
            : theme.colors.background.card,
          padding: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
        },
        presentationContainer: {
          backgroundColor: isMain
            ? theme.colors.background.secondary
            : theme.colors.background.card,
          padding: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
        },
        dataContainer: {
          backgroundColor: isMain
            ? theme.colors.background.secondary
            : theme.colors.background.card,
          padding: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
        },
        aboutContainer: {
          backgroundColor: isMain
            ? theme.colors.background.secondary
            : theme.colors.background.card,
          padding: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
        },
      }),
    [theme, isMain]
  );

  const SettingItem = ({
    icon,
    title,
    description,
    onPress,
    disabled = false,
    children,
  }: {
    icon: string;
    title: string;
    description?: string;
    onPress?: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.comingSoon]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name={icon as any}
        size={24}
        color={theme.colors.text.secondary}
        style={styles.settingItemIcon}
      />
      <View style={styles.settingItemContent}>
        <ThemedText variant="body" style={styles.settingItemTitle}>
          {title}
        </ThemedText>
        {description && (
          <ThemedText variant="caption" style={styles.settingItemDescription}>
            {description}
          </ThemedText>
        )}
      </View>
      <View style={styles.settingItemAction}>
        {children || (
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={theme.colors.text.tertiary}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Appearance
          </ThemedText>

          <ThemedView style={styles.appearanceContainer}>
            <ThemeToggle />
          </ThemedView>
        </View>

        {/* Presentation Section */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Presentation
          </ThemedText>

          <ThemedView style={styles.presentationContainer}>
            <SettingItem
              icon="view-module"
              title="Default View"
              description="Choose how projects are displayed"
              disabled={true}
            />

            <SettingItem
              icon="image"
              title="Image Quality"
              description="Optimize for storage or quality"
              disabled={true}
            />
          </ThemedView>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Data & Sync
          </ThemedText>

          <ThemedView style={styles.dataContainer}>
            <SettingItem
              icon="sync"
              title="Sync Preferences"
              description="Configure automatic synchronization"
              disabled={true}
            />

            <SettingItem
              icon="offline-bolt"
              title="Offline Mode"
              description="Manage offline capabilities"
              disabled={true}
            />
          </ThemedView>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>

          <ThemedView style={styles.aboutContainer}>
            <SettingItem
              icon="info"
              title="App Version"
              description="ACE Remodeling App v1.0.0"
              disabled={true}
            />

            <SettingItem
              icon="business"
              title="Company Info"
              description="About ACE Remodeling TX"
              disabled={true}
            />

            <ThemedText variant="caption" style={styles.versionInfo}>
              Built for ACE Remodeling TX • Transforming Austin Homes
            </ThemedText>
          </ThemedView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
