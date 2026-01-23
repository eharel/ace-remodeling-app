import { TouchableOpacity, StyleSheet } from "react-native";
import { DesignTokens } from "@/shared/themes";
import { useMemo } from "react";
import { useTheme } from "@/shared/contexts";

export interface ModalBackdropProps {
  onPress: () => void;
  children: React.ReactNode;
}

export function ModalBackdrop({ onPress, children }: ModalBackdropProps) {

    const { theme } = useTheme();
    
    const styles = useMemo(() => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
    }), [theme]);
    
  return (
    <TouchableOpacity
      style={styles.backdrop}
      activeOpacity={1}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Close modal"
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={(e) => e.stopPropagation()}
      >
        {children}
      </TouchableOpacity>
    </TouchableOpacity>
  );
  
}

