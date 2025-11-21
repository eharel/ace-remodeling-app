import React from "react";
import {
  RefreshControl,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
} from "react-native";

import { useProjects, useTheme } from "@/shared/contexts";

/**
 * RefreshableScrollView - ScrollView with pull-to-refresh capability
 *
 * Wraps React Native's ScrollView component with RefreshControl integration.
 * Automatically connects to ProjectsContext to refresh project data.
 *
 * @component
 * @param {ScrollViewProps} props - All standard ScrollView props are passed through
 *
 * @example
 * ```tsx
 * <RefreshableScrollView
 *   contentContainerStyle={styles.content}
 *   showsVerticalScrollIndicator={false}
 * >
 *   <YourContent />
 * </RefreshableScrollView>
 * ```
 */
export function RefreshableScrollView({
  children,
  ...scrollViewProps
}: ScrollViewProps) {
  const { theme } = useTheme();
  const { refetchProjects, loading } = useProjects();

  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refetchProjects}
          tintColor={theme.colors.text.secondary}
          colors={[theme.colors.text.secondary]} // Android
        />
      }
    >
      {children}
    </ScrollView>
  );
}

