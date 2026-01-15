import { useAuth } from "@/shared/contexts/AuthContext";
import {
  ThemedIconButton,
  ThemedIconButtonProps,
} from "./themed/ThemedIconButton";

interface EditButtonProps {
  onPress: () => void;
  label?: string;
  icon?: ThemedIconButtonProps["icon"];
  resourceOwnerId?: string; // For future ownership-based permissions
}

export function EditButton({
  onPress,
  label = "Edit",
  icon = "edit",
  resourceOwnerId,
}: EditButtonProps) {
  const { canEdit } = useAuth();

  // Hide button if user can't edit
  if (!canEdit(resourceOwnerId)) {
    return null;
  }

  return (
    <ThemedIconButton
      icon={icon}
      onPress={onPress}
      variant="ghost"
      size="small"
      accessibilityLabel={`${label} section`}
    />
  );
}
