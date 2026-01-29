import { useProject } from "@/features/projects/hooks/useProject";
import {
  ThemedIconButton,
  ThemedText,
  ThemedView,
} from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { MediaAsset } from "@/shared/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { PhotoGridList } from "./PhotoGridList";

const MODAL_WIDTH_PERCENT = 0.9;
const MODAL_HEIGHT_PERCENT = 0.84;
const MIN_PHOTO_SIZE = 150;
const MIN_COLUMNS = 1;

interface PhotoGridProps {
  visible: boolean;
  onClose: () => void;
  onImagePress: (index: number) => void;
}

export function PhotoGrid({
  visible,
  onClose,
  onImagePress,
}: PhotoGridProps) {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();
  const { id: projectId, componentId } = useLocalSearchParams<{
    id?: string;
    componentId?: string;
  }>();

  const { project } = useProject(projectId);

  const photos =
    project?.components.find((c) => c.id === componentId)?.media || [];

  // Calculate how wide modal content will be
  const modalWidth = width * MODAL_WIDTH_PERCENT;
  const modalHeight = height * MODAL_HEIGHT_PERCENT;

  const listRef = useRef<FlatList<MediaAsset>>(null);

  useEffect(() => {
    if (visible) {
      listRef.current?.flashScrollIndicators();
    }
  }, [visible]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
      }),
    [theme]
  );

  return (
    <ThemedView style={{ flex: 1 }}>
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

        <PhotoGridList photos={photos} onImagePress={onImagePress} />
      </View>
    </ThemedView>
  );
}

export default PhotoGrid;
