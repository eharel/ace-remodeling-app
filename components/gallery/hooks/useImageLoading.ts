import { Picture } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { ImageLoadingState, ImageState } from "../types/gallery.types";

interface UseImageLoadingProps {
  images: Picture[];
}

/**
 * useImageLoading - Custom hook for managing image loading states
 *
 * This hook tracks the loading, loaded, and error states for individual images
 * in the gallery. It provides utilities to check image states and handle
 * loading events.
 *
 * Features:
 * - Tracks loading states for individual images
 * - Preserves loaded states when images change
 * - Provides error handling and reporting
 * - Optimized for performance with Map-based state storage
 *
 * @param {UseImageLoadingProps} params - The hook parameters
 * @param {Picture[]} params.images - Array of image objects to track
 *
 * @returns {Object} Object containing loading state utilities
 * @returns {Map<string, ImageState>} returns.imageStates - Map of image states
 * @returns {(imageId: string) => void} returns.onImageLoad - Callback for successful image load
 * @returns {(imageId: string, error: string) => void} returns.onImageError - Callback for image load errors
 * @returns {(imageId: string) => ImageLoadingState} returns.getImageState - Get current state of an image
 * @returns {(imageId: string) => string | undefined} returns.getImageError - Get error message for an image
 * @returns {(imageId: string) => boolean} returns.isLoading - Check if image is loading
 * @returns {(imageId: string) => boolean} returns.hasError - Check if image has error
 * @returns {(imageId: string) => boolean} returns.isLoaded - Check if image is loaded
 *
 * @example
 * ```tsx
 * const { onImageLoad, onImageError, isLoading, hasError } = useImageLoading({
 *   images: projectImages
 * });
 *
 * // In your Image component
 * <Image
 *   source={{ uri: image.uri }}
 *   onLoad={() => onImageLoad(image.id)}
 *   onError={() => onImageError(image.id, "Failed to load")}
 * />
 * ```
 */
export const useImageLoading = ({ images }: UseImageLoadingProps) => {
  const [imageStates, setImageStates] = useState<Map<string, ImageState>>(
    new Map() // Start empty - only add states when needed
  );

  const onImageLoad = useCallback((imageId: string) => {
    setImageStates((prev) => {
      const newStates = new Map(prev);
      newStates.set(imageId, { id: imageId, state: "loaded" });
      return newStates;
    });
  }, []);

  const onImageError = useCallback((imageId: string, error: string) => {
    setImageStates((prev) => {
      const newStates = new Map(prev);
      newStates.set(imageId, { id: imageId, state: "error", error });
      return newStates;
    });
  }, []);

  const getImageState = useCallback(
    (imageId: string): ImageLoadingState => {
      return imageStates.get(imageId)?.state || "loaded"; // Default to loaded for fast images
    },
    [imageStates]
  );

  const getImageError = useCallback(
    (imageId: string): string | undefined => {
      return imageStates.get(imageId)?.error;
    },
    [imageStates]
  );

  const isLoading = useCallback(
    (imageId: string): boolean => {
      return getImageState(imageId) === "loading";
    },
    [getImageState]
  );

  const hasError = useCallback(
    (imageId: string): boolean => {
      return getImageState(imageId) === "error";
    },
    [getImageState]
  );

  const isLoaded = useCallback(
    (imageId: string): boolean => {
      return getImageState(imageId) === "loaded";
    },
    [getImageState]
  );

  // Reset states when images change, but preserve existing loaded states
  useEffect(() => {
    setImageStates((prev) => {
      const newStates = new Map();
      images.forEach((image) => {
        // Preserve existing state if image was already loaded
        const existingState = prev.get(image.id);
        if (existingState?.state === "loaded") {
          newStates.set(image.id, existingState);
        } else {
          newStates.set(image.id, {
            id: image.id,
            state: "loading" as ImageLoadingState,
          });
        }
      });
      return newStates;
    });
  }, [images]);

  return {
    imageStates,
    onImageLoad,
    onImageError,
    getImageState,
    getImageError,
    isLoading,
    hasError,
    isLoaded,
  };
};
