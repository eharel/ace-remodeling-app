import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { PdfDisplay } from "@/components/PdfDisplay";
import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";

export default function HomeScreen() {
  const { theme, isDark } = useTheme();

  const handleKitchenPress = () => {
    router.push("/(tabs)/kitchens");
  };

  const handleBathroomPress = () => {
    router.push("/(tabs)/bathrooms");
  };

  console.log("Home page loaded");

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background.secondary,
        },
        header: {
          alignItems: "center",
          paddingTop: DesignTokens.spacing[20],
          paddingBottom: DesignTokens.spacing[8],
          paddingHorizontal: DesignTokens.spacing[6],
        },
        logo: {
          width: 200,
          height: 80,
          marginBottom: DesignTokens.spacing[6],
        },
        companyName: {
          fontSize: DesignTokens.typography.fontSize["4xl"],
          textAlign: "center",
          fontWeight: DesignTokens.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          lineHeight: DesignTokens.typography.lineHeight.tight,
          marginBottom: DesignTokens.spacing[2],
        },
        tagline: {
          fontSize: DesignTokens.typography.fontSize.lg,
          textAlign: "center",
          color: theme.colors.text.secondary,
          fontWeight: DesignTokens.typography.fontWeight.medium,
        },
        welcomeSection: {
          alignItems: "center",
          paddingHorizontal: DesignTokens.spacing[6],
          paddingBottom: DesignTokens.spacing[2],
        },
        welcomeText: {
          fontSize: DesignTokens.typography.fontSize.xl,
          textAlign: "center",
          color: theme.colors.text.primary,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
          marginBottom: DesignTokens.spacing[2],
        },
        instructionText: {
          fontSize: DesignTokens.typography.fontSize.base,
          textAlign: "center",
          color: theme.colors.text.secondary,
          lineHeight: DesignTokens.typography.lineHeight.relaxed,
          marginTop: DesignTokens.spacing[4],
          paddingVertical: DesignTokens.spacing[6],
          minHeight: 80, // Ensure proper height for text visibility
        },
        categoriesSection: {
          paddingHorizontal: DesignTokens.spacing[6],
          paddingVertical: DesignTokens.spacing[6],
          backgroundColor: theme.colors.background.primary,
          borderRadius: DesignTokens.borderRadius.lg,
          marginHorizontal: DesignTokens.spacing[4],
          marginTop: DesignTokens.spacing[4],
          marginBottom: DesignTokens.spacing[8],
          ...DesignTokens.shadows.sm,
        },
        categoriesTitle: {
          fontSize: DesignTokens.typography.fontSize.xl,
          textAlign: "center",
          marginBottom: DesignTokens.spacing[6],
          color: theme.colors.text.primary,
          fontFamily: DesignTokens.typography.fontFamily.bold,
        },
        categoryButtons: {
          gap: DesignTokens.spacing[4],
          width: "85%",
          alignSelf: "center",
        },
        categoryButton: {
          backgroundColor: theme.colors.background.card,
          padding: DesignTokens.spacing[6],
          borderRadius: DesignTokens.borderRadius.lg,
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.base,
          minHeight: 120,
        },
        categoryButtonPressed: {
          backgroundColor: theme.colors.background.secondary,
          transform: [{ scale: 0.98 }],
          ...DesignTokens.shadows.sm,
        },
        categoryButtonText: {
          fontSize: DesignTokens.typography.fontSize.lg,
          marginBottom: DesignTokens.spacing[1],
          color: theme.colors.text.primary,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
        },
        categoryDescription: {
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.text.secondary,
          textAlign: "center",
          lineHeight: DesignTokens.typography.lineHeight.relaxed,
        },
        categoryIcon: {
          marginBottom: DesignTokens.spacing[3],
        },
        footer: {
          alignItems: "center",
          paddingVertical: DesignTokens.spacing[6],
          paddingHorizontal: DesignTokens.spacing[6],
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.primary,
        },
        footerText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.text.tertiary,
          textAlign: "center",
        },
        pdfTestSection: {
          marginHorizontal: DesignTokens.spacing[4],
          marginBottom: DesignTokens.spacing[8],
          height: 400,
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.lg,
          overflow: "hidden",
          ...DesignTokens.shadows.base,
        },
        pdfTestTitle: {
          fontSize: DesignTokens.typography.fontSize.lg,
          textAlign: "center",
          marginBottom: DesignTokens.spacing[4],
          marginTop: DesignTokens.spacing[4],
          color: theme.colors.text.primary,
          fontFamily: DesignTokens.typography.fontFamily.bold,
        },
        testButton: {
          backgroundColor: theme.colors.interactive.primary,
          marginHorizontal: DesignTokens.spacing[4],
          marginBottom: DesignTokens.spacing[4],
          paddingVertical: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          alignItems: "center",
        },
        testButtonText: {
          color: theme.colors.text.inverse,
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: DesignTokens.typography.fontWeight.medium,
        },
      }),
    [theme]
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header Section */}
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
        <ThemedText variant="title" style={styles.companyName}>
          ACE Remodeling
        </ThemedText>
        <ThemedText variant="subtitle" style={styles.tagline}>
          Transforming Austin Homes
        </ThemedText>
      </View>

      {/* Welcome Message */}
      <View style={styles.welcomeSection}>
        <ThemedText variant="body" style={styles.welcomeText}>
          Ready to showcase our work!
        </ThemedText>
        <ThemedText variant="body" style={styles.instructionText}>
          Select a category below to view our featured projects
        </ThemedText>
      </View>

      {/* TEMPORARY: PDF Test Section */}
      <ThemedText style={styles.pdfTestTitle}>
        📄 PDF Test (Temporary)
      </ThemedText>
      <View style={styles.pdfTestSection}>
        <PdfDisplay uri="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" />
      </View>

      {/* TEMPORARY: PDF Viewer Test Button */}
      <Pressable
        style={({ pressed }) => [
          styles.testButton,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => {
          router.push({
            pathname: "/pdf-viewer",
            params: {
              url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
              name: "Test Document",
              id: "test-123",
            },
          });
        }}
      >
        <ThemedText style={styles.testButtonText}>
          🚀 Open PDF Viewer
        </ThemedText>
      </Pressable>

      {/* Category Navigation */}
      <View style={styles.categoriesSection}>
        <ThemedText variant="subtitle" style={styles.categoriesTitle}>
          Our Services
        </ThemedText>

        <View style={styles.categoryButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.categoryButton,
              pressed && styles.categoryButtonPressed,
            ]}
            onPress={handleKitchenPress}
            android_ripple={{
              color: theme.colors.interactive.primaryLight,
            }}
          >
            <MaterialIcons
              name="kitchen"
              size={32}
              color={theme.colors.interactive.primary}
              style={styles.categoryIcon}
            />
            <ThemedText variant="body" style={styles.categoryButtonText}>
              Kitchen
            </ThemedText>
            <ThemedText style={styles.categoryDescription}>
              Kitchen remodeling and renovations
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.categoryButton,
              pressed && styles.categoryButtonPressed,
            ]}
            onPress={handleBathroomPress}
            android_ripple={{
              color: theme.colors.interactive.primaryLight,
            }}
          >
            <MaterialIcons
              name="bathroom"
              size={32}
              color={theme.colors.interactive.primary}
              style={styles.categoryIcon}
            />
            <ThemedText variant="body" style={styles.categoryButtonText}>
              Bathroom
            </ThemedText>
            <ThemedText style={styles.categoryDescription}>
              Bathroom transformations
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Professional remodeling services in Austin, TX
        </ThemedText>
      </View>
    </ThemedView>
  );
}
