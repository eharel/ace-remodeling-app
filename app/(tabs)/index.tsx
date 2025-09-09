import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { styling } from "@/utils/styling";

export default function HomeScreen() {
  const { getThemeColor, isDark } = useTheme();

  const handleKitchenPress = () => {
    router.push("/(tabs)/kitchens");
  };

  const handleBathroomPress = () => {
    router.push("/(tabs)/bathrooms");
  };

  console.log("Home page loaded");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: getThemeColor("background.secondary"),
    },
    header: {
      alignItems: "center",
      paddingTop: styling.spacing(20),
      paddingBottom: styling.spacing(8),
      paddingHorizontal: styling.spacing(6),
    },
    logo: {
      width: 200,
      height: 80,
      marginBottom: styling.spacing(6),
    },
    companyName: {
      fontSize: styling.fontSize("4xl"),
      textAlign: "center",
      fontWeight: styling.fontWeight("bold"),
      color: getThemeColor("text.primary"),
      lineHeight: styling.lineHeight("tight"),
      marginBottom: styling.spacing(2),
    },
    tagline: {
      fontSize: styling.fontSize("lg"),
      textAlign: "center",
      color: getThemeColor("text.secondary"),
      fontWeight: styling.fontWeight("medium"),
    },
    welcomeSection: {
      alignItems: "center",
      paddingHorizontal: styling.spacing(6),
      paddingBottom: styling.spacing(2),
    },
    welcomeText: {
      fontSize: styling.fontSize("xl"),
      textAlign: "center",
      color: getThemeColor("text.primary"),
      fontFamily: styling.fontFamily("semibold"),
      marginBottom: styling.spacing(2),
    },
    instructionText: {
      fontSize: styling.fontSize("base"),
      textAlign: "center",
      color: getThemeColor("text.secondary"),
      lineHeight: styling.lineHeight("relaxed"),
      marginTop: styling.spacing(4),
      paddingVertical: styling.spacing(6),
      minHeight: 80, // Ensure proper height for text visibility
    },
    categoriesSection: {
      paddingHorizontal: styling.spacing(6),
      paddingVertical: styling.spacing(6),
      backgroundColor: getThemeColor("background.primary"),
      borderRadius: styling.borderRadius("lg"),
      marginHorizontal: styling.spacing(4),
      marginTop: styling.spacing(4),
      marginBottom: styling.spacing(8),
      ...styling.shadow("sm"),
    },
    categoriesTitle: {
      fontSize: styling.fontSize("xl"),
      textAlign: "center",
      marginBottom: styling.spacing(6),
      color: getThemeColor("text.primary"),
      fontFamily: styling.fontFamily("bold"),
    },
    categoryButtons: {
      gap: styling.spacing(4),
      width: "85%",
      alignSelf: "center",
    },
    categoryButton: {
      backgroundColor: getThemeColor("background.card"),
      padding: styling.spacing(6),
      borderRadius: styling.borderRadius("lg"),
      alignItems: "center",
      borderWidth: 1,
      borderColor: getThemeColor("border.primary"),
      ...styling.shadow("base"),
      minHeight: 120,
    },
    categoryButtonPressed: {
      backgroundColor: getThemeColor("background.secondary"),
      transform: [{ scale: 0.98 }],
      ...styling.shadow("sm"),
    },
    categoryButtonText: {
      fontSize: styling.fontSize("lg"),
      marginBottom: styling.spacing(1),
      color: getThemeColor("text.primary"),
      fontWeight: styling.fontWeight("semibold"),
    },
    categoryDescription: {
      fontSize: styling.fontSize("sm"),
      color: getThemeColor("text.secondary"),
      textAlign: "center",
      lineHeight: styling.lineHeight("relaxed"),
    },
    categoryIcon: {
      marginBottom: styling.spacing(3),
    },
    footer: {
      alignItems: "center",
      paddingVertical: styling.spacing(6),
      paddingHorizontal: styling.spacing(6),
      borderTopWidth: 1,
      borderTopColor: getThemeColor("border.primary"),
    },
    footerText: {
      fontSize: styling.fontSize("sm"),
      color: getThemeColor("text.tertiary"),
      textAlign: "center",
    },
  });

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
              color: getThemeColor("interactive.primaryLight"),
            }}
          >
            <MaterialIcons
              name="kitchen"
              size={32}
              color={getThemeColor("interactive.primary")}
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
              color: getThemeColor("interactive.primaryLight"),
            }}
          >
            <MaterialIcons
              name="bathroom"
              size={32}
              color={getThemeColor("interactive.primary")}
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
