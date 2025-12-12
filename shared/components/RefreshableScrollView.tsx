import React, { useEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, ScrollViewProps } from "react-native";

import { useProjects, useTheme } from "@/shared/contexts";

// Minimum duration for refresh animation to feel smooth (in milliseconds)
const MIN_REFRESH_DURATION = 500;

/**
 * RefreshableScrollView - ScrollView with pull-to-refresh capability
 *
 * Wraps React Native's ScrollView component with RefreshControl integration.
 * Automatically connects to ProjectsContext to refresh project data.
 * Includes smooth animation by ensuring minimum refresh duration.
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshStartTime = useRef<number | null>(null);

  // Handle smooth refresh animation
  useEffect(() => {
    if (loading) {
      // Refresh started - record start time
      if (!refreshStartTime.current) {
        refreshStartTime.current = Date.now();
        setIsRefreshing(true);
      }
    } else {
      // Refresh completed - wait for minimum duration before hiding spinner
      if (refreshStartTime.current) {
        const elapsed = Date.now() - refreshStartTime.current;
        const remaining = Math.max(0, MIN_REFRESH_DURATION - elapsed);

        const timeoutId = setTimeout(() => {
          setIsRefreshing(false);
          refreshStartTime.current = null;
        }, remaining);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [loading]);

  const handleRefresh = async () => {
    refreshStartTime.current = Date.now();
    setIsRefreshing(true);
    await refetchProjects();
  };

  return (
    <ScrollView
      {...scrollViewProps}
      nestedScrollEnabled={true}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.text.secondary}
          colors={[theme.colors.text.secondary]} // Android
        />
      }
    >
      {children}
    </ScrollView>
  );
}
