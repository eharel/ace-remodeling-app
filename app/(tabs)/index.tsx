import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";
import { styling } from "@/utils/styling";

export default function HomeScreen() {
  const { getThemeColor } = useTheme();

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
      padding: styling.spacing(5),
      backgroundColor: getThemeColor("background.secondary"),
    },
    header: {
      alignItems: "center",
      marginTop: styling.spacing(16),
      marginBottom: styling.spacing(10),
      gap: styling.spacing(3),
    },
    logo: {
      width: 250,
      height: 100,
      marginBottom: styling.spacing(4),
    },
    companyName: {
      fontSize: styling.fontSize("4xl"),
      textAlign: "center",
      fontWeight: styling.fontWeight("bold"),
      color: getThemeColor("text.primary"),
      lineHeight: styling.lineHeight("tight"),
    },
    tagline: {
      fontSize: styling.fontSize("xl"),
      textAlign: "center",
      color: getThemeColor("text.secondary"),
      fontWeight: styling.fontWeight("medium"),
    },
    welcomeSection: {
      alignItems: "center",
      marginBottom: styling.spacing(10),
      gap: styling.spacing(2),
    },
    welcomeText: {
      fontSize: styling.fontSize("2xl"),
      textAlign: "center",
      color: getThemeColor("text.primary"),
      fontFamily: styling.fontFamily("semibold"),
    },
    instructionText: {
      fontSize: styling.fontSize("lg"),
      textAlign: "center",
      color: getThemeColor("text.secondary"),
      lineHeight: styling.lineHeight("relaxed"),
    },
    categoriesSection: {
      flex: 1,
      gap: styling.spacing(6),
    },
    categoriesTitle: {
      fontSize: styling.fontSize("2xl"),
      textAlign: "center",
      marginBottom: styling.spacing(4),
      color: getThemeColor("text.primary"),
      fontFamily: styling.fontFamily("bold"),
    },
    categoryButtons: {
      gap: styling.spacing(4),
    },
    categoryButton: {
      backgroundColor: getThemeColor("background.card"),
      padding: styling.spacing(6),
      borderRadius: styling.borderRadius("lg"),
      alignItems: "center",
      borderWidth: 1,
      borderColor: getThemeColor("border.primary"),
      ...styling.shadow("base"),
    },
    categoryButtonPressed: {
      backgroundColor: getThemeColor("background.secondary"),
      transform: [{ scale: 0.98 }],
      ...styling.shadow("sm"),
    },
    categoryButtonText: {
      fontSize: styling.fontSize("xl"),
      marginBottom: styling.spacing(2),
      color: getThemeColor("text.primary"),
      fontWeight: styling.fontWeight("semibold"),
    },
    categoryDescription: {
      fontSize: styling.fontSize("base"),
      color: getThemeColor("text.secondary"),
      textAlign: "center",
      lineHeight: styling.lineHeight("relaxed"),
    },
    categoryIcon: {
      marginBottom: styling.spacing(2),
    },
    footer: {
      alignItems: "center",
      marginTop: styling.spacing(5),
      paddingTop: styling.spacing(5),
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
      <ThemedView style={styles.header}>
        <Image
          source={require("@/assets/images/ace-logo-full-black.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText variant="title" style={styles.companyName}>
          ACE Remodeling
        </ThemedText>
        <ThemedText variant="subtitle" style={styles.tagline}>
          Transforming Austin Homes
        </ThemedText>
      </ThemedView>

      {/* Welcome Message */}
      <ThemedView style={styles.welcomeSection}>
        <ThemedText variant="body" style={styles.welcomeText}>
          Ready to showcase our work!
        </ThemedText>
        <ThemedText variant="body" style={styles.instructionText}>
          Select a category below to view our featured projects
        </ThemedText>
      </ThemedView>

      {/* Category Navigation */}
      <ThemedView style={styles.categoriesSection}>
        <ThemedText variant="subtitle" style={styles.categoriesTitle}>
          Our Services
        </ThemedText>

        <ThemedView style={styles.categoryButtons}>
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
            <ThemedText
              type="defaultSemiBold"
              style={styles.categoryButtonText}
            >
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
            <ThemedText
              type="defaultSemiBold"
              style={styles.categoryButtonText}
            >
              Bathroom
            </ThemedText>
            <ThemedText style={styles.categoryDescription}>
              Bathroom transformations
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>

      {/* Footer */}
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Professional remodeling services in Austin, TX
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}
