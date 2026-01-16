import { Modal, View, StyleSheet } from "react-native";
import { ModalBackdrop, ThemedIconButton, ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { useMemo } from "react";

interface PhotoGridModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PhotoGridModal({ visible, onClose }: PhotoGridModalProps) {
    const { theme } = useTheme();
    
const styles = useMemo(() => StyleSheet.create({
  modalContent: {
    width: "90%",  // Takes up most of screen width
    maxWidth: 800,  // But not too wide on large iPads
    maxHeight: "80%",  // Leaves space at top/bottom
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
    flex: 1,
    padding: DesignTokens.spacing[4],
  },
}), [theme]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <ModalBackdrop onPress={onClose}>
              <View
                  style={[
                      styles.modalContent, 
                      {
                          backgroundColor: theme.colors.background.card,
                          borderColor: theme.colors.border.primary,
                      }
                  ]
                      
                      
              }
              >
                            {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>All Photos</ThemedText>
            <ThemedIconButton
              icon="close"
              onPress={onClose}
              variant="ghost"
              size="small"
            />
          </View>

                    {/* Content - Grid will go here */}
          <View style={styles.content}>
            <ThemedText>Photo grid will go here!</ThemedText>
          </View>
        </View>
      </ModalBackdrop>
    </Modal>
  );
}
