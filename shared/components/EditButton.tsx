import { useAuth } from "@/shared/contexts/AuthContext";
import { ThemedButton } from "./themed/ThemedButton";

interface EditButtonProps {
  onPress: () => void;
  /** When true, shows "Done" state with success styling */
  isEditing?: boolean;
  resourceOwnerId?: string; // For future ownership-based permissions
}

/**
 * EditButton - A reusable edit/done toggle button
 *
 * Follows iOS conventions with text labels ("Edit" / "Done").
 * Automatically hides if user doesn't have edit permissions.
 *
 * Usage:
 * ```tsx
 * <EditButton
 *   onPress={() => setIsEditing(!isEditing)}
 *   isEditing={isEditing}
 * />
 * ```
 */
export function EditButton({
  onPress,
  isEditing = false,
  resourceOwnerId,
}: EditButtonProps) {
  const { canEdit } = useAuth();

  // Hide button if user can't edit
  if (!canEdit(resourceOwnerId)) {
    return null;
  }

  return (
    <ThemedButton
      onPress={onPress}
      variant={isEditing ? "success" : "secondary"}
      size="small"
      icon={isEditing ? "check" : "edit"}
      accessibilityLabel={isEditing ? "Done editing" : "Enter edit mode"}
    >
      {isEditing ? "Done" : "Edit"}
    </ThemedButton>
  );
}
