import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/shared/themes";
import { Picture } from "@/shared/types";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

/**
 * MorePhotosCard component props
 */
export interface MorePhotosCardProps {
  /** Number of additional photos not shown in preview */
  count: number;
  /** Background photo to show beneath overlay */
  backgroundPhoto?: Picture;
  /** Callback when card is pressed */
  onPress: () => void;
  /** Optional test ID */
  testID?: string;
}

/**
 * MorePhotosCard - A card showing remaining photo count
 *
 * Displays a pressable card that indicates how many more photos
 * are available beyond the preview. Opens the full gallery when tapped.
 *
 * Features:
 * - Uses flex: 1 to match photo grid item sizing automatically
 * - Theme-aware styling with dashed border
 * - Accessible with proper labels
 * - Shows remaining photo count
 *
 * @component
 * @example
 * ```tsx
 * <MorePhotosCard
 *   count={15}
 *   onPress={() => openGallery()}
 * />
 * ```
 */
export const MorePhotosCard: React.FC<MorePhotosCardProps> = ({
  count,
  backgroundPhoto,
  onPress,
  testID = "more-photos-card",
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1, // Takes equal space with photo items
          aspectRatio: 4 / 3,
          borderRadius: DesignTokens.borderRadius.lg,
          overflow: "hidden",
          ...DesignTokens.shadows.sm, // Match photo item shadows
        },
        cardPressed: {
          opacity: DesignTokens.interactions.activeOpacity,
        },
        backgroundImage: {
          width: "100%",
          height: "100%",
          position: "absolute",
        },
        overlay: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.background.overlay, // Match gallery modal overlay
          justifyContent: "center",
          alignItems: "center",
        },
        text: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.text.inverse, // White text on dark background
          textAlign: "center",
        },
      }),
    [theme]
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`View ${count} more photo${count === 1 ? "" : "s"}`}
      accessibilityHint="Opens the full photo gallery"
      testID={testID}
    >
      {backgroundPhoto && (
        <Image
          source={{ uri: backgroundPhoto.uri }}
          style={styles.backgroundImage}
          contentFit="cover"
        />
      )}
      <View style={styles.overlay}>
        <ThemedText style={styles.text}>
          +{count} more photo{count === 1 ? "" : "s"}
        </ThemedText>
      </View>
    </Pressable>
  );
};
