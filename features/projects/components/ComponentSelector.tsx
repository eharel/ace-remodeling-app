import React, { useRef, useEffect } from "react";
import {
  ScrollView,
  Pressable,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { ProjectComponent } from "@/core/types";
import { DesignTokens } from "@/core/themes";

interface ComponentSelectorProps {
  components: ProjectComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (componentId: string) => void;
  getComponentLabel: (component: ProjectComponent) => string;
}

export function ComponentSelector({
  components,
  selectedComponentId,
  onSelectComponent,
  getComponentLabel,
}: ComponentSelectorProps) {
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSelect = (componentId: string) => {
    if (componentId === selectedComponentId) return;

    // Haptic feedback on iOS
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onSelectComponent(componentId);
  };

  // Auto-scroll to selected component when it changes
  useEffect(() => {
    if (!selectedComponentId || !scrollViewRef.current) return;

    const selectedIndex = components.findIndex(
      (c) => c.id === selectedComponentId
    );
    if (selectedIndex === -1) return;

    // Scroll to selected component (with some offset for padding)
    scrollViewRef.current.scrollTo({
      x: selectedIndex * 120, // Approximate width per pill + gap
      animated: true,
    });
  }, [selectedComponentId, components]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {components.map((component) => {
          const isSelected = component.id === selectedComponentId;
          const label = getComponentLabel(component);

          return (
            <Pressable
              key={component.id}
              onPress={() => handleSelect(component.id)}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected
                    ? theme.colors.interactive.primary
                    : "transparent",
                  borderColor: theme.colors.interactive.primary,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${label} component`}
              accessibilityState={{ selected: isSelected }}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  {
                    color: isSelected
                      ? "#FFFFFF"
                      : theme.colors.interactive.primary,
                  },
                ]}
              >
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: DesignTokens.spacing[3],
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[3],
  },
  pill: {
    paddingVertical: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[6],
    borderRadius: DesignTokens.borderRadius.full,
    borderWidth: DesignTokens.borderWidth.thin,
    minHeight: 44, // Minimum touch target for accessibility
  },
  pillText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontFamily: DesignTokens.typography.fontFamily.medium,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    lineHeight: DesignTokens.typography.fontSize.base * DesignTokens.typography.lineHeight.tight,
  },
});

