import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";

import {
  AssetThumbnail,
  ImageGalleryModal,
  type AssetCategoryValue,
} from "@/features/gallery";
import { useAssetCategoryManagement } from "@/features/projects/hooks/useAssetCategoryManagement";
import { ThemedText, ThemedView } from "@/shared/components";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import type { Document } from "@/shared/types";
import { commonStyles } from "@/shared/utils";

export interface AssetsSectionProps {
  documents: Document[];
  projectId: string;
  selectedComponentId: string | null;
  /** When true, shows edit affordances and opens documents screen in edit mode */
  isEditMode?: boolean;
}

/**
 * AssetsSection - Displays project assets with category filtering
 *
 * Features:
 * - Category tabs for filtering assets (Plans, Materials, Renderings, etc.)
 * - Horizontal scrolling thumbnail previews
 * - Opens image gallery modal for images
 * - Opens PDF viewer for documents
 * - "View All" / "Edit" link to full documents screen
 */
export const AssetsSection: React.FC<AssetsSectionProps> = ({
  documents,
  projectId,
  selectedComponentId,
  isEditMode = false,
}) => {
  const { theme } = useTheme();

  const {
    selectedAssetCategory,
    setSelectedAssetCategory,
    selectedAssetIndex,
    setSelectedAssetIndex,
    assetGalleryVisible,
    setAssetGalleryVisible,
    assetCounts,
    availableAssetCategories,
    filteredDocuments,
    assetGalleryImages,
    documentToImageIndex,
    getAssetCategoryLabel,
  } = useAssetCategoryManagement({
    documents,
    selectedComponentId,
  });

  const styles = useMemo(
    () => ({
      // Card container - matches PhotoPreviewSection
      section: {
        backgroundColor: theme.colors.background.card,
        marginBottom: DesignTokens.spacing[4],
        marginHorizontal: DesignTokens.spacing[4],
        padding: DesignTokens.spacing[6],
        borderRadius: DesignTokens.borderRadius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border.primary,
        ...DesignTokens.shadows.md,
      },
      sectionHeader: {
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
        alignItems: "center" as const,
        marginBottom: DesignTokens.spacing[2],
      },
      sectionTitle: {
        ...commonStyles.text.sectionTitle,
        marginBottom: 0,
      },
      viewAllButton: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        paddingVertical: DesignTokens.spacing[2],
      },
      viewAllButtonText: {
        fontSize: DesignTokens.typography.fontSize.sm,
        color: theme.colors.interactive.primary,
        fontWeight: DesignTokens.typography.fontWeight.medium,
      },
      assetThumbnails: {
        flexDirection: "row" as const,
        gap: DesignTokens.spacing[3],
        paddingVertical: DesignTokens.spacing[2],
      },
      moreAssetsButton: {
        width: 100,
        height: 100,
        borderRadius: DesignTokens.borderRadius.md,
        backgroundColor: theme.colors.background.secondary,
        justifyContent: "center" as const,
        alignItems: "center" as const,
        borderWidth: 1,
        borderColor: theme.colors.border.primary,
        borderStyle: "dashed" as const,
      },
      moreAssetsText: {
        fontSize: DesignTokens.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        fontWeight: DesignTokens.typography.fontWeight.medium,
      },
      emptyState: {
        padding: DesignTokens.spacing[8],
        alignItems: "center" as const,
        justifyContent: "center" as const,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: DesignTokens.borderRadius.md,
      },
      emptyStateText: {
        fontSize: DesignTokens.typography.fontSize.base,
        color: theme.colors.text.secondary,
        textAlign: "center" as const,
        marginTop: DesignTokens.spacing[2],
      },
    }),
    [theme]
  );

  const handleAssetPress = (doc: Document) => {
    // Check if this is an image
    const isImage =
      doc.fileType?.includes("image/") ||
      doc.filename.match(/\.(jpg|jpeg|png|heic)$/i);

    if (isImage) {
      // Look up this document's index in the gallery using URL
      const galleryIndex = documentToImageIndex.get(doc.url);

      if (
        galleryIndex === undefined ||
        galleryIndex < 0 ||
        galleryIndex >= assetGalleryImages.length
      ) {
        return;
      }

      setSelectedAssetIndex(galleryIndex);
      setAssetGalleryVisible(true);
    } else {
      // This is a PDF - open PDF viewer
      router.push({
        pathname: "/pdf-viewer",
        params: {
          url: encodeURIComponent(doc.url),
          name: doc.name || doc.filename,
          id: doc.id,
        },
      });
    }
  };

  const handleViewAllPress = () => {
    router.push({
      pathname: "/project/[id]/documents",
      params: {
        id: projectId,
        ...(isEditMode && { editMode: "true" }),
      },
    });
  };

  // Always show empty state (consistent with Photos section)
  if (!documents || documents.length === 0) {
    return (
      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            Assets
          </ThemedText>
          <Pressable
            style={styles.viewAllButton}
            onPress={handleViewAllPress}
            accessible={true}
            accessibilityLabel={isEditMode ? "Edit assets" : "View all assets"}
            accessibilityRole="button"
          >
            <ThemedText style={styles.viewAllButtonText}>
              {isEditMode ? "Edit" : "View All"}
            </ThemedText>
            <MaterialIcons
              name="chevron-right"
              size={16}
              color={theme.colors.interactive.primary}
            />
          </Pressable>
        </View>
        <View style={styles.emptyState}>
          <MaterialIcons
            name="folder-open"
            size={48}
            color={theme.colors.text.tertiary}
          />
          <ThemedText style={styles.emptyStateText}>
            No assets yet
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <>
      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            Assets ({documents.length})
          </ThemedText>
          <Pressable
            style={styles.viewAllButton}
            onPress={handleViewAllPress}
            accessible={true}
            accessibilityLabel={isEditMode ? "Edit assets" : "View all assets"}
            accessibilityRole="button"
          >
            <ThemedText style={styles.viewAllButtonText}>
              {isEditMode ? "Edit" : "View All"}
            </ThemedText>
            <MaterialIcons
              name="chevron-right"
              size={16}
              color={theme.colors.interactive.primary}
            />
          </Pressable>
        </View>

        {/* Asset Category Tabs */}
        {availableAssetCategories.length > 0 && (
          <SegmentedControl
            variant="tabs"
            options={availableAssetCategories as readonly AssetCategoryValue[]}
            selected={selectedAssetCategory || availableAssetCategories[0]}
            onSelect={setSelectedAssetCategory}
            showCounts={true}
            getCounts={(category) => assetCounts[category as AssetCategoryValue]}
            getLabel={(category) =>
              getAssetCategoryLabel(category as AssetCategoryValue)
            }
            ariaLabel="Filter assets by category"
          />
        )}

        {/* Asset Thumbnails */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.assetThumbnails}
        >
          {filteredDocuments.slice(0, 4).map((doc) => (
            <AssetThumbnail
              key={doc.id}
              document={doc}
              onPress={() => handleAssetPress(doc)}
            />
          ))}
          {filteredDocuments.length > 4 && (
            <Pressable
              style={styles.moreAssetsButton}
              onPress={() => router.push(`/project/${projectId}/documents`)}
              accessible={true}
              accessibilityLabel={`View ${filteredDocuments.length - 4} more assets`}
              accessibilityRole="button"
            >
              <ThemedText style={styles.moreAssetsText}>
                +{filteredDocuments.length - 4} more
              </ThemedText>
            </Pressable>
          )}
        </ScrollView>
      </ThemedView>

      {/* Asset Image Gallery Modal */}
      {assetGalleryVisible && assetGalleryImages.length > 0 && (
        <ImageGalleryModal
          visible={assetGalleryVisible}
          images={assetGalleryImages}
          initialIndex={Math.max(
            0,
            Math.min(selectedAssetIndex, assetGalleryImages.length - 1)
          )}
          onClose={() => {
            setAssetGalleryVisible(false);
          }}
        />
      )}
    </>
  );
};
