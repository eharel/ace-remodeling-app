import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { useTheme } from "@/shared/contexts";

/**
 * TestFlight invite URL for app updates
 */
const TESTFLIGHT_URL = "https://testflight.apple.com/join/6755127370";

/**
 * Icon size for notification icon
 */
const NOTIFICATION_ICON_SIZE = DesignTokens.typography.fontSize["2xl"];

/**
 * Arrow icon size for button
 */
const ARROW_ICON_SIZE = DesignTokens.componentSizes.iconSizeSmall;

/**
 * Left accent border width
 */
const ACCENT_BORDER_WIDTH = DesignTokens.borderWidth.base;

/**
 * Minimum button width for adequate touch target
 */
const MIN_BUTTON_WIDTH = 160;

/**
 * Props for the UpdateBanner component
 */
interface UpdateBannerProps {
  /** Whether an update is required. Banner only displays when true. */
  updateRequired: boolean;
}

/**
 * Static styles that don't depend on theme
 * These are defined outside the component to avoid recreation on re-render
 */
const staticStyles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
    borderLeftWidth: ACCENT_BORDER_WIDTH,
    ...DesignTokens.shadows.md,
  },
  content: {
    gap: DesignTokens.spacing[3],
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: DesignTokens.spacing[3],
  },
  textColumn: {
    flex: 1,
    gap: DesignTokens.spacing[1],
  },
  mainMessage: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontFamily: DesignTokens.typography.fontFamily.regular,
    lineHeight:
      DesignTokens.typography.fontSize.base * DesignTokens.typography.lineHeight.relaxed,
  },
  secondaryMessage: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontFamily: DesignTokens.typography.fontFamily.regular,
    lineHeight:
      DesignTokens.typography.fontSize.base * DesignTokens.typography.lineHeight.relaxed,
  },
  buttonContainer: {
    marginTop: DesignTokens.spacing[4],
    alignItems: "center",
  },
  button: {
    paddingVertical: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[6],
    borderRadius: DesignTokens.borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DesignTokens.spacing[2],
    minWidth: MIN_BUTTON_WIDTH,
    minHeight: DesignTokens.componentSizes.iconButton,
    ...DesignTokens.shadows.sm,
  },
  buttonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontFamily: DesignTokens.typography.fontFamily.semibold,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: "#FFFFFF", // Always white on primary button
  },
});

/**
 * Professional, elevated banner that prompts users to update the app via TestFlight.
 *
 * Features an elevated card design with a left accent border in the primary color.
 * Uses clear visual hierarchy with icon, text, and action button. Displays when
 * the current build number is below the minimum required build.
 *
 * Uses the app's design system (DesignTokens) exclusively and responds to theme changes.
 *
 * @example
 * const { updateRequired } = useVersionCheck();
 * return <UpdateBanner updateRequired={updateRequired} />;
 */
export function UpdateBanner({ updateRequired }: UpdateBannerProps) {
  const { theme } = useTheme();

  // Dynamic styles that depend on theme colors
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.background.elevated,
          borderLeftColor: theme.colors.components.button.primary,
          shadowColor: theme.colors.shadows.md.shadowColor,
          shadowOpacity: theme.colors.shadows.md.shadowOpacity,
        },
        mainMessage: {
          color: theme.colors.text.primary,
        },
        secondaryMessage: {
          color: theme.colors.text.primary,
        },
        button: {
          backgroundColor: theme.colors.components.button.primary,
          shadowColor: theme.colors.shadows.sm.shadowColor,
          shadowOpacity: theme.colors.shadows.sm.shadowOpacity,
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

  // Early return if update is not required
  if (!updateRequired) {
    return null;
  }

  return (
    <View style={[staticStyles.container, dynamicStyles.container]}>
      <View style={staticStyles.content}>
        {/* Icon and Main Message Row */}
        <View style={staticStyles.iconRow}>
          <MaterialIcons
            name="notifications"
            size={NOTIFICATION_ICON_SIZE}
            color={theme.colors.components.button.primary}
          />
          <View style={staticStyles.textColumn}>
            <Text style={[staticStyles.mainMessage, dynamicStyles.mainMessage]}>
              A new version is available.
            </Text>
            <Text
              style={[staticStyles.secondaryMessage, dynamicStyles.secondaryMessage]}
            >
              Please update via TestFlight to continue receiving updates.
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={staticStyles.buttonContainer}>
          <Pressable
            onPress={handleUpdatePress}
            android_ripple={{
              color: "#FFFFFF",
              borderless: false,
            }}
            style={({ pressed }) => [
              staticStyles.button,
              dynamicStyles.button,
              {
                opacity: pressed ? DesignTokens.interactions.activeOpacity : 1,
              },
            ]}
          >
            <Text style={staticStyles.buttonText}>Update Now</Text>
            <MaterialIcons
              name="arrow-forward"
              size={ARROW_ICON_SIZE}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

