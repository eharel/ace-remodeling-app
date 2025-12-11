import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedIconButton, ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { InheritanceIndicator } from "./InheritanceIndicator";

/**
 * Props for EditableText component
 */
export interface EditableTextProps {
  /** Current value to display/edit */
  value: string;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Callback when value is saved */
  onSave: (newValue: string) => Promise<void>;
  /** Display variant for typography */
  variant?: "title" | "subtitle" | "body" | "caption";
  /** Number of lines to show in view mode (truncates if exceeded) */
  numberOfLines?: number;
  /** Whether editing is allowed */
  editable?: boolean;
  /** Whether text input should be multiline */
  multiline?: boolean;
  /** Maximum character length */
  maxLength?: number;
  /** Whether this value is inherited from project */
  isInherited?: boolean;
  /** Source of inherited value (e.g., "Project 187") */
  inheritedFrom?: string;
  /** Whether field is required */
  required?: boolean;
  /** Validation function - returns error message or null */
  validate?: (value: string) => string | null;
  /** Test ID for testing */
  testID?: string;
}

/**
 * EditableText - Inline text editing component
 *
 * Switches between view and edit modes. In view mode, displays text with
 * optional edit indicator. In edit mode, shows TextInput with save/cancel.
 *
 * @component
 */
export function EditableText({
  value,
  placeholder,
  onSave,
  variant = "body",
  numberOfLines,
  editable = false,
  multiline = false,
  maxLength,
  isInherited = false,
  inheritedFrom,
  required = false,
  validate,
  testID = "editable-text",
}: EditableTextProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Update editValue when value prop changes (but not while editing)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditing && editable) {
      // Small delay to ensure keyboard appears smoothly
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isEditing, editable]);

  const typographyStyles = useMemo(() => {
    const styles = {
      title: {
        fontSize: DesignTokens.typography.fontSize["2xl"],
        fontWeight: DesignTokens.typography.fontWeight.bold,
        lineHeight:
          DesignTokens.typography.fontSize["2xl"] *
          DesignTokens.typography.lineHeight.tight,
      },
      subtitle: {
        fontSize: DesignTokens.typography.fontSize.xl,
        fontWeight: DesignTokens.typography.fontWeight.semibold,
        lineHeight:
          DesignTokens.typography.fontSize.xl *
          DesignTokens.typography.lineHeight.normal,
      },
      body: {
        fontSize: DesignTokens.typography.fontSize.base,
        fontWeight: DesignTokens.typography.fontWeight.normal,
        lineHeight:
          DesignTokens.typography.fontSize.base *
          DesignTokens.typography.lineHeight.normal,
      },
      caption: {
        fontSize: DesignTokens.typography.fontSize.sm,
        fontWeight: DesignTokens.typography.fontWeight.normal,
        lineHeight:
          DesignTokens.typography.fontSize.sm *
          DesignTokens.typography.lineHeight.normal,
      },
    };
    return styles[variant];
  }, [variant]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: "100%",
        },
        viewContainer: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: DesignTokens.spacing[2],
          width: "100%",
          flexWrap: "wrap", // Allow content to wrap if needed
        },
        textContainer: {
          flex: 1,
          minWidth: 0, // Allow text to wrap properly
        },
        text: {
          ...typographyStyles,
          color: theme.colors.text.primary,
          // Ensure text is always visible
          opacity: 1,
        },
        textEmpty: {
          color: theme.colors.text.tertiary,
          fontStyle: "italic",
        },
        editButton: {
          opacity: 0.6,
          marginTop: 2,
        },
        editContainer: {
          gap: DesignTokens.spacing[2],
        },
        inputContainer: {
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          gap: DesignTokens.spacing[2],
        },
        input: {
          flex: 1,
          ...typographyStyles,
          borderWidth: 1,
          borderRadius: DesignTokens.borderRadius.md,
          paddingHorizontal: DesignTokens.spacing[3],
          paddingVertical: DesignTokens.spacing[2],
          backgroundColor: theme.colors.background.secondary,
          borderColor: error
            ? theme.colors.status.error
            : theme.colors.border.primary,
          color: theme.colors.text.primary,
          fontFamily: DesignTokens.typography.fontFamily.regular,
        },
        inputMultiline: {
          minHeight: 80,
          textAlignVertical: "top",
        },
        actions: {
          flexDirection: "row",
          gap: DesignTokens.spacing[2],
          alignItems: "center",
        },
        errorText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.status.error,
          marginTop: DesignTokens.spacing[1],
        },
        charCount: {
          fontSize: DesignTokens.typography.fontSize.xs,
          color: theme.colors.text.tertiary,
          textAlign: "right",
          marginTop: DesignTokens.spacing[1],
        },
      }),
    [theme, typographyStyles, multiline, error]
  );

  const handleStartEdit = useCallback(() => {
    if (editable) {
      setEditValue(value);
      setError(null);
      setIsEditing(true);
    }
  }, [editable, value]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
    Keyboard.dismiss();
  }, [value]);

  const handleSave = useCallback(async () => {
    // Validation
    if (required && !editValue.trim()) {
      setError("This field is required");
      return;
    }

    if (validate) {
      const validationError = validate(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // If value hasn't changed, just cancel
    if (editValue === value) {
      setIsEditing(false);
      Keyboard.dismiss();
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editValue.trim());
      setIsEditing(false);
      Keyboard.dismiss();
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to save changes";
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [editValue, value, required, validate, onSave]);

  const displayValue = value || placeholder || "";
  const isEmpty = !value && !placeholder;

  // View mode
  if (!isEditing) {
    return (
      <View style={styles.container} testID={testID}>
        <Pressable
          style={styles.viewContainer}
          onPress={handleStartEdit}
          disabled={!editable}
          accessibilityRole={editable ? "button" : "text"}
          accessibilityLabel={
            editable
              ? `Edit ${variant} text${isEmpty ? ", currently empty" : ""}`
              : displayValue || "Empty"
          }
          accessibilityHint={editable ? "Tap to edit" : undefined}
        >
          <View style={styles.textContainer}>
            {isInherited && inheritedFrom && editable && (
              <View style={{ marginBottom: DesignTokens.spacing[2] }}>
                <InheritanceIndicator source={inheritedFrom} />
              </View>
            )}
            <ThemedText
              style={[styles.text, isEmpty && styles.textEmpty]}
              numberOfLines={numberOfLines}
              ellipsizeMode="tail"
              allowFontScaling={true}
            >
              {displayValue}
            </ThemedText>
          </View>
          {editable && (
            <ThemedIconButton
              icon="edit"
              variant="ghost"
              size="small"
              onPress={handleStartEdit}
              style={styles.editButton}
              accessibilityLabel="Edit"
            />
          )}
        </Pressable>
      </View>
    );
  }

  // Edit mode
  return (
    <View style={styles.container} testID={`${testID}-editing`}>
      <View style={styles.editContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[styles.input, multiline && styles.inputMultiline]}
            value={editValue}
            onChangeText={setEditValue}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.tertiary}
            multiline={multiline}
            maxLength={maxLength}
            editable={!isSaving}
            autoFocus={true}
            accessibilityLabel={`Edit ${variant} text`}
          />
          <View style={styles.actions}>
            <ThemedIconButton
              icon={isSaving ? "hourglass-empty" : "check"}
              variant="primary"
              size="small"
              onPress={handleSave}
              disabled={isSaving}
              accessibilityLabel={isSaving ? "Saving..." : "Save changes"}
            />
            <ThemedIconButton
              icon="close"
              variant="ghost"
              size="small"
              onPress={handleCancel}
              disabled={isSaving}
              accessibilityLabel="Cancel editing"
            />
          </View>
        </View>
        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
        {maxLength && (
          <ThemedText style={styles.charCount}>
            {editValue.length} / {maxLength}
          </ThemedText>
        )}
      </View>
    </View>
  );
}
