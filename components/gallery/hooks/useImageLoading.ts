import { Picture } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { ImageLoadingState, ImageState } from "../types/gallery.types";

interface UseImageLoadingProps {
  images: Picture[];
}

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
