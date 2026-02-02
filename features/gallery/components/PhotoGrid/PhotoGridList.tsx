import { useResponsiveGrid } from "@/shared/hooks/useResponsiveGrid";
import { MediaAsset } from "@/shared/types/MediaAsset";
import { useCallback } from "react";
import { FlatList } from "react-native";
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
export function PhotoGridList({
  photos,
  onImagePress,
  isEditing = false,
  isSelectingPhotos = false,
  selectedIds = new Set(),
  onToggleSelection,
}: PhotoGridListProps) {
  const { columns, itemSize } = useResponsiveGrid("photos");

  const renderItem = useCallback(
    ({ item, index }: { item: MediaAsset; index: number }) => {
      const isSelected = selectedIds.has(item.id);

      return (
        <PhotoThumbnail
          photoId={item.id}
          uri={item.url} // Using the URL from your MediaAssetSchema
          size={itemSize} // Using the calculated size from our hook
          inSelectionMode={isSelectingPhotos}
          isSelected={isSelected}
          onPress={() => onImagePress?.(index)}
          onSelect={onToggleSelection}
        />
      );
    },
    [itemSize, onImagePress, isSelectingPhotos, selectedIds, onToggleSelection]
  );

  return (
    <>
      <FlatList
        numColumns={columns}
        data={photos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        extraData={[selectedIds, isEditing]}
      />
    </>
  );
}

export default PhotoGridList;
