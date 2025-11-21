import { Picture } from "@/core/types";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createPreloadStats,
  createPreloadTimeout,
  getImagesToKeep,
  getPreloadIndices,
  PRELOADING_CONSTANTS,
  shouldPreloadImage,
} from "../utils/imagePreloading";

interface UseImagePreloadingProps {
  images: Picture[];
  currentIndex: number;
  preloadRadius?: number; // How many images to preload on each side
}

interface PreloadState {
  loaded: Set<string>;
  loading: Set<string>;
  failed: Set<string>;
}

/**
 * useImagePreloading - Custom hook for preloading adjacent images
 *
 * This hook preloads images around the current index to improve perceived
 * loading times when users navigate through the gallery. It manages preload
 * state and cleanup automatically.
 *
 * Features:
 * - Preloads images within a configurable radius of current index
 * - Tracks preload state (loaded, loading, failed)
 * - Automatic cleanup of unused preloaded images
 * - Timeout handling for failed preloads
 * - Memory management with proper cleanup
 *
 * @param {UseImagePreloadingProps} params - The hook parameters
 * @param {Picture[]} params.images - Array of images to preload
 * @param {number} params.currentIndex - Current image index
 * @param {number} [params.preloadRadius=2] - Number of images to preload on each side
 *
 * @returns {Object} Object containing preload utilities
 * @returns {(imageId: string) => boolean} returns.isPreloaded - Check if image is preloaded
 * @returns {(imageId: string) => boolean} returns.isPreloadFailed - Check if image failed to preload
 * @returns {() => Object} returns.getPreloadStats - Get preload statistics
 * @returns {PreloadState} returns.preloadState - Current preload state
 *
 * @example
 * ```tsx
 * const { isPreloaded, getPreloadStats } = useImagePreloading({
 *   images: projectImages,
 *   currentIndex: 2,
 *   preloadRadius: 3
 * });
 *
 * // Check if image is preloaded for faster display
 * const shouldShowTransition = isPreloaded(image.id);
 * ```
 */
export const useImagePreloading = ({
  images,
  currentIndex,
  preloadRadius = PRELOADING_CONSTANTS.DEFAULT_PRELOAD_RADIUS,
}: UseImagePreloadingProps) => {
  const [preloadState, setPreloadState] = useState<PreloadState>({
    loaded: new Set(),
    loading: new Set(),
    failed: new Set(),
  });

  const preloadTimeouts = useRef<Map<string, number>>(new Map());

  // Get images that should be preloaded using utility function
  const getPreloadIndicesCallback = useCallback(() => {
    return getPreloadIndices(currentIndex, images.length, preloadRadius);
  }, [currentIndex, images.length, preloadRadius]);

  // Preload a single image using utility functions
  const preloadImage = useCallback(
    async (image: Picture) => {
      if (
        !shouldPreloadImage(
          image.id,
          preloadState.loaded,
          preloadState.loading,
          preloadState.failed
        )
      ) {
        return;
      }

      setPreloadState((prev) => ({
        ...prev,
        loading: new Set([...prev.loading, image.id]),
      }));

      // Set timeout for preload using utility function
      const timeout = createPreloadTimeout(
        image.id,
        PRELOADING_CONSTANTS.PRELOAD_TIMEOUT,
        () => {
          setPreloadState((prev) => ({
            ...prev,
            failed: new Set([...prev.failed, image.id]),
            loading: new Set([...prev.loading].filter((id) => id !== image.id)),
          }));
        }
      );

      preloadTimeouts.current.set(image.id, timeout);

      try {
        // Use expo-image's prefetch method for React Native
        await Image.prefetch(image.uri);

        // Clear timeout on success
        clearTimeout(timeout);
        preloadTimeouts.current.delete(image.id);

        setPreloadState((prev) => ({
          ...prev,
          loaded: new Set([...prev.loaded, image.id]),
          loading: new Set([...prev.loading].filter((id) => id !== image.id)),
        }));
      } catch {
        // Clear timeout on error
        clearTimeout(timeout);
        preloadTimeouts.current.delete(image.id);

        setPreloadState((prev) => ({
          ...prev,
          failed: new Set([...prev.failed, image.id]),
          loading: new Set([...prev.loading].filter((id) => id !== image.id)),
        }));
      }
    },
    [preloadState]
  );

  // Preload images based on current index using utility function
  useEffect(() => {
    const indicesToPreload = getPreloadIndicesCallback();

    indicesToPreload.forEach((index) => {
      const image = images[index];
      if (image) {
        preloadImage(image);
      }
    });
  }, [currentIndex, images, getPreloadIndicesCallback, preloadImage]);

  // Cleanup unused images using utility function
  useEffect(() => {
    const currentIndices = getPreloadIndicesCallback();
    if (!currentIndices || currentIndices.length === 0) {
      return;
    }

    const imagesToKeep = getImagesToKeep(images, currentIndices);

    // Clean up images that are no longer needed
    preloadTimeouts.current.forEach((timeout, imageId) => {
      if (!imagesToKeep.has(imageId)) {
        // Clear timeout
        clearTimeout(timeout);
        preloadTimeouts.current.delete(imageId);

        // Update state
        setPreloadState((prev) => ({
          ...prev,
          loaded: new Set([...prev.loaded].filter((id) => id !== imageId)),
          loading: new Set([...prev.loading].filter((id) => id !== imageId)),
          failed: new Set([...prev.failed].filter((id) => id !== imageId)),
        }));
      }
    });
  }, [currentIndex, images, getPreloadIndicesCallback]);

  // Cleanup on unmount
  useEffect(() => {
    const timeouts = preloadTimeouts.current;
    return () => {
      // Clear all timeouts
      timeouts.forEach((timeout) => clearTimeout(timeout));
      timeouts.clear();
    };
  }, []);

  // Check if image is preloaded
  const isPreloaded = useCallback(
    (imageId: string) => {
      return preloadState.loaded.has(imageId);
    },
    [preloadState.loaded]
  );

  // Check if image failed to preload
  const isPreloadFailed = useCallback(
    (imageId: string) => {
      return preloadState.failed.has(imageId);
    },
    [preloadState.failed]
  );

  // Get preload statistics using utility function
  const getPreloadStats = useCallback(() => {
    return createPreloadStats(
      preloadState.loaded,
      preloadState.loading,
      preloadState.failed,
      images.length
    );
  }, [preloadState, images.length]);

  return {
    isPreloaded,
    isPreloadFailed,
    getPreloadStats,
    preloadState,
  };
};
