import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { currentEnvironment, currentProjectId } from "@/core/config";

import { DesignTokens } from "@/core/themes";
import {
  PageHeader,
  ThemedText,
  ThemedView,
  ThemeToggle,
} from "@/shared/components";
import { useTheme } from "@/shared/contexts";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background.primary,
        },
        scrollView: {
          flex: 1,
        },
        content: {
          padding: DesignTokens.spacing[4],
        },
        section: {
          marginBottom: DesignTokens.spacing[6],
        },
        sectionTitle: {
          marginBottom: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[2],
        },
        aboutContainer: {
          backgroundColor: theme.colors.background.card,
          padding: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
        },
        infoItem: {
          flexDirection: "row",
          alignItems: "center",
          padding: DesignTokens.spacing[4],
          marginBottom: DesignTokens.spacing[2],
          borderRadius: DesignTokens.borderRadius.md,
        },
        infoItemIcon: {
          marginRight: DesignTokens.spacing[3],
        },
        infoItemContent: {
          flex: 1,
        },
        infoItemTitle: {
          marginBottom: DesignTokens.spacing[1],
        },
        infoItemDescription: {
          opacity: 0.7,
        },
        infoItemChevron: {
          marginLeft: DesignTokens.spacing[2],
        },
        versionInfo: {
          textAlign: "center",
          opacity: 0.6,
          marginTop: DesignTokens.spacing[2],
        },
      }),
    [theme]
  );

  return (
    <ThemedView style={styles.container}>
      <PageHeader title="Settings" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            Appearance
          </ThemedText>
          <ThemeToggle />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <ThemedText variant="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>

          <ThemedView style={styles.aboutContainer}>
            <TouchableOpacity
              style={styles.infoItem}
              onPress={() => router.push("/about-company")}
              activeOpacity={DesignTokens.interactions.activeOpacity}
            >
              <MaterialIcons
                name="business"
                size={24}
                color={theme.colors.text.secondary}
                style={styles.infoItemIcon}
              />
              <View style={styles.infoItemContent}>
                <ThemedText variant="body" style={styles.infoItemTitle}>
                  Company Info
                </ThemedText>
                <ThemedText
                  variant="caption"
                  style={styles.infoItemDescription}
                >
                  About ACE Remodeling TX
                </ThemedText>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={theme.colors.text.secondary}
                style={styles.infoItemChevron}
              />
            </TouchableOpacity>

            <View style={styles.infoItem}>
              <MaterialIcons
                name="info"
                size={24}
                color={theme.colors.text.secondary}
                style={styles.infoItemIcon}
              />
              <View style={styles.infoItemContent}>
                <ThemedText variant="body" style={styles.infoItemTitle}>
                  App Version
                </ThemedText>
                <ThemedText
                  variant="caption"
                  style={styles.infoItemDescription}
                >
                  ACE Remodeling App v{Constants.expoConfig?.version || "1.0.0"}
                </ThemedText>
              </View>
            </View>

            <ThemedText variant="caption" style={styles.versionInfo}>
              Built for ACE Remodeling TX • Transforming Austin Homes
            </ThemedText>
          </ThemedView>
        </View>

        {__DEV__ && (
          <ThemedText variant="caption" style={{ marginTop: 20, opacity: 0.6 }}>
            Environment: {currentEnvironment}
            {"\n"}Project: {currentProjectId}
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}
