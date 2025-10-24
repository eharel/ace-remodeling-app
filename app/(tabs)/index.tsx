import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";

export default function HomeScreen() {
  const { theme, isDark } = useTheme();

  const handleBrowsePortfolio = () => {
    router.push("/(tabs)/portfolio" as any);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: DesignTokens.spacing[6],
          backgroundColor: theme.colors.background.primary,
        },
        header: {
          alignItems: "center",
          marginBottom: DesignTokens.spacing[12],
        },
        logo: {
          width: 200,
          height: 60,
          marginBottom: DesignTokens.spacing[4],
        },
        title: {
          fontSize: DesignTokens.typography.fontSize["5xl"],
          fontWeight: DesignTokens.typography.fontWeight.bold,
          fontFamily: DesignTokens.typography.fontFamily.bold,
          color: theme.colors.text.primary,
          marginBottom: DesignTokens.spacing[2],
          textAlign: "center",
        },
        tagline: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontFamily: DesignTokens.typography.fontFamily.medium,
          color: theme.colors.text.secondary,
          textAlign: "center",
          maxWidth: 300,
          marginBottom: DesignTokens.spacing[8],
        },
        stats: {
          flexDirection: "row",
          justifyContent: "space-around",
          width: "100%",
          marginBottom: DesignTokens.spacing[8],
        },
        statItem: {
          alignItems: "center",
        },
        statNumber: {
          fontSize: DesignTokens.typography.fontSize["3xl"],
          fontWeight: DesignTokens.typography.fontWeight.bold,
          fontFamily: DesignTokens.typography.fontFamily.bold,
          color: theme.colors.interactive.primary,
          marginBottom: DesignTokens.spacing[1],
        },
        statLabel: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontFamily: DesignTokens.typography.fontFamily.medium,
          color: theme.colors.text.tertiary,
        },
        button: {
          paddingHorizontal: DesignTokens.spacing[8],
          paddingVertical: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.lg,
          backgroundColor: theme.colors.interactive.primary,
          ...DesignTokens.shadows.md,
        },
        buttonPressed: {
          transform: [{ scale: 0.98 }],
          ...DesignTokens.shadows.lg,
        },
        buttonText: {
          color: "#FFFFFF",
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
        },
      }),
    [theme]
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={
            isDark
              ? require("@/assets/images/ace-logo-full-white.png")
              : require("@/assets/images/ace-logo-full-black.png")
          }
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText style={styles.title}>ACE Remodeling</ThemedText>
        <ThemedText style={styles.tagline}>
          Transforming Austin Homes with Excellence
        </ThemedText>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>47+</ThemedText>
          <ThemedText style={styles.statLabel}>Projects</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>5</ThemedText>
          <ThemedText style={styles.statLabel}>Years</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statNumber}>100%</ThemedText>
          <ThemedText style={styles.statLabel}>Satisfied</ThemedText>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleBrowsePortfolio}
        accessibilityRole="button"
        accessibilityLabel="Browse our portfolio"
        accessibilityHint="Navigate to the portfolio section to view our projects"
      >
        <Text style={styles.buttonText}>Browse Our Portfolio</Text>
      </Pressable>
    </ThemedView>
  );
}
