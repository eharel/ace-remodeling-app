import { useMemo } from "react";
import { convertMediaToPictures } from "@/features/gallery/utils/assetTypeConversion";
import { getPhotoCounts, getPreviewPhotos, samplePreviewPhotos } from "@/shared/utils";
import type { PhotoTabValue } from "@/shared/constants";
import { getStageFromPhotoTab, matchesPhotoTab } from "@/shared/constants";
import type { MediaAsset } from "@/shared/types";

interface UsePhotoGalleryParams {
  media: MediaAsset[];
  activePhotoTab: PhotoTabValue;
  previewCount?: number;
}

/**
 * Hook for managing photo gallery filtering, counting, and preview logic
 * Handles tab-based filtering, photo counts, and preview generation
 */
export function usePhotoGallery({
  media,
  activePhotoTab,
  previewCount = 3,
}: UsePhotoGalleryParams) {
  // Calculate photo counts for each category
  const photoCounts = useMemo(() => {
    return getPhotoCounts(media);
  }, [media]);

  // Get preview photos based on active tab
  const previewPhotos = useMemo(() => {
    if (media.length === 0) return [];

    if (activePhotoTab === "all") {
      // Use intelligent sampling for "All Photos" tab
      return samplePreviewPhotos(media, previewCount);
    } else {
      // Filter by specific stage and take first N
      const filtered = media.filter((m) =>
        matchesPhotoTab(m, activePhotoTab)
      );
      return getPreviewPhotos(filtered, previewCount);
    }
  }, [media, activePhotoTab, previewCount]);

  // Check if there are more photos beyond the preview
  const hasMorePhotos = useMemo(() => {
    const totalCount = photoCounts[activePhotoTab];
    return totalCount > previewPhotos.length;
  }, [photoCounts, activePhotoTab, previewPhotos.length]);

  // Calculate remaining photo count
  const remainingCount = useMemo(() => {
    return photoCounts[activePhotoTab] - previewPhotos.length;
  }, [photoCounts, activePhotoTab, previewPhotos.length]);

  // Get filtered images for gallery based on active tab
  const galleryImages = useMemo(() => {
    if (media.length === 0) {
      return [];
    }

    let filteredMedia: typeof media;
    if (activePhotoTab === "all") {
      filteredMedia = media.filter((m) => m.mediaType === "image");
    } else {
      filteredMedia = media.filter((m) => matchesPhotoTab(m, activePhotoTab));
    }

    // Convert MediaAsset to Picture format
    return convertMediaToPictures(filteredMedia);
  }, [media, activePhotoTab]);

  return {
    photoCounts,
    previewPhotos,
    hasMorePhotos,
    remainingCount,
    galleryImages,
  };
}
