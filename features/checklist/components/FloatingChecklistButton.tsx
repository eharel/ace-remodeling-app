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

  // Calculate state for badge
  const isComplete = progress.completed === progress.total;
  const hasProgress = progress.completed > 0;

  // Badge content: checkmark if complete, otherwise count
  const badgeContent = isComplete ? "✓" : progress.completed.toString();

  // Badge background color: green if progress, gray with opacity if none
  const badgeBackgroundColor = hasProgress
    ? theme.colors.status.success
    : `${theme.colors.text.secondary}80`; // 50% opacity (80 in hex)

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

        {/* Badge - Always visible with color-coded background */}
        <View style={[styles.badge, { backgroundColor: badgeBackgroundColor }]}>
          <ThemedText style={styles.badgeText}>
            {badgeContent}
          </ThemedText>
        </View>
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
    top: -4, // -4px offset
    right: -4, // -4px offset
    minWidth: 24, // Minimum 24px (perfect circle for single digits)
    height: 24, // Fixed height
    borderRadius: 12, // Half of height for perfect circle
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    paddingHorizontal: 6, // Allows width to grow for 2-digit numbers
    ...DesignTokens.shadows.sm,
  },
  badgeText: {
    color: "#FFFFFF", // White text on colored background
    fontSize: 12, // Smaller, crisp text
    fontWeight: "700", // Bold
    lineHeight: 12, // Match fontSize for perfect vertical centering
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
