import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { ThemedText } from "../themed/ThemedText";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

/**
 * Toast Component
 *
 * Displays a brief message at the bottom of the screen.
 * Auto-dismisses after the specified duration.
 */
export function Toast({
  visible,
  message,
  type = "info",
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const { theme } = useTheme();
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissing = useRef(false);

  useEffect(() => {
    if (visible) {
      dismissing.current = false;
      // Reset animation values before animating in (important for rapid toast changes)
      translateY.setValue(100);
      opacity.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        if (!dismissing.current) {
          handleDismiss();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, message, duration]); // Added message to deps to re-trigger for new toasts

  const handleDismiss = () => {
    if (dismissing.current) return;
    dismissing.current = true;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: theme.colors.status.success,
          icon: "check-circle" as const,
        };
      case "error":
        return {
          backgroundColor: theme.colors.status.error,
          icon: "error" as const,
        };
      case "warning":
        return {
          backgroundColor: theme.colors.status.warning,
          icon: "warning" as const,
        };
      case "info":
      default:
        return {
          backgroundColor: theme.colors.interactive.primary,
          icon: "info" as const,
        };
    }
  };

  const config = getTypeConfig();

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      bottom: DesignTokens.spacing[20],
      left: DesignTokens.spacing[4],
      right: DesignTokens.spacing[4],
      zIndex: 9999,
    },
    toast: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: config.backgroundColor,
      paddingVertical: DesignTokens.spacing[3],
      paddingHorizontal: DesignTokens.spacing[4],
      borderRadius: DesignTokens.borderRadius.lg,
      ...DesignTokens.shadows.lg,
    },
    icon: {
      marginRight: DesignTokens.spacing[3],
    },
    message: {
      flex: 1,
      color: theme.colors.text.inverse,
      fontSize: DesignTokens.typography.fontSize.sm,
      fontWeight: DesignTokens.typography.fontWeight.medium,
    },
    dismissButton: {
      marginLeft: DesignTokens.spacing[2],
      padding: DesignTokens.spacing[1],
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.toast}>
        <MaterialIcons
          name={config.icon}
          size={20}
          color={theme.colors.text.inverse}
          style={styles.icon}
        />
        <ThemedText style={styles.message}>{message}</ThemedText>
        <Pressable onPress={handleDismiss} style={styles.dismissButton}>
          <MaterialIcons
            name="close"
            size={18}
            color={theme.colors.text.inverse}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
}
