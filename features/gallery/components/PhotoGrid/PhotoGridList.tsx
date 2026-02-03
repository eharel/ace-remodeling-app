import { DesignTokens } from "@/shared/themes";
import { useResponsiveGrid } from "@/shared/hooks/useResponsiveGrid";
import { MediaAsset } from "@/shared/types/MediaAsset";
import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { PhotoThumbnail } from "../PhotoThumbnail";

interface PhotoGridListProps {
  photos: MediaAsset[];
  onImagePress?: (index: number) => void;
  isEditing?: boolean;
  isSelectingPhotos?: boolean;
  selectedIds: Set<string>;
  onToggleSelection: (photoId: string) => void;
}

/**
 * PhotoGridList - Renders a scrollable grid of photo thumbnails
 *
 * TODO: This component is currently a stub and needs full implementation.
 * Should include:
 * - Grid layout with configurable columns
 * - Image thumbnails with press handlers
 * - Loading states and placeholders
 */
const GRID_GAP = DesignTokens.spacing[1]; // 4px gap between photos

export function PhotoGridList({
  photos,
  onImagePress,
  isEditing = false,
  isSelectingPhotos = false,
  selectedIds = new Set(),
  onToggleSelection,
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
      }),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: MediaAsset; index: number }) => {
      const isSelected = selectedIds.has(item.id);

      return (
        <View style={styles.itemContainer}>
          <PhotoThumbnail
            photoId={item.id}
            uri={item.url}
            size={calculatedItemSize - GRID_GAP}
            inSelectionMode={isSelectingPhotos}
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
      isSelectingPhotos,
      selectedIds,
      onToggleSelection,
      styles.itemContainer,
    ]
  );

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
