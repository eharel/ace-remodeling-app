import { ThemedText } from "@/shared/components/themed/ThemedText";
import { MediaAsset } from "@/shared/types/MediaAsset";
import { FlatList, Text, View } from "react-native";
import { useCallback } from "react";

interface PhotoGridListProps {
  photos: MediaAsset[];
}

export default function PhotoGridList({ photos }: PhotoGridListProps) {
  console.log("photos", photos);

  //   const renderPhoto = useCallback(
  //     ({ item, index }: { item: MediaAsset; index: number }) => (
  //       <Pressable
  //         style={styles.gridItem}
  //         onPress={() => {
  //           console.log("Photo pressed:", item.id);
  //           onImagePress(index);
  //         }}
  //       >
  //         <Image
  //           source={{ uri: item.url }}
  //           style={styles.gridImage}
  //           contentFit="cover"
  //           transition={200} // Smooth fade-in
  //         />
  //       </Pressable>
  //     ),
  //     [styles, onImagePress],
  //   );

  const renderPhoto = useCallback(({ item }: { item: MediaAsset }) => {
    return (
      <View>
        <ThemedText>{item.id}</ThemedText>
      </View>
    );
  }, []);

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
