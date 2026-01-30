import { ImageGallery } from "@/features/gallery";
import { convertMediaToPictures } from "@/features/gallery/utils/assetTypeConversion";
import { useProject } from "@/features/projects/hooks/useProject";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

export default function PhotoViewer() {
  const { id: projectId, componentId, initialIndex } = useLocalSearchParams<{
    id: string;
    componentId: string;
    initialIndex?: string;
  }>();

  const { project } = useProject(projectId);

  // Get photos for the selected component
  const photos =
    project?.components.find((c) => c.id === componentId)?.media || [];

  // Convert MediaAsset[] to Picture[] format for ImageGalleryModal
  const pictures = useMemo(
    () => convertMediaToPictures(photos),
    [photos]
  );

  // Parse initialIndex from route params (defaults to 0)
  const initialImageIndex = useMemo(() => {
    if (!initialIndex) return 0;
    const parsed = parseInt(initialIndex, 10);
    return isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, pictures.length - 1));
  }, [initialIndex, pictures.length]);

  // Handle back navigation
  const handleClose = () => {
    router.back();
  };

  return (
    <ImageGallery
      images={pictures}
      initialIndex={initialImageIndex}
      onClose={handleClose}
    />
  );
}
