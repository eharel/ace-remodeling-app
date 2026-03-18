import { StyleSheet, Pressable, View } from "react-native";
import { useMemo } from "react";
import { useTheme } from "@/shared/contexts";

export interface ModalBackdropProps {
  onPress: () => void;
  children: React.ReactNode;
}

export function ModalBackdrop({ onPress, children }: ModalBackdropProps) {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        backdrop: {
          flex: 1,
          backgroundColor: theme.colors.background.overlay,
          justifyContent: "center",
          alignItems: "center",
        },
        // This container prevents the tap from bubbling up to the backdrop
        contentWrapper: {
          // It's important NOT to use a Touchable here
        },
      }),
    [theme],
  );

  return (
    <Pressable style={styles.backdrop} onPress={onPress}>
      {/* We use a Pressable with no onPress here to catch taps 
          so they don't hit the 'backdrop' Pressable, 
          but it won't block the FlatList's scrolling.
      */}
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={styles.contentWrapper}
      >
        {children}
      </Pressable>
    </Pressable>
  );
}
