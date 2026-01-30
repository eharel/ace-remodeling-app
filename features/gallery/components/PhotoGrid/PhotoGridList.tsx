import { ThemedText } from "@/shared/components/themed/ThemedText";
import { useResponsiveGrid } from "@/shared/hooks/useResponsiveGrid";
import { MediaAsset } from "@/shared/types/MediaAsset";
import { useCallback } from "react";
import { FlatList, Text, View } from "react-native";
import { PhotoThumbnail } from "../PhotoThumbnail";

interface PhotoGridListProps {
  photos: MediaAsset[];
  onImagePress?: (index: number) => void;
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
export function PhotoGridList({ photos, onImagePress }: PhotoGridListProps) {
  const { columns, itemSize } = useResponsiveGrid("photos");

  const renderItem = useCallback(
    ({ item, index }: { item: MediaAsset; index: number }) => (
      <PhotoThumbnail
        uri={item.url} // Using the URL from your MediaAssetSchema
        size={itemSize} // Using the calculated size from our hook
        onPress={() => onImagePress?.(index)}
      />
    ),
    [itemSize, onImagePress],
  );

  return (
    <>
      <FlatList
        numColumns={columns}
        data={photos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </>
  );
}

export default PhotoGridList;
