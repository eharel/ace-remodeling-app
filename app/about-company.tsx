import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useMemo } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import { PageHeader, ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

export default function AboutCompanyScreen() {
  const { theme } = useTheme();

  // Handle website link press
  const handleWebsiteLinkPress = () => {
    Linking.openURL("https://www.aceremodelingtx.com");
  };

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
        },
        card: {
          backgroundColor: theme.colors.background.card,
          padding: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
        },
        bodyText: {
          marginBottom: DesignTokens.spacing[4],
        },
        lastBodyText: {
          marginBottom: 0,
        },
        valuesGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: DesignTokens.spacing[3],
        },
        valueCard: {
          backgroundColor: theme.colors.background.card,
          padding: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
          flex: 1,
          minWidth: "47%", // For 2-column layout with gap
        },
        valueIcon: {
          marginBottom: DesignTokens.spacing[2],
        },
        valueTitle: {
          marginBottom: DesignTokens.spacing[1],
        },
        buttonContainer: {
          alignItems: "center",
          paddingHorizontal: DesignTokens.spacing[4],
        },
        button: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.components.button.primary,
          paddingVertical: DesignTokens.spacing[4],
          paddingHorizontal: DesignTokens.spacing[6],
          borderRadius: DesignTokens.borderRadius.md,
          ...DesignTokens.shadows.sm,
          gap: DesignTokens.spacing[2],
          maxWidth: 400,
          width: "100%",
        },
        buttonText: {
          color: theme.colors.text.inverse,
          fontSize: DesignTokens.typography.fontSize.base,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
        },
        contactText: {
          marginBottom: DesignTokens.spacing[4],
          textAlign: "center",
        },
      }),
    [theme]
  );

  const values = [
    {
      icon: "family-restroom" as const,
      title: "Family-Driven",
      description: "Built on family values and personal commitment",
    },
    {
      icon: "handshake" as const,
      title: "Value-Oriented",
      description: "Partnerships based on trust and mutual respect",
    },
    {
      icon: "verified" as const,
      title: "Trust & Dedication",
      description: "Treating your home with the care it deserves",
    },
    {
      icon: "star" as const,
      title: "Exceptional Craft",
      description: "Skilled craftsmanship in every project",
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false, // Hide React Navigation's header completely
        }}
      />
      <ThemedView style={styles.container}>
        <PageHeader
          title="About ACE Remodeling"
          subtitle="Transforming Austin, One Home at a Time!"
          showBack={true}
          backLabel="Settings"
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: DesignTokens.spacing[24] },
          ]}
        >
          {/* Our Story Section */}
          <View style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Our Story
            </ThemedText>
            <ThemedView style={styles.card}>
              <ThemedText variant="body" style={styles.bodyText}>
                We&apos;re a family-run, locally rooted Austin business with a
                name that carries a deeper meaning. The name ACE is actually
                very personal to us. ACE is actually an acronym for the
                founder&apos;s wife and two daughters, using the first letters
                of their names.
              </ThemedText>
              <ThemedText variant="body" style={styles.lastBodyText}>
                That&apos;s who we are: family-driven, value-oriented, and
                committed to the relationships that matter most. We believe that
                who works on your home matters. It should be someone you can
                trust—someone responsible, dedicated, and who treats your home
                with the care it deserves.
              </ThemedText>
            </ThemedView>
          </View>

          {/* Values Section */}
          <View style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              What We Stand For
            </ThemedText>
            <View style={styles.valuesGrid}>
              {values.map((value, index) => (
                <ThemedView key={index} style={styles.valueCard}>
                  <MaterialIcons
                    name={value.icon}
                    size={32}
                    color={theme.colors.text.accent}
                    style={styles.valueIcon}
                  />
                  <ThemedText variant="body" style={styles.valueTitle}>
                    {value.title}
                  </ThemedText>
                  <ThemedText variant="caption">{value.description}</ThemedText>
                </ThemedView>
              ))}
            </View>
          </View>

          {/* Partnership Section */}
          <View style={styles.section}>
            <ThemedText variant="subtitle" style={styles.sectionTitle}>
              Our Partnerships
            </ThemedText>
            <ThemedView style={styles.card}>
              <ThemedText variant="body" style={styles.lastBodyText}>
                We&apos;ve cultivated strong, lasting relationships with some of
                Austin&apos;s most skilled tradespeople and craftspeople. These
                partnerships allow us to tackle any challenge with expertise and
                creativity, ensuring exceptional results every time. Our
                reputation means everything to us, which is why so much of our
                work comes through referrals from satisfied clients.
              </ThemedText>
            </ThemedView>
          </View>

          {/* Contact/Action Section */}
          <View style={styles.section}>
            <ThemedText variant="body" style={styles.contactText}>
              We look forward to meeting you.
            </ThemedText>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleWebsiteLinkPress}
                activeOpacity={DesignTokens.interactions.activeOpacity}
              >
                <MaterialIcons
                  name="public"
                  size={20}
                  color={theme.colors.text.inverse}
                />
                <ThemedText style={styles.buttonText}>
                  Visit Our Website
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}
