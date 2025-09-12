export const accessibilityStrings = {
  modal: {
    label: "Image Gallery",
    hint: "Image gallery with swipe navigation and thumbnail controls",
  },
  carousel: {
    getLabel: (currentIndex: number, totalImages: number) =>
      `Image carousel. Swipe left or right to navigate. Currently showing image ${
        currentIndex + 1
      } of ${totalImages}`,
  },
  image: {
    getLabel: (
      index: number,
      totalImages: number,
      imageType: string,
      description?: string
    ) =>
      description
        ? `Image ${index + 1} of ${totalImages}: ${imageType}. ${description}`
        : `Image ${index + 1} of ${totalImages}: ${imageType}`,
    getHint: (isCurrent: boolean) =>
      isCurrent ? "Currently displayed image" : "Tap to view this image",
  },
  thumbnail: {
    getLabel: (index: number, imageType: string) =>
      `View image ${index + 1}${imageType ? `: ${imageType}` : ""}`,
    getHint: (isActive: boolean) =>
      isActive ? "Currently selected image" : "Double tap to view this image",
  },
  closeButton: {
    label: "Close image gallery",
    hint: "Double tap to close the image gallery",
  },
  imageCounter: {
    getLabel: (currentIndex: number, totalImages: number) =>
      `Image ${currentIndex + 1} of ${totalImages}`,
  },
  footer: {
    label: "Image information and navigation controls",
  },
  imageInfo: {
    getLabel: (imageType: string, description?: string) =>
      description
        ? `Image type: ${imageType}. Description: ${description}`
        : `Image type: ${imageType}`,
  },
  thumbnailContainer: {
    label: "Image thumbnails for navigation",
  },
  announcements: {
    getModalOpen: (currentIndex: number, totalImages: number) =>
      `Image gallery opened. Showing image ${
        currentIndex + 1
      } of ${totalImages}. Swipe left or right to navigate, or tap thumbnails below.`,
    getImageChange: (
      currentIndex: number,
      totalImages: number,
      imageType: string,
      description?: string
    ) =>
      description
        ? `Image ${
            currentIndex + 1
          } of ${totalImages}: ${imageType}. ${description}`
        : `Image ${currentIndex + 1} of ${totalImages}: ${imageType}`,
  },
} as const;
