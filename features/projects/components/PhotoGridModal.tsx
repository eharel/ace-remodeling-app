import {
  Modal,
  View,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from "react-native";
import {
  ModalBackdrop,
  ThemedIconButton,
  ThemedText,
} from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { useCallback, useMemo } from "react";
import { MediaAsset } from "@/shared/types";
import { Image } from "expo-image";

const MODAL_WIDTH_PERCENT = 0.9;
const MODAL_HEIGHT_PERCENT = 0.8;
const MIN_PHOTO_SIZE = 150;
const MIN_COLUMNS = 1;

interface PhotoGridModalProps {
  visible: boolean;
  onClose: () => void;
  photos: MediaAsset[];
}

export function PhotoGridModal({
  visible,
  onClose,
  photos,
}: PhotoGridModalProps) {
  const { theme } = useTheme();
  const { width, height } = useWindowDimensions();

  // Calculate how wide modal content will be
  const modalWidth = width * MODAL_WIDTH_PERCENT;
  const modalHeight = height * MODAL_HEIGHT_PERCENT;
  const contentWidth = modalWidth - DesignTokens.spacing[4] * 2;

  // Calculate columns based on minimum photo size
  const calculatedColumns = Math.floor(contentWidth / MIN_PHOTO_SIZE);

  const numColumns = Math.max(MIN_COLUMNS, calculatedColumns);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        modalContent: {
          width: modalWidth,
          height: modalHeight,
          borderRadius: DesignTokens.borderRadius.xl,
          borderWidth: 1,
          overflow: "hidden",
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
        content: {
          padding: DesignTokens.spacing[4],
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

  const renderPhoto = useCallback(
    ({ item }: { item: MediaAsset }) => (
      <View style={styles.gridItem}>
        <Image
          source={{ uri: item.url }}
          style={styles.gridImage}
          contentFit="cover"
          transition={200} // Smooth fade-in
        />
      </View>
    ),
    [styles],
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <ModalBackdrop onPress={onClose}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.background.card,
              borderColor: theme.colors.border.primary,
            },
          ]}
        >
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

          {/* Content - Grid will go here */}
          <FlatList
            key={numColumns} // Crucial for layout changes
            data={photos}
            numColumns={numColumns}
            keyExtractor={(item, index) => item.id || `photo-${index}`}
            renderItem={renderPhoto}
            initialNumToRender={12} // Optimization for perceived speed
            maxToRenderPerBatch={10}
            windowSize={5}
            contentContainerStyle={styles.content}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={{ color: theme.colors.text.secondary }}>
                  No photos found in this gallery.
                </ThemedText>
              </View>
            }
          />
        </View>
      </ModalBackdrop>
    </Modal>
  );
}
