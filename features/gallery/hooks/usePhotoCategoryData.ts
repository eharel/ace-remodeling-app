import { useMemo } from "react";
import { convertMediaToPictures } from "@/features/gallery/utils/assetTypeConversion";
import {
  getPhotoCounts,
  getPreviewPhotos,
  samplePreviewPhotos,
} from "@/shared/utils";
import type { PhotoCategory } from "@/shared/constants";
import { matchesPhotoCategory } from "@/shared/constants";
import type { MediaAsset } from "@/shared/types";

interface UsePhotoCategoryDataParams {
  media: MediaAsset[];
  activePhotoCategory: PhotoCategory;
  previewCount?: number;
}

/**
 * Hook for managing photo category filtering, counting, and preview logic
 * Handles category-based filtering, photo counts, and preview generation
 */
export function usePhotoCategoryData({
  media,
  activePhotoCategory,
  previewCount = 3,
}: UsePhotoCategoryDataParams) {
  // Calculate photo counts for each category
  const photoCounts = useMemo(() => {
    return getPhotoCounts(media);
  }, [media]);

  // Get preview photos based on active category
  const previewPhotos = useMemo(() => {
    if (media.length === 0) return [];

    if (activePhotoCategory === "all") {
      // Use intelligent sampling for "All Photos" category
      return samplePreviewPhotos(media, previewCount);
    } else {
      // Filter by specific stage and take first N
      const filtered = media.filter((m) =>
        matchesPhotoCategory(m, activePhotoCategory),
      );
      return getPreviewPhotos(filtered, previewCount);
    }
  }, [media, activePhotoCategory, previewCount]);

  // Check if there are more photos beyond the preview
  const hasMorePhotos = useMemo(() => {
    const totalCount = photoCounts[activePhotoCategory];
    return totalCount > previewPhotos.length;
  }, [photoCounts, activePhotoCategory, previewPhotos.length]);

  // Calculate remaining photo count
  const remainingCount = useMemo(() => {
    return photoCounts[activePhotoCategory] - previewPhotos.length;
  }, [photoCounts, activePhotoCategory, previewPhotos.length]);

  // Get filtered images for gallery based on active category
  const galleryImages = useMemo(() => {
    if (media.length === 0) {
      return [];
    }

    let filteredMedia: typeof media;
    if (activePhotoCategory === "all") {
      filteredMedia = media.filter((m) => m.mediaType === "image");
    } else {
      filteredMedia = media.filter((m) =>
        matchesPhotoCategory(m, activePhotoCategory),
      );
    }

    // Convert MediaAsset to Picture format
    return convertMediaToPictures(filteredMedia);
  }, [media, activePhotoCategory]);

  return {
    photoCounts,
    previewPhotos,
    hasMorePhotos,
    remainingCount,
    galleryImages,
  };
}
