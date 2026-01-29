import { ThemedText } from "@/shared/components/themed/ThemedText";
import { MediaAsset } from "@/shared/types/MediaAsset";
import { useCallback } from "react";
import { FlatList, Text, View } from "react-native";

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
  const renderPhoto = useCallback(
    ({ item, index }: { item: MediaAsset; index: number }) => {
      return (
        <View>
          <ThemedText>{item.id}</ThemedText>
        </View>
      );
    },
    []
  );

  return (
    <>
      <Text>Photo Grid List</Text>
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
      />
    </>
  );
}

export default PhotoGridList;
