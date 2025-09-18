import { Picture } from "@/types";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";

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
  preloadRadius = 2,
}: UseImagePreloadingProps) => {
  const [preloadState, setPreloadState] = useState<PreloadState>({
    loaded: new Set(),
    loading: new Set(),
    failed: new Set(),
  });

  const preloadTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Get images that should be preloaded
  const getPreloadIndices = useCallback(() => {
    if (!images || images.length === 0) {
      return [];
    }

    const indices = new Set<number>();

    for (let i = -preloadRadius; i <= preloadRadius; i++) {
      const index = currentIndex + i;
      if (index >= 0 && index < images.length) {
        indices.add(index);
      }
    }

    return Array.from(indices);
  }, [currentIndex, images, preloadRadius]);

  // Preload a single image
  const preloadImage = useCallback(
    async (image: Picture) => {
      if (
        preloadState.loaded.has(image.id) ||
        preloadState.loading.has(image.id) ||
        preloadState.failed.has(image.id)
      ) {
        return;
      }

      setPreloadState((prev) => ({
        ...prev,
        loading: new Set([...prev.loading, image.id]),
      }));

      // Set timeout for preload
      const timeout = setTimeout(() => {
        setPreloadState((prev) => ({
          ...prev,
          failed: new Set([...prev.failed, image.id]),
          loading: new Set([...prev.loading].filter((id) => id !== image.id)),
        }));
      }, 10000); // 10 second timeout

      preloadTimeouts.current.set(
        image.id,
        timeout as unknown as NodeJS.Timeout
      );

      try {
        // Use expo-image's prefetch method for React Native
        await Image.prefetch(image.url);

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

  // Preload images based on current index
  useEffect(() => {
    const indicesToPreload = getPreloadIndices();

    indicesToPreload.forEach((index) => {
      const image = images[index];
      if (image) {
        preloadImage(image);
      }
    });
  }, [currentIndex, images, getPreloadIndices, preloadImage]);

  // Cleanup unused images
  useEffect(() => {
    const currentIndices = getPreloadIndices();
    if (!currentIndices || currentIndices.length === 0) {
      return;
    }

    const imagesToKeep = new Set(
      currentIndices.map((index) => images[index]?.id).filter(Boolean)
    );

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
  }, [currentIndex, images, getPreloadIndices]);

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

  // Get preload statistics
  const getPreloadStats = useCallback(() => {
    return {
      loaded: preloadState.loaded.size,
      loading: preloadState.loading.size,
      failed: preloadState.failed.size,
      total: images.length,
    };
  }, [preloadState, images.length]);

  return {
    isPreloaded,
    isPreloadFailed,
    getPreloadStats,
    preloadState,
  };
};
