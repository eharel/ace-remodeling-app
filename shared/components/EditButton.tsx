import { useAuth } from "@/shared/contexts/AuthContext";
import {
  ThemedIconButton,
  ThemedIconButtonProps,
} from "./themed/ThemedIconButton";

interface EditButtonProps {
  onPress: () => void;
  label?: string;
  icon?: ThemedIconButtonProps["icon"];
  /** When true, shows a checkmark icon to indicate "done" state */
  isEditing?: boolean;
  resourceOwnerId?: string; // For future ownership-based permissions
}

export function EditButton({
  onPress,
  label = "Edit",
  icon = "edit",
  isEditing = false,
  resourceOwnerId,
}: EditButtonProps) {
  const { canEdit } = useAuth();

  // Hide button if user can't edit
  if (!canEdit(resourceOwnerId)) {
    return null;
  }

  const activeIcon = isEditing ? "check" : icon;
  const activeLabel = isEditing ? "Done editing" : `${label} section`;

  return (
    <ThemedIconButton
      icon={activeIcon}
      onPress={onPress}
      variant={isEditing ? "primary" : "ghost"}
      size="small"
      accessibilityLabel={activeLabel}
    />
  );
}
