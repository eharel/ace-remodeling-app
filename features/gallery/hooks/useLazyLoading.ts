import { Picture } from "@/core/types";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  calculateLoadingDelay,
  createLoadingStats,
  getKeepIndices,
  getLoadIndices,
  getVisibleIndices,
  LAZY_LOADING_CONSTANTS,
} from "../utils/lazyLoading";

interface UseLazyLoadingProps {
  images: Picture[];
  currentIndex: number;
  visibleRange?: number; // How many images to render around current index
  loadThreshold?: number; // Distance from current index to start loading
}

interface LazyLoadState {
  loadedIndices: Set<number>;
  loadingIndices: Set<number>;
  visibleIndices: Set<number>;
}

/**
 * useLazyLoading - Custom hook for lazy loading images in the gallery
 *
 * This hook optimizes rendering performance by only mounting images within
 * a visible range around the current index. It manages loading states and
 * cleanup automatically.
 *
 * Features:
 * - Only renders images within a configurable visible range
 * - Staggered loading to avoid performance spikes
 * - Automatic cleanup of unused images
 * - Loading state management
 * - Memory optimization for large galleries
 *
 * @param {UseLazyLoadingProps} params - The hook parameters
 * @param {Picture[]} params.images - Array of images to lazy load
 * @param {number} params.currentIndex - Current image index
 * @param {number} [params.visibleRange=3] - Number of images to render around current index
 * @param {number} [params.loadThreshold=2] - Distance from current index to start loading
 *
 * @returns {Object} Object containing lazy loading utilities
 * @returns {(index: number) => boolean} returns.shouldRenderImage - Check if image should be rendered
 * @returns {(index: number) => boolean} returns.isImageLoaded - Check if image is loaded
 * @returns {(index: number) => boolean} returns.isImageLoading - Check if image is loading
 * @returns {() => Object} returns.getLoadingStats - Get loading statistics
 * @returns {LazyLoadState} returns.lazyState - Current lazy loading state
 *
 * @example
 * ```tsx
 * const { shouldRenderImage, isImageLoaded } = useLazyLoading({
 *   images: projectImages,
 *   currentIndex: 5,
 *   visibleRange: 5,
 *   loadThreshold: 3
 * });
 *
 * // Only render images that should be visible
 * {shouldRenderImage(index) && (
 *   <Image source={{ uri: images[index].url }} />
 * )}
 * ```
 */
export const useLazyLoading = ({
  images,
  currentIndex,
  visibleRange = LAZY_LOADING_CONSTANTS.DEFAULT_VISIBLE_RANGE,
  loadThreshold = LAZY_LOADING_CONSTANTS.DEFAULT_LOAD_THRESHOLD,
}: UseLazyLoadingProps) => {
  const [lazyState, setLazyState] = useState<LazyLoadState>({
    loadedIndices: new Set(),
    loadingIndices: new Set(),
    visibleIndices: new Set(),
  });

  const loadTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Get indices that should be visible (rendered) using utility function
  const getVisibleIndicesCallback = useCallback(() => {
    return getVisibleIndices(currentIndex, images.length, visibleRange);
  }, [currentIndex, images.length, visibleRange]);

  // Get indices that should be loaded using utility function
  const getLoadIndicesCallback = useCallback(() => {
    return getLoadIndices(currentIndex, images.length, loadThreshold);
  }, [currentIndex, images.length, loadThreshold]);

  // Mark image as loaded
  const markImageLoaded = useCallback((index: number) => {
    setLazyState((prev) => ({
      ...prev,
      loadedIndices: new Set([...prev.loadedIndices, index]),
      loadingIndices: new Set(
        [...prev.loadingIndices].filter((i) => i !== index)
      ),
    }));
  }, []);

  // Mark image as loading
  const markImageLoading = useCallback((index: number) => {
    setLazyState((prev) => ({
      ...prev,
      loadingIndices: new Set([...prev.loadingIndices, index]),
    }));
  }, []);

  // Load image with delay to avoid overwhelming the system
  const loadImage = useCallback(
    (index: number, delay: number = 0) => {
      if (
        lazyState.loadedIndices.has(index) ||
        lazyState.loadingIndices.has(index)
      ) {
        return;
      }

      const timeout = setTimeout(() => {
        markImageLoading(index);

        // Simulate image loading - in real implementation, this would trigger actual loading
        setTimeout(() => {
          markImageLoaded(index);
        }, LAZY_LOADING_CONSTANTS.SIMULATED_LOAD_TIME);

        loadTimeouts.current.delete(index);
      }, delay);

      loadTimeouts.current.set(index, timeout);
    },
    [lazyState, markImageLoading, markImageLoaded]
  );

  // Update visible indices using utility function
  useEffect(() => {
    const visibleIndices = getVisibleIndicesCallback();
    setLazyState((prev) => ({
      ...prev,
      visibleIndices: new Set(visibleIndices),
    }));
  }, [getVisibleIndicesCallback]);

  // Load images based on current position using utility functions
  useEffect(() => {
    const loadIndices = getLoadIndicesCallback();

    // Load images with staggered delays to avoid performance spikes
    loadIndices.forEach((index, i) => {
      const delay = calculateLoadingDelay(i);
      loadImage(index, delay);
    });
  }, [getLoadIndicesCallback, loadImage]);

  // Cleanup unused images using utility function
  useEffect(() => {
    const keepIndices = getKeepIndices(
      currentIndex,
      images.length,
      visibleRange,
      loadThreshold
    );

    // Cancel loading for images that are no longer needed
    loadTimeouts.current.forEach((timeout, index) => {
      if (!keepIndices.has(index)) {
        clearTimeout(timeout);
        loadTimeouts.current.delete(index);
      }
    });

    // Remove from state
    setLazyState((prev) => ({
      ...prev,
      loadedIndices: new Set(
        [...prev.loadedIndices].filter((i) => keepIndices.has(i))
      ),
      loadingIndices: new Set(
        [...prev.loadingIndices].filter((i) => keepIndices.has(i))
      ),
    }));
  }, [currentIndex, images.length, visibleRange, loadThreshold]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      loadTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      loadTimeouts.current.clear();
    };
  }, []);

  // Check if image should be rendered
  const shouldRenderImage = useCallback(
    (index: number) => {
      return lazyState.visibleIndices.has(index);
    },
    [lazyState.visibleIndices]
  );

  // Check if image is loaded
  const isImageLoaded = useCallback(
    (index: number) => {
      return lazyState.loadedIndices.has(index);
    },
    [lazyState.loadedIndices]
  );

  // Check if image is loading
  const isImageLoading = useCallback(
    (index: number) => {
      return lazyState.loadingIndices.has(index);
    },
    [lazyState.loadingIndices]
  );

  // Get loading statistics using utility function
  const getLoadingStats = useCallback(() => {
    return createLoadingStats(
      lazyState.loadedIndices,
      lazyState.loadingIndices,
      lazyState.visibleIndices,
      images.length
    );
  }, [lazyState, images.length]);

  return {
    shouldRenderImage,
    isImageLoaded,
    isImageLoading,
    getLoadingStats,
    lazyState,
  };
};
