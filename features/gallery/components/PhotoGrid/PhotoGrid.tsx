import { useProject } from "@/features/projects/hooks/useProject";
import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { PhotoGridList } from "./PhotoGridList";

interface PhotoGridProps {
  onImagePress: (index: number) => void;
}

export function PhotoGrid({ onImagePress }: PhotoGridProps) {
  const { theme } = useTheme();
  const { id: projectId, componentId } = useLocalSearchParams<{
    id?: string;
    componentId?: string;
  }>();

  const { project } = useProject(projectId);

  const photos =
    project?.components.find((c) => c.id === componentId)?.media || [];

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
    [theme],
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            All Photos ({photos.length})
          </ThemedText>
        </View>

        <PhotoGridList photos={photos} onImagePress={onImagePress} />
      </View>
    </ThemedView>
  );
}

export default PhotoGrid;
