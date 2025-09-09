import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

interface ChecklistItemProps {
  text: string;
  isChecked?: boolean;
  onPress?: () => void;
}

export function ChecklistItem({
  text,
  isChecked = false,
  onPress,
}: ChecklistItemProps) {
  const { getThemeColor } = useTheme();

  return (
    <View style={styles.checklistItem}>
      <MaterialIcons
        name={isChecked ? "check-box" : "check-box-outline-blank"}
        size={24}
        color={
          isChecked
            ? getThemeColor("interactive.primary")
            : getThemeColor("text.tertiary")
        }
      />
      <Text
        style={[
          styles.checklistText,
          {
            color: getThemeColor("text.primary"),
            textDecorationLine: isChecked ? "line-through" : "none",
            opacity: isChecked ? 0.6 : 1,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  checklistText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});
