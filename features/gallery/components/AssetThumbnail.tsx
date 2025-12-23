import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/shared/themes";
import { Document } from "@/shared/types";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

/**
 * AssetThumbnail component props
 */
export interface AssetThumbnailProps {
  /** Document to display */
  document: Document;
  /** Callback when thumbnail is pressed */
  onPress: () => void;
  /** Optional test ID */
  testID?: string;
}

/**
 * AssetThumbnail - Visual thumbnail card for document assets
 *
 * Displays a card with icon, filename, and category label.
 * Matches the visual style of photo thumbnails for consistency.
 *
 * @component
 */
export const AssetThumbnail: React.FC<AssetThumbnailProps> = ({
  document,
  onPress,
  testID = "asset-thumbnail",
}) => {
  const { theme } = useTheme();

  // Check if document is an image or PDF
  const isImage =
    document.fileType?.includes("image/") ||
    document.filename.match(/\.(jpg|jpeg|png|heic)$/i);

  const isPdf =
    document.fileType?.includes("pdf") ||
    document.filename.toLowerCase().endsWith(".pdf");

  // Helper function to normalize category string
  const normalizeCategory = (category: string | undefined): string => {
    if (!category) return "other";
    return category.toLowerCase().trim();
  };

  // Determine icon based on document category
  const getIcon = (): keyof typeof MaterialIcons.glyphMap => {
    const category = normalizeCategory(document.category);
    if (category === "plans" || category === "floor-plan" || category === "floor plan") {
      return "architecture";
    }
    if (category === "rendering" || category === "rendering-3d" || category === "3d rendering" || category === "3d") {
      return "view-in-ar";
    }
    if (category === "materials") {
      return "palette";
    }
    if (category === "contract" || category === "contracts") {
      return "description";
    }
    if (category === "permit" || category === "permits") {
      return "verified-user";
    }
    if (category === "invoice" || category === "invoices") {
      return "receipt";
    }
    if (document.fileType?.includes("pdf")) {
      return "picture-as-pdf";
    }
    if (document.fileType?.includes("image")) {
      return "image";
    }
    return "insert-drive-file";
  };

  // Get color for icon based on document category
  const getIconColor = (): string => {
    const category = normalizeCategory(document.category);
    if (category === "plans" || category === "floor-plan" || category === "floor plan") {
      return theme.colors.interactive.primary;
    }
    if (category === "rendering" || category === "rendering-3d" || category === "3d rendering" || category === "3d") {
      return theme.colors.interactive.primary;
    }
    if (category === "materials") {
      return theme.colors.interactive.primary;
    }
    if (category === "contract" || category === "contracts") {
      return theme.colors.interactive.primary;
    }
    if (category === "permit" || category === "permits") {
      return theme.colors.status.warning;
    }
    if (category === "invoice" || category === "invoices") {
      return theme.colors.status.success;
    }
    return theme.colors.text.secondary;
  };

  // Truncate filename for display
  const displayName = useMemo(() => {
    const maxLength = 20;
    if (document.name.length > maxLength) {
      return document.name.substring(0, maxLength - 3) + "...";
    }
    return document.name;
  }, [document.name]);

  // Get category label from document.category
  const categoryLabel = useMemo(() => {
    const category = normalizeCategory(document.category);
    if (category === "plans" || category === "floor-plan" || category === "floor plan") {
      return "PLAN";
    }
    if (category === "rendering" || category === "rendering-3d" || category === "3d rendering" || category === "3d") {
      return "RENDERING";
    }
    if (category === "materials") {
      return "MATERIALS";
    }
    if (category === "contract" || category === "contracts") {
      return "CONTRACT";
    }
    if (category === "permit" || category === "permits") {
      return "PERMIT";
    }
    if (category === "invoice" || category === "invoices") {
      return "INVOICE";
    }
    return "OTHER";
  }, [document.category]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        thumbnail: {
          width: 120,
          padding: DesignTokens.spacing[3],
          borderRadius: DesignTokens.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          backgroundColor: theme.colors.background.card,
          gap: DesignTokens.spacing[2],
          alignItems: "center",
        },
        imagePreview: {
          width: "100%",
          height: 80,
          borderRadius: DesignTokens.borderRadius.md,
          backgroundColor: theme.colors.background.secondary,
        },
        iconContainer: {
          width: 80,
          height: 80,
          borderRadius: DesignTokens.borderRadius.md,
          backgroundColor: theme.colors.background.secondary,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
        },
        filename: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontFamily: DesignTokens.typography.fontFamily.medium,
          textAlign: "center",
          color: theme.colors.text.primary,
          lineHeight:
            DesignTokens.typography.fontSize.sm *
            DesignTokens.typography.lineHeight.tight,
        },
        category: {
          fontSize: DesignTokens.typography.fontSize.xs,
          fontFamily: DesignTokens.typography.fontFamily.regular,
          textAlign: "center",
          color: theme.colors.text.secondary,
          textTransform: "uppercase",
        },
      }),
    [theme]
  );

  return (
    <Pressable
      onPress={onPress}
      style={styles.thumbnail}
      testID={testID}
      accessible={true}
      accessibilityLabel={`Open ${document.name}, ${document.category || "other"} document`}
      accessibilityRole="button"
      android_ripple={{
        color: `${theme.colors.interactive.primary}20`,
        borderless: false,
      }}
    >
      {isImage ? (
        // Show image preview for image documents
        <Image
          source={{ uri: document.url }}
          style={styles.imagePreview}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          accessibilityLabel={`Preview of ${document.name}`}
        />
      ) : (
        // Show icon for PDFs and other documents
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={isPdf ? "picture-as-pdf" : getIcon()}
            size={32}
            color={isPdf ? theme.colors.status.error : getIconColor()}
            accessibilityLabel={`${document.category || "other"} icon`}
          />
        </View>
      )}
      <ThemedText style={styles.filename} numberOfLines={2}>
        {displayName}
      </ThemedText>
      <ThemedText style={styles.category}>{categoryLabel}</ThemedText>
    </Pressable>
  );
};




