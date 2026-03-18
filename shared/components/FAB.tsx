import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";

interface FABProps {
  /** Icon name from MaterialIcons */
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Callback when FAB is pressed */
  onPress: () => void;
  /** Accessibility label */
  accessibilityLabel: string;
  /** Optional custom style */
  style?: ViewStyle;
  /** Size variant */
  size?: "small" | "medium" | "large";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Floating Action Button (FAB)
 *
 * A prominent button that floats above the UI, typically used for
 * the primary action on a screen (e.g., "Create New").
 *
 * Position it absolutely in the bottom-right corner of your screen.
 */
export function FAB({
  icon = "add",
  onPress,
  accessibilityLabel,
  style,
  size = "medium",
}: FABProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const sizes = {
    small: { container: 48, icon: 24 },
    medium: { container: 56, icon: 28 },
    large: { container: 64, icon: 32 },
  };

  const currentSize = sizes[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        fab: {
          width: currentSize.container,
          height: currentSize.container,
          borderRadius: currentSize.container / 2,
          backgroundColor: theme.colors.interactive.primary,
          alignItems: "center",
          justifyContent: "center",
          ...DesignTokens.shadows.lg,
        },
      }),
    [theme, currentSize]
  );

  return (
    <AnimatedPressable
      style={[styles.fab, animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <MaterialIcons
        name={icon}
        size={currentSize.icon}
        color={theme.colors.text.inverse}
      />
    </AnimatedPressable>
  );
}
