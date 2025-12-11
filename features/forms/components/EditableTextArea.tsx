import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { EditableText, EditableTextProps } from "./EditableText";

/**
 * Props for EditableTextArea component
 */
export interface EditableTextAreaProps
  extends Omit<EditableTextProps, "variant" | "numberOfLines"> {
  /** Minimum height of text area in edit mode */
  minHeight?: number;
  /** Maximum height of text area in edit mode */
  maxHeight?: number;
  /** Show character count */
  showCharCount?: boolean;
  /** Number of lines to show in view mode before "Show more" */
  previewLines?: number;
}

/**
 * EditableTextArea - Multi-line text editing component
 *
 * Optimized for longer content like descriptions and notes.
 * Supports expandable preview in view mode and character counting.
 *
 * @component
 */
export function EditableTextArea({
  minHeight = 120,
  maxHeight = 300,
  showCharCount = false,
  previewLines = 3,
  ...editableTextProps
}: EditableTextAreaProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: "100%",
        },
        expandButton: {
          marginTop: DesignTokens.spacing[2],
        },
        expandButtonText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.interactive.primary,
        },
      }),
    [theme]
  );

  const value = editableTextProps.value || "";
  const hasMoreContent =
    value.split("\n").length > previewLines || value.length > 200;
  const shouldShowExpand = hasMoreContent && !editableTextProps.editable;

  // Override multiline to true for text area
  // Only set numberOfLines if we have content and it's not expanded
  const shouldLimitLines = !isExpanded && value.length > 0;
  const textAreaProps: EditableTextProps = {
    ...editableTextProps,
    multiline: true,
    numberOfLines: shouldLimitLines ? previewLines : undefined,
  };

  return (
    <View style={styles.container}>
      <EditableText {...textAreaProps} />
      {shouldShowExpand && !editableTextProps.editable && (
        <ThemedText
          style={styles.expandButtonText}
          onPress={() => setIsExpanded(!isExpanded)}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? "Show less" : "Show more"}
        >
          {isExpanded ? "Show less" : "Show more"}
        </ThemedText>
      )}
    </View>
  );
}
