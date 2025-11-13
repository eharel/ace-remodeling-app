import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { ChecklistProvider, useChecklistContext } from "../contexts/ChecklistContext";
import { ChecklistModal } from "./ChecklistModal";

/**
 * Internal FAB component that uses the checklist context
 */
function FloatingChecklistButtonInternal() {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Use the context for progress tracking
  const { getTotalProgress } = useChecklistContext();
  const progress = getTotalProgress();

  // Calculate uncompleted items count for accessibility
  const uncompletedCount = useMemo(() => {
    return progress.total - progress.completed;
  }, [progress]);

  // Modal control functions with useCallback for performance
  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);

  // Dynamic styles based on theme
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        fab: {
          backgroundColor: theme.colors.interactive.primary,
          shadowColor: theme.colors.text.primary,
        },
        badge: {
          backgroundColor: theme.colors.status.error,
        },
        badgeText: {
          color: theme.colors.text.inverse, // Theme-aware white/inverse color
        },
      }),
    [theme]
  );

  return (
    <>
      {/* FAB Container with Badge */}
      <View style={styles.fabContainer}>
        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, dynamicStyles.fab]}
          onPress={openModal}
          activeOpacity={DesignTokens.interactions.activeOpacity}
          accessibilityRole="button"
          accessibilityLabel={`Meeting checklist, ${uncompletedCount} item${uncompletedCount !== 1 ? "s" : ""} remaining`}
          accessibilityHint="Opens a modal with meeting checklist items"
          accessibilityState={{ expanded: modalVisible }}
        >
          <MaterialIcons
            name="checklist"
            size={DesignTokens.components.fab.iconSize}
            color={theme.colors.text.inverse}
            accessibilityElementsHidden={true}
          />
        </TouchableOpacity>

        {/* Badge - Show completed item count when there are any completed items */}
        {progress.completed > 0 && (
          <View style={[styles.badge, dynamicStyles.badge]}>
            <ThemedText style={[styles.badgeText, dynamicStyles.badgeText]}>
              {progress.completed}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Checklist Modal */}
      <ChecklistModal visible={modalVisible} onClose={closeModal} />
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 100, // Position above tab bar
    right: DesignTokens.spacing[5], // 20px from right
    zIndex: 1000,
  },
  fab: {
    width: DesignTokens.components.fab.size,
    height: DesignTokens.components.fab.size,
    borderRadius: DesignTokens.components.fab.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  badge: {
    position: "absolute",
    top: -DesignTokens.spacing[1], // -4px offset
    right: -DesignTokens.spacing[1], // -4px offset
    minWidth: DesignTokens.spacing[5], // 20px
    height: DesignTokens.spacing[5], // 20px
    borderRadius: DesignTokens.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: DesignTokens.spacing[2], // 8px - allows width to grow for 2-digit numbers
    ...DesignTokens.shadows.sm,
  },
  badgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: DesignTokens.typography.fontFamily.bold,
    textAlign: "center",
  },
});

/**
 * Floating Action Button component for the meeting checklist (with provider)
 * Wraps the internal component with ChecklistProvider to ensure state persistence
 * State persists when modal closes/opens - only resets on explicit reset action
 */
export function FloatingChecklistButton() {
  return (
    <ChecklistProvider>
      <FloatingChecklistButtonInternal />
    </ChecklistProvider>
  );
}
