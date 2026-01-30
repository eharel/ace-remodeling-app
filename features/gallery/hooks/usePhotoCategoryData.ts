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

  // Get filtered photos (MediaAsset[]) based on active category
  const filteredPhotos = useMemo(() => {
    if (media.length === 0) {
      return [];
    }

    if (activePhotoCategory === "all") {
      return media.filter((m) => m.mediaType === "image");
    } else {
      return media.filter((m) =>
        matchesPhotoCategory(m, activePhotoCategory),
      );
    }
  }, [media, activePhotoCategory]);

  // Get filtered images for gallery (converted to Picture format)
  const galleryImages = useMemo(() => {
    return convertMediaToPictures(filteredPhotos);
  }, [filteredPhotos]);

  return {
    photoCounts,
    previewPhotos,
    hasMorePhotos,
    remainingCount,
    filteredPhotos,
    galleryImages,
  };
}
