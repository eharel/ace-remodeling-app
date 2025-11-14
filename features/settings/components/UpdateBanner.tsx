import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

/**
 * TestFlight invite URL for app updates
 */
const TESTFLIGHT_URL = "https://testflight.apple.com/join/6755127370";

/**
 * Icon sizes for UpdateBanner component
 */
const ICON_SIZE = DesignTokens.componentSizes.iconSize;
const ARROW_ICON_SIZE = DesignTokens.componentSizes.iconSizeSmall;

/**
 * Minimum touch target size for accessibility (iOS/Android standard)
 */
const MIN_TOUCH_TARGET = DesignTokens.componentSizes.iconButton;

/**
 * Props for the UpdateBanner component
 */
interface UpdateBannerProps {
  /** Whether an update is required. Banner only displays when true. */
  updateRequired: boolean;
}

/**
 * Non-dismissible banner that prompts users to update the app via TestFlight.
 *
 * Displays when the current build number is below the minimum required build.
 * Opens TestFlight when the "Update Now" button is pressed.
 *
 * Uses the app's design system (DesignTokens) and responds to theme changes.
 *
 * @example
 * const { updateRequired } = useVersionCheck();
 * return <UpdateBanner updateRequired={updateRequired} />;
 */
export function UpdateBanner({ updateRequired }: UpdateBannerProps) {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.status.warning,
          borderRadius: DesignTokens.borderRadius.md,
          padding: DesignTokens.spacing[4],
          marginBottom: DesignTokens.spacing[4],
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.md,
        },
        content: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: DesignTokens.spacing[3],
        },
        iconContainer: {
          paddingTop: DesignTokens.spacing[1],
        },
        textContainer: {
          flex: 1,
          gap: DesignTokens.spacing[2],
        },
        message: {
          color: theme.colors.text.primary,
        },
        buttonContainer: {
          marginTop: DesignTokens.spacing[3],
        },
        button: {
          backgroundColor: theme.colors.components.button.primary,
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: DesignTokens.spacing[2],
          minHeight: MIN_TOUCH_TARGET,
          ...DesignTokens.shadows.sm,
        },
        buttonText: {
          color: theme.colors.text.inverse,
          fontSize: DesignTokens.typography.fontSize.base,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
        },
      }),
    [theme]
  );

  /**
   * Opens the TestFlight app or web page when button is pressed
   */
  const handleUpdatePress = async () => {
    try {
      const canOpen = await Linking.canOpenURL(TESTFLIGHT_URL);
      if (canOpen) {
        await Linking.openURL(TESTFLIGHT_URL);
      } else {
        console.error("Cannot open TestFlight URL");
      }
    } catch (error) {
      console.error("Error opening TestFlight:", error);
    }
  };

  // Only render if update is required
  if (!updateRequired) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name="system-update"
            size={ICON_SIZE}
            color={theme.colors.text.primary}
          />
        </View>

        <View style={styles.textContainer}>
          <ThemedText variant="body" style={styles.message}>
            A new version is available. Please update via TestFlight to
            continue.
          </ThemedText>

          <View style={styles.buttonContainer}>
            <Pressable
              onPress={handleUpdatePress}
              android_ripple={{
                color: theme.colors.text.inverse,
                borderless: false,
              }}
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed ? DesignTokens.interactions.activeOpacity : 1 },
              ]}
            >
              <MaterialIcons
                name="arrow-forward"
                size={ARROW_ICON_SIZE}
                color={theme.colors.text.inverse}
              />
              <ThemedText style={styles.buttonText}>Update Now</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

