import React, { memo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image"; // Better performance than standard Image

interface PhotoThumbnailProps {
  uri: string;
  size: number;
  onPress: () => void;
}

// Using memo to prevent unnecessary re-renders during scrolls
export const PhotoThumbnail = memo(function PhotoThumbnail({
  uri,
  size,
  onPress,
}: PhotoThumbnailProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { width: size, height: size, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Image
        source={{ uri }}
        style={styles.image}
        contentFit="cover"
        transition={200} // Smooth fade-in
        cachePolicy="memory-disk"
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  image: {
    flex: 1,
    backgroundColor: "#222", // Placeholder color
  },
});
