import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const [isTextTruncated, setIsTextTruncated] = useState(false);
  const fullTextLinesRef = useRef<number | null>(null);
  const limitedTextLinesRef = useRef<number | null>(null);

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
        measureText: {
          position: "absolute",
          opacity: 0,
          zIndex: -1,
          width: "100%",
          pointerEvents: "none",
        },
      }),
    [theme]
  );

  const value = editableTextProps.value || "";

  // Measure full text (unlimited) to get actual line count
  const handleFullTextLayout = useCallback((event: any) => {
    const lines = event.nativeEvent.lines || [];
    fullTextLinesRef.current = lines.length;
    checkTruncation();
  }, []);

  // Measure limited text (with numberOfLines) to see if it matches full text
  const handleLimitedTextLayout = useCallback((event: any) => {
    const lines = event.nativeEvent.lines || [];
    limitedTextLinesRef.current = lines.length;
    checkTruncation();
  }, []);

  // Check if text is actually truncated by comparing line counts
  const checkTruncation = useCallback(() => {
    if (
      fullTextLinesRef.current !== null &&
      limitedTextLinesRef.current !== null
    ) {
      // Text is truncated if full text has more lines than the limited version
      // Also check if limited text shows exactly previewLines (might be truncated)
      const isTruncated =
        fullTextLinesRef.current > limitedTextLinesRef.current ||
        (limitedTextLinesRef.current === previewLines &&
          fullTextLinesRef.current > previewLines);
      setIsTextTruncated(isTruncated);
    } else if (fullTextLinesRef.current !== null) {
      // If we only have full text measurement, check if it exceeds previewLines
      setIsTextTruncated(fullTextLinesRef.current > previewLines);
    }
  }, [previewLines]);

  // Reset measurements when value changes
  useEffect(() => {
    fullTextLinesRef.current = null;
    limitedTextLinesRef.current = null;
    setIsTextTruncated(false);
  }, [value]);

  // Show button when:
  // - Not expanded AND text is truncated (show "Show more")
  // - Expanded AND we know text was truncated (show "Show less")
  const shouldShowExpand =
    !editableTextProps.editable &&
    value.length > 0 &&
    (isExpanded
      ? fullTextLinesRef.current !== null &&
        fullTextLinesRef.current > previewLines
      : isTextTruncated);

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
      {/* Measure full text to detect truncation (both when expanded and not expanded) */}
      {/* Use same variant as EditableText (body) and match styling */}
      {!editableTextProps.editable && value.length > 0 && (
        <ThemedText
          variant="body"
          numberOfLines={0}
          onTextLayout={handleFullTextLayout}
          style={[
            styles.measureText,
            {
              fontSize: DesignTokens.typography.fontSize.base,
              lineHeight:
                DesignTokens.typography.fontSize.base *
                DesignTokens.typography.lineHeight.normal,
              fontFamily: DesignTokens.typography.fontFamily.regular,
            },
          ]}
        >
          {value}
        </ThemedText>
      )}
      <EditableText
        {...textAreaProps}
        onTextLayout={shouldLimitLines ? handleLimitedTextLayout : undefined}
      />
      {shouldShowExpand && (
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
