import { DesignTokens } from "@/shared/themes";
import { useResponsiveGrid } from "@/shared/hooks/useResponsiveGrid";
import { MediaAsset } from "@/shared/types/MediaAsset";
import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Sortable } from "react-native-sortables";
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
        container: {
          padding: GRID_GAP,
        },
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

  // Render item for sortable grid
  const renderSortableItem = useCallback(
    (item: MediaAsset) => {
      const isSelected = selectedIds.has(item.id);
      const index = photos.findIndex((p) => p.id === item.id);

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
      photos,
    ]
  );

  // Render item for regular FlatList (non-edit mode)
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

  // In edit mode, use sortable grid for drag-to-reorder
  if (isEditing && onReorder) {
    return (
      <Sortable.Grid
        data={photos}
        renderItem={renderSortableItem}
        keyExtractor={(item) => item.id}
        columns={columns}
        rowGap={GRID_GAP}
        columnGap={GRID_GAP}
        onDragEnd={handleDragEnd}
        contentContainerStyle={styles.sortableContainer}
        showsVerticalScrollIndicator={false}
        hapticsEnabled={true}
      />
    );
  }

  // In view mode, use regular FlatList (better performance)
  return (
    <FlatList
      key={`grid-${columns}`}
      numColumns={columns}
      data={photos}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      extraData={[selectedIds, isEditing]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={12}
      windowSize={5}
      initialNumToRender={12}
      getItemLayout={(_, index) => ({
        length: calculatedItemSize,
        offset: calculatedItemSize * Math.floor(index / columns),
        index,
      })}
    />
  );
}

export default PhotoGridList;
