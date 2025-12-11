import * as Haptics from "expo-haptics";
import { useCallback, useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

import { DesignTokens } from "@/core/themes";
import { MediaAsset, MediaStage } from "@/core/types";
import { useTheme } from "@/shared/contexts";
import { useMediaMutations } from "@/shared/hooks";
import { AddPhotoCard } from "./AddPhotoCard";
import { PhotoCard } from "./PhotoCard";

/**
 * Props for DraggablePhotoGrid component
 */
export interface DraggablePhotoGridProps {
  /** Photos to display */
  photos: MediaAsset[];
  /** Project ID */
  projectId: string;
  /** Component ID */
  componentId: string;
  /** Whether edit mode is enabled */
  editable?: boolean;
  /** Callback when photo is pressed */
  onPhotoPress?: (photo: MediaAsset, index: number) => void;
  /** Number of columns in the grid */
  columns?: number;
  /** Spacing between items */
  spacing?: number;
  /** Whether to show add photo button */
  showAddButton?: boolean;
  /** Media stage for add button */
  stage?: MediaStage;
  /** Test ID for testing */
  testID?: string;
}

/**
 * DraggablePhotoGrid - Photo grid with drag-and-drop reordering
 *
 * Displays photos in a grid layout with support for drag-and-drop reordering
 * when editable mode is enabled. Includes optional add photo button.
 *
 * @component
 */
export function DraggablePhotoGrid({
  photos,
  projectId,
  componentId,
  editable = false,
  onPhotoPress,
  columns = 3,
  spacing,
  showAddButton = false,
  stage,
  testID = "draggable-photo-grid",
}: DraggablePhotoGridProps) {
  const { theme } = useTheme();
  const { reorderMedia } = useMediaMutations();
  const { width } = useWindowDimensions();

  const itemSpacing = spacing ?? DesignTokens.spacing[3];
  const itemWidth = useMemo(() => {
    const totalSpacing = itemSpacing * (columns - 1);
    const padding = DesignTokens.spacing[6] * 2; // Horizontal padding
    return (width - totalSpacing - padding) / columns;
  }, [width, columns, itemSpacing]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        listContent: {
          paddingHorizontal: DesignTokens.spacing[6],
          paddingBottom: DesignTokens.spacing[5],
        },
        itemContainer: {
          width: itemWidth,
          marginRight: itemSpacing,
          marginBottom: itemSpacing,
        },
        itemContainerLastInRow: {
          marginRight: 0,
        },
      }),
    [itemWidth, itemSpacing]
  );

  const handleDragEnd = useCallback(
    async ({ data }: { data: MediaAsset[] }) => {
      // Provide haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Reorder in Firestore (handles optimistic update)
      try {
        await reorderMedia(projectId, componentId, data);
      } catch (error) {
        console.error("Failed to reorder photos:", error);
        // Error is handled by useMediaMutations hook
      }
    },
    [projectId, componentId, reorderMedia]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<MediaAsset>) => {
      const index = getIndex() ?? 0;
      const isLastInRow = (index + 1) % columns === 0;
      const itemIndex = index;

      return (
        <ScaleDecorator>
          <View
            style={[
              styles.itemContainer,
              isLastInRow && styles.itemContainerLastInRow,
            ]}
          >
            <PhotoCard
              photo={item}
              projectId={projectId}
              componentId={componentId}
              onPress={() => onPhotoPress?.(item, itemIndex)}
              editable={editable}
              testID={`${testID}-item-${itemIndex}`}
            />
            {editable && (
              <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                {/* Invisible drag area - user can drag from anywhere on the card */}
                <View
                  style={{ flex: 1 }}
                  onTouchStart={() => {
                    if (editable && !isActive) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      drag();
                    }
                  }}
                />
              </View>
            )}
          </View>
        </ScaleDecorator>
      );
    },
    [projectId, componentId, onPhotoPress, editable, columns, styles, testID]
  );

  // Add photo button as last item if enabled
  const dataWithAddButton = useMemo(() => {
    if (showAddButton && stage) {
      return [...photos, null as any]; // Add null placeholder for add button
    }
    return photos;
  }, [photos, showAddButton, stage]);

  const renderItemWithAddButton = useCallback(
    ({
      item,
      drag,
      isActive,
      getIndex,
    }: RenderItemParams<MediaAsset | null>) => {
      const index = getIndex() ?? 0;
      // Render add button as last item
      if (item === null && showAddButton && stage) {
        const isLastInRow = (index + 1) % columns === 0;
        return (
          <View
            style={[
              styles.itemContainer,
              isLastInRow && styles.itemContainerLastInRow,
            ]}
          >
            <AddPhotoCard
              projectId={projectId}
              componentId={componentId}
              stage={stage}
              size="medium"
            />
          </View>
        );
      }

      // Render photo item
      return renderItem({
        item: item as MediaAsset,
        drag,
        isActive,
        getIndex: () => index,
      } as RenderItemParams<MediaAsset>);
    },
    [showAddButton, stage, columns, styles, projectId, componentId, renderItem]
  );

  const keyExtractor = useCallback((item: MediaAsset | null, index: number) => {
    if (item === null) {
      return "add-photo-button";
    }
    return item.id || `photo-${index}`;
  }, []);

  if (!editable) {
    // Non-editable mode: simple grid layout
    return (
      <View style={styles.container} testID={testID}>
        <View
          style={[
            styles.listContent,
            {
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -itemSpacing / 2,
            },
          ]}
        >
          {photos.map((photo, index) => {
            const isLastInRow = (index + 1) % columns === 0;
            return (
              <View
                key={photo.id || `photo-${index}`}
                style={[
                  styles.itemContainer,
                  isLastInRow && styles.itemContainerLastInRow,
                ]}
              >
                <PhotoCard
                  photo={photo}
                  projectId={projectId}
                  componentId={componentId}
                  onPress={() => onPhotoPress?.(photo, index)}
                  editable={false}
                  testID={`${testID}-item-${index}`}
                />
              </View>
            );
          })}
          {showAddButton && stage && (
            <View style={styles.itemContainer}>
              <AddPhotoCard
                projectId={projectId}
                componentId={componentId}
                stage={stage}
                size="medium"
              />
            </View>
          )}
        </View>
      </View>
    );
  }

  // Editable mode: draggable list
  return (
    <DraggableFlatList
      data={showAddButton ? dataWithAddButton : photos}
      onDragEnd={handleDragEnd}
      keyExtractor={keyExtractor}
      renderItem={showAddButton ? renderItemWithAddButton : renderItem}
      numColumns={columns}
      contentContainerStyle={styles.listContent}
      scrollEnabled={true}
      testID={testID}
    />
  );
}
