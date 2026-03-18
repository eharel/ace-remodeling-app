import { DesignTokens } from "@/shared/themes";
import { useResponsiveGrid } from "@/shared/hooks/useResponsiveGrid";
import { MediaAsset } from "@/shared/types/MediaAsset";
import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Sortable from "react-native-sortables";
import { PhotoThumbnail } from "../PhotoThumbnail";

interface PhotoGridListProps {
  photos: MediaAsset[];
  onImagePress?: (index: number) => void;
  /** When true, tapping a photo selects it instead of opening it */
  isEditing?: boolean;
  selectedIds: Set<string>;
  onToggleSelection: (photoId: string) => void;
  /** Callback when photos are reordered (only called in edit mode) */
  onReorder?: (reorderedPhotos: MediaAsset[]) => void;
}

/**
 * PhotoGridList - Renders a scrollable grid of photo thumbnails
 *
 * Features:
 * - Responsive grid layout based on screen size
 * - Selection mode for batch operations
 * - Drag-to-reorder in edit mode (long press to drag)
 *
 * Uses Sortable.Grid for both view and edit modes to avoid
 * the delay from switching between FlatList and Sortable.Grid.
 * Drag is only enabled in edit mode via sortEnabled prop.
 */
const GRID_GAP = DesignTokens.spacing[1]; // 4px gap between photos

export function PhotoGridList({
  photos,
  onImagePress,
  isEditing = false,
  selectedIds = new Set(),
  onToggleSelection,
  onReorder,
}: PhotoGridListProps) {
  const { columns, screenWidth } = useResponsiveGrid("photos");

  // Calculate item size accounting for gaps and padding
  const calculatedItemSize = useMemo(() => {
    const totalGaps = (columns - 1) * GRID_GAP;
    const containerPadding = GRID_GAP * 2; // Padding on both sides
    return (screenWidth - totalGaps - containerPadding) / columns;
  }, [columns, screenWidth]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        itemContainer: {
          padding: GRID_GAP / 2,
        },
        sortableContainer: {
          flex: 1,
          padding: GRID_GAP,
        },
      }),
    []
  );

  // Handle reorder completion
  const handleDragEnd = useCallback(
    ({ data }: { data: MediaAsset[] }) => {
      if (onReorder) {
        onReorder(data);
      }
    },
    [onReorder]
  );

  // Render item for the grid
  const renderItem = useCallback(
    ({ item, index }: { item: MediaAsset; index: number }) => {
      const isSelected = selectedIds.has(item.id);

      return (
        <View style={styles.itemContainer}>
          <PhotoThumbnail
            photoId={item.id}
            uri={item.url}
            size={calculatedItemSize - GRID_GAP}
            inSelectionMode={isEditing}
            isSelected={isSelected}
            onPress={() => onImagePress?.(index)}
            onSelect={onToggleSelection}
            mediaType={item.mediaType}
          />
        </View>
      );
    },
    [
      calculatedItemSize,
      onImagePress,
      isEditing,
      selectedIds,
      onToggleSelection,
      styles.itemContainer,
    ]
  );

  // Always use Sortable.Grid, but only enable sorting in edit mode
  // This avoids the delay from switching components
  return (
    <Sortable.Grid
      data={photos}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      columns={columns}
      rowGap={GRID_GAP}
      columnGap={GRID_GAP}
      onDragEnd={handleDragEnd}
      contentContainerStyle={styles.sortableContainer}
      showsVerticalScrollIndicator={false}
      hapticsEnabled={isEditing}
      sortEnabled={isEditing}
    />
  );
}

export default PhotoGridList;
