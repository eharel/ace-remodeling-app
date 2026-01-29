import { useProject } from "@/features/projects/hooks/useProject";
import {
  ModalBackdrop,
  ThemedIconButton,
  ThemedText,
  ThemedView,
} from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { MediaAsset } from "@/shared/types";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import PhotoGridList from "./ImageGallery/PhotoGridList";

const MODAL_WIDTH_PERCENT = 0.9;
const MODAL_HEIGHT_PERCENT = 0.84;
const MIN_PHOTO_SIZE = 150;
const MIN_COLUMNS = 1;

interface PhotoGridProps {
  visible: boolean;
  onClose: () => void;
  onImagePress: (index: number) => void;
}

export default function PhotoGrid({
  visible,
  onClose,
  onImagePress,
}: PhotoGridProps) {
  console.log("In PhotoGrid, visible:", visible);

  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const { id: projectId } = useLocalSearchParams<{ id?: string }>();

  const { project, isLoading, error } = useProject(projectId);

  const photos = project?.sharedMedia || [];

  // Calculate how wide modal content will be
  const modalWidth = width * MODAL_WIDTH_PERCENT;
  const modalHeight = height * MODAL_HEIGHT_PERCENT;
  const contentWidth = modalWidth - DesignTokens.spacing[4] * 2;

  // Calculate columns based on minimum photo size
  const calculatedColumns = Math.floor(contentWidth / MIN_PHOTO_SIZE);

  const numColumns = Math.max(MIN_COLUMNS, calculatedColumns);

  const listRef = useRef<FlatList<MediaAsset>>(null);

  useEffect(() => {
    if (visible) {
      listRef.current?.flashScrollIndicators();
    }
  }, [visible]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        modalContent: {
          width: modalWidth,
          height: modalHeight,
          borderRadius: DesignTokens.borderRadius.xl,
          borderWidth: 1,
          backgroundColor: theme.colors.background.card,
          justifyContent: "flex-start", // Force everything to start at the top
          overflow: "hidden",
        },
        // Ensure the list is allowed to expand
        content: {
          padding: DesignTokens.spacing[4],
          paddingBottom: DesignTokens.spacing[12], // This creates the "intentional gap" at the end
          // flexGrow: 1, <--- REMOVE THIS if it's there; it can cause the "scrolling into space" issue
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: DesignTokens.spacing[4],
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.secondary,
        },
        title: {
          fontSize: DesignTokens.typography.fontSize["2xl"],
          fontWeight: DesignTokens.typography.fontWeight.semibold,
        },
        gridItem: {
          flex: 1,
          aspectRatio: 1,
          margin: DesignTokens.spacing[1],
          borderRadius: DesignTokens.borderRadius.md,
          overflow: "hidden",
          backgroundColor: theme.colors.background.secondary,
        },
        gridImage: {
          width: "100%",
          height: "100%",
        },
        emptyContainer: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: DesignTokens.spacing[20],
        },
      }),

    [theme, modalWidth, modalHeight],
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* We use a View here only to group the Header and List */}
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            All Photos ({photos.length})
          </ThemedText>
          <ThemedIconButton
            icon="close"
            onPress={onClose}
            variant="ghost"
            size="small"
          />
        </View>

        <PhotoGridList photos={photos} />

        {/* Content - Grid will go here */}
        {/* <FlatList
          key={numColumns} // Crucial for layout changes
          data={photos}
          ref={listRef}
          numColumns={numColumns}
          keyExtractor={(item, index) => item.id || `photo-${index}`}
          renderItem={renderPhoto}
          initialNumToRender={12} // Optimization for perceived speed
          maxToRenderPerBatch={10}
          windowSize={5}
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={{ color: theme.colors.text.secondary }}>
                No photos found in this gallery.
              </ThemedText>
            </View>
          }
        /> */}
      </View>
    </ThemedView>
  );
}
