import { ImageGallery, PhotoCategory, usePhotoCategoryData } from "@/features/gallery";
import { useProject } from "@/features/projects/hooks/useProject";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

export default function PhotoViewer() {
  const {
    id: projectId,
    componentId,
    initialIndex,
    activePhotoCategory,
  } = useLocalSearchParams<{
    id: string;
    componentId: string;
    initialIndex?: string;
    activePhotoCategory?: PhotoCategory;
  }>();

  const { project } = useProject(projectId);

  // Get photos for the selected component
  const photos = useMemo(() => {
    if (!project) return [];
    return project.components.find((c) => c.id === componentId)?.media || [];
  }, [project, componentId]);

  // Use hook to filter by category and convert to Picture format
  const { galleryImages: pictures } = usePhotoCategoryData({
    media: photos,
    activePhotoCategory: activePhotoCategory || "all",
  });

  // Parse initialIndex from route params (defaults to 0)
  const initialImageIndex = useMemo(() => {
    if (!initialIndex) return 0;
    const parsed = parseInt(initialIndex, 10);
    return isNaN(parsed)
      ? 0
      : Math.max(0, Math.min(parsed, pictures.length - 1));
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
