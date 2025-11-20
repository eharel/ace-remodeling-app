import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import {
  ImageGalleryModal,
  MorePhotosCard,
  PhotoTabs,
  type PhotoTabValue,
  AssetCategoryTabs,
  type AssetCategoryValue,
  AssetThumbnail,
  openAsset,
  convertDocumentsToPictures,
} from "@/features/gallery";
import { PageHeader, ThemedText, ThemedView } from "@/shared/components";
import { useProjects, useTheme, getProjectMedia } from "@/shared/contexts";
import { ComponentSelector } from "@/features/projects";
// Comment out mock data for now (keeping for fallback)
// import { mockProjects } from "@/data/mockProjects";
import { DesignTokens } from "@/core/themes";
import {
  Project,
  ProjectComponent,
  getProjectThumbnail,
  getCategoryLabel,
  getSubcategoryLabel,
  Document,
  DOCUMENT_TYPES,
} from "@/core/types";
import {
  commonStyles,
  getPhotoCounts,
  getPreviewPhotos,
  getProjectDuration,
  samplePreviewPhotos,
} from "@/shared/utils";

export default function ProjectDetailScreen() {
  const { id, componentId } = useLocalSearchParams<{ id: string; componentId?: string }>();
  const { projects } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [pressedImageIndex, setPressedImageIndex] = useState<number | null>(
    null
  );
  const [activePhotoTab, setActivePhotoTab] = useState<PhotoTabValue>("after");
  // Component selection state - defaults to first component
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );
  // Asset category selection state
  const [selectedAssetCategory, setSelectedAssetCategory] = useState<AssetCategoryValue>("all");
  // Asset gallery state (for viewing images in Assets section)
  const [assetGalleryVisible, setAssetGalleryVisible] = useState(false);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
  const { theme } = useTheme();

  // Show 3 preview photos (Flexbox will handle equal sizing)
  const previewCount = 3;

  useEffect(() => {
    if (id) {
      // Use Firebase data instead of mock data
      const foundProject = projects.find((p) => p.id === id);
      setProject(foundProject || null);

      // Set selected component: use componentId param if provided, otherwise default to first
      if (foundProject && foundProject.components.length > 0) {
        // If componentId param is provided and exists in project, use it
        if (componentId) {
          const matchingComponent = foundProject.components.find(
            (c) => c.id === componentId
          );
          if (matchingComponent) {
            setSelectedComponentId(componentId);
          } else {
            // componentId doesn't match, fall back to first component
            setSelectedComponentId(foundProject.components[0].id);
          }
        } else {
          // No componentId param, use first component
          setSelectedComponentId(foundProject.components[0].id);
        }
      }

      // Fallback to mock data if needed (commented out for now)
      // const foundProject = mockProjects.find((p) => p.id === id);
    }
  }, [id, componentId, projects]);

  // Update selectedComponentId when componentId param changes
  useEffect(() => {
    if (componentId && project && componentId !== selectedComponentId) {
      const matchingComponent = project.components.find(
        (c) => c.id === componentId
      );
      if (matchingComponent) {
        setSelectedComponentId(componentId);
      }
    }
  }, [componentId, project, selectedComponentId]);

  // Reset asset category when component changes
  useEffect(() => {
    setSelectedAssetCategory("all");
  }, [selectedComponentId]);

  // OPTIMIZATION 1: Preload all component images when project loads
  useEffect(() => {
    if (!project) return;

    const preloadImages = async () => {
      try {
        // Preload hero images from all components
        const allHeroImages = project.components
          .map((c) => {
            const thumbnail = getProjectThumbnail(project, c);
            return thumbnail || c.media?.[0]?.url;
          })
          .filter(Boolean) as string[];

        // Preload hero images
        await Promise.all(
          allHeroImages.map((url) => Image.prefetch(url))
        );

        // Preload first 6 thumbnails from each component
        const allThumbnails = project.components.flatMap((c) =>
          (c.media || [])
            .slice(0, 6)
            .map((m) => m.url)
            .filter(Boolean)
        ) as string[];

        // Preload thumbnails
        await Promise.all(
          allThumbnails.map((url) => Image.prefetch(url))
        );
      } catch (error) {
        // Silently fail - preloading is best effort
        console.warn("Image preloading failed:", error);
      }
    };

    preloadImages();
  }, [project]);

  /**
   * Get display label for a component pill
   * For pills, ALWAYS use category/subcategory (consistent labels)
   * componentName is for display below project name, not for pills
   */
  const getComponentLabel = (component: ProjectComponent): string => {
    // If has subcategory, use it (e.g., "Pool" instead of "Outdoor")
    if (component.subcategory) {
      const subcategoryLabel = getSubcategoryLabel(component.subcategory);
      return subcategoryLabel;
    }

    // Otherwise use category label
    const categoryLabel = getCategoryLabel(component.category);
    return categoryLabel;
  };

  /**
   * Current selected component
   * Filters project components to find the one matching selectedComponentId
   */
  const currentComponent = useMemo(() => {
    if (!project || !selectedComponentId) return null;
    return (
      project.components.find((c) => c.id === selectedComponentId) ||
      project.components[0] ||
      null
    );
  }, [project, selectedComponentId]);

  const currentComponentLabel = currentComponent
    ? getComponentLabel(currentComponent)
    : null;

  /**
   * Media for current component + shared media
   * Filters to show only the selected component's media plus project-wide shared media
   */
  const currentMedia = useMemo(() => {
    if (!project) return [];
    const componentMedia = currentComponent?.media || [];
    const sharedMedia = project.sharedMedia || [];
    return [...componentMedia, ...sharedMedia];
  }, [project, currentComponent]);

  /**
   * Documents for current component + shared documents
   * Filters to show only the selected component's documents plus project-wide shared documents
   */
  const currentDocuments = useMemo(() => {
    if (!project) return [];
    const componentDocuments = currentComponent?.documents || [];
    const sharedDocuments = project.sharedDocuments || [];
    return [...componentDocuments, ...sharedDocuments];
  }, [project, currentComponent]);

  /**
   * Helper function to map category string to AssetCategoryValue
   */
  const mapCategoryToTabValue = (category: string | undefined): AssetCategoryValue => {
    if (!category) return "other";
    const normalizedCategory = category.toLowerCase().trim();
    
    // Map common category values to tab values
    if (normalizedCategory === "plans" || normalizedCategory === "floor-plan" || normalizedCategory === "floor plan") {
      return "floor-plan";
    }
    if (normalizedCategory === "materials") {
      return "materials";
    }
    if (normalizedCategory === "rendering" || normalizedCategory === "rendering-3d" || normalizedCategory === "3d rendering" || normalizedCategory === "3d") {
      return "rendering-3d";
    }
    if (normalizedCategory === "contract" || normalizedCategory === "contracts") {
      return "contract";
    }
    if (normalizedCategory === "permit" || normalizedCategory === "permits") {
      return "permit";
    }
    if (normalizedCategory === "invoice" || normalizedCategory === "invoices") {
      return "invoice";
    }
    return "other";
  };

  /**
   * Filtered documents based on selected asset category
   * Uses doc.category instead of doc.type (which is legacy)
   */
  const filteredDocuments = useMemo(() => {
    if (selectedAssetCategory === "all") return currentDocuments;

    return currentDocuments.filter((doc) => {
      const docTabValue = mapCategoryToTabValue(doc.category);
      return docTabValue === selectedAssetCategory;
    });
  }, [currentDocuments, selectedAssetCategory]);

  /**
   * Convert filtered documents to gallery format for images
   * Used for displaying asset images in the gallery modal
   */
  const assetGalleryImages = useMemo(() => {
    return convertDocumentsToPictures(filteredDocuments);
  }, [filteredDocuments]);

  /**
   * Display description - component description with fallback to project description
   * Uses nullish coalescing (??) to properly handle empty strings
   */
  const displayDescription = useMemo(() => {
    if (!project) return "";
    // Use component description if it exists, otherwise fall back to project description
    return currentComponent?.description ?? project.description ?? "";
  }, [currentComponent, project]);

  /**
   * Display timeline/duration - component timeline with fallback to project timeline
   */
  const displayTimeline = useMemo(() => {
    if (!project) return null;
    // Use component timeline if available, otherwise use project timeline
    return currentComponent?.timeline || project.timeline || null;
  }, [project, currentComponent]);

  /**
   * Hero image URL - component-specific thumbnail with fallback
   */
  const heroImageUrl = useMemo(() => {
    if (!project) return "";
    return getProjectThumbnail(project, currentComponent || undefined);
  }, [project, currentComponent]);

  // Legacy: Keep aggregatedPictures for backward compatibility during transition
  // This will be replaced with currentMedia in next steps
  const aggregatedPictures = useMemo(() => {
    return currentMedia;
  }, [currentMedia]);

  // Calculate photo counts for each category
  const photoCounts = useMemo(() => {
    return getPhotoCounts(aggregatedPictures);
  }, [aggregatedPictures]);

  // Get preview photos based on active tab
  const previewPhotos = useMemo(() => {
    if (aggregatedPictures.length === 0) return [];

    if (activePhotoTab === "all") {
      // Use intelligent sampling for "All Photos" tab
      return samplePreviewPhotos(aggregatedPictures, previewCount);
    } else {
      // Filter by specific stage and take first N
      // Map tab values to MediaAsset stages
      const stageMap: Record<string, string> = {
        before: "before",
        after: "after",
        progress: "in-progress",
      };
      const targetStage = stageMap[activePhotoTab] || activePhotoTab;
      const filtered = aggregatedPictures.filter(
        (m) => m.mediaType === "image" && m.stage === targetStage
      );
      return getPreviewPhotos(filtered, previewCount);
    }
  }, [aggregatedPictures, activePhotoTab, previewCount]);

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
    if (aggregatedPictures.length === 0) return [];

    if (activePhotoTab === "all") {
      return aggregatedPictures;
    }

    // Map tab value to MediaAsset stage
    const stageMap: Record<string, string> = {
      before: "before",
      after: "after",
      progress: "in-progress",
    };
    const targetStage = stageMap[activePhotoTab] || activePhotoTab;
    return aggregatedPictures.filter(
      (m) => m.mediaType === "image" && m.stage === targetStage
    );
  }, [aggregatedPictures, activePhotoTab]);

  // Debug logging for asset filtering (current issue)
  useEffect(() => {
    if (!project) return;

    console.log("📁 Assets Filter Debug:", {
      project: project.name,
      componentId: currentComponent?.id,
      componentLabel: currentComponentLabel,
      selectedAssetCategory,
      currentDocuments: currentDocuments.map((doc) => ({
        id: doc.id,
        name: doc.name,
        category: doc.category,
        type: doc.type,
      })),
      filteredDocuments: filteredDocuments.map((doc) => ({
        id: doc.id,
        name: doc.name,
        category: doc.category,
        type: doc.type,
      })),
    });
  }, [
    project,
    currentComponent,
    currentComponentLabel,
    selectedAssetCategory,
    currentDocuments,
    filteredDocuments,
  ]);

  const closeGallery = () => {
    setGalleryVisible(false);
  };

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setGalleryVisible(true);
  };

  const handleMoreImagesPress = () => {
    setSelectedImageIndex(2); // Start from 3rd image (index 2)
    setGalleryVisible(true);
  };

  const getStatusBadgeStyle = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "completed":
        return {
          backgroundColor: theme.colors.status.successLight,
          color: theme.colors.status.success,
        };
      case "in-progress":
      case "in progress":
        return {
          backgroundColor: theme.colors.status.infoLight,
          color: theme.colors.status.info,
        };
      case "pending":
        return {
          backgroundColor: theme.colors.status.warningLight,
          color: theme.colors.status.warning,
        };
      case "cancelled":
      case "canceled":
        return {
          backgroundColor: theme.colors.status.errorLight,
          color: theme.colors.status.error,
        };
      default:
        return {
          backgroundColor: theme.colors.background.accent,
          color: theme.colors.text.secondary,
        };
    }
  };

  const getDocumentIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case "contract":
        return "description";
      case "invoice":
        return "receipt";
      case "permit":
        return "verified-user";
      case "specification":
        return "engineering";
      case "photo":
        return "photo";
      case "plan":
        return "architecture";
      default:
        return "insert-drive-file";
    }
  };

  const getLogIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case "milestone":
        return "flag";
      case "update":
        return "update";
      case "issue":
        return "warning";
      case "note":
        return "note";
      default:
        return "info";
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background.primary,
        },
        scrollView: {
          flex: 1,
        },
        errorState: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: DesignTokens.spacing[10],
        },
        errorText: {
          fontSize: DesignTokens.typography.fontSize.lg,
          opacity: 0.6,
        },
        heroImage: {
          width: "100%",
          height: 300,
        },
        header: {
          paddingHorizontal: DesignTokens.spacing[6],
          paddingTop: DesignTokens.spacing[8],
          paddingBottom: DesignTokens.spacing[8],
          backgroundColor: theme.colors.background.primary,
          position: "relative",
          borderTopWidth: 1,
          borderTopColor: `${theme.colors.border.primary}1A`, // 10% opacity
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        },
        headerContent: {
          flex: 1,
        },
        statusBadge: {
          position: "absolute",
          top: DesignTokens.spacing[6],
          right: DesignTokens.spacing[6],
          paddingHorizontal: DesignTokens.spacing[3],
          paddingVertical: DesignTokens.spacing[1],
          borderRadius: DesignTokens.borderRadius.full,
          minWidth: 80,
          alignItems: "center",
        },
        statusBadgeText: {
          ...commonStyles.text.badge,
        },
        projectName: {
          ...commonStyles.text.pageTitle,
          marginBottom: DesignTokens.spacing[2],
        },
        componentName: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
          marginBottom: DesignTokens.spacing[2],
          opacity: 0.9,
        },
        projectDescription: {
          ...commonStyles.text.description,
          marginBottom: DesignTokens.spacing[6],
        },
        metaGrid: {
          flexDirection: "column",
        },
        metaItem: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: DesignTokens.spacing[3],
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.secondary,
        },
        metaItemLast: {
          borderBottomWidth: 0,
        },
        metaLabel: {
          ...commonStyles.text.label,
          marginBottom: 0,
          flex: 1,
        },
        metaValue: {
          ...commonStyles.text.value,
          flex: 1,
          textAlign: "right",
        },
        section: {
          backgroundColor: theme.colors.background.card,
          marginBottom: DesignTokens.spacing[4],
          marginHorizontal: DesignTokens.spacing[4],
          padding: DesignTokens.spacing[6],
          borderRadius: DesignTokens.borderRadius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.md,
        },
        sectionTitle: {
          ...commonStyles.text.sectionTitle,
          marginBottom: DesignTokens.spacing[2], // Tight spacing to instruction text
        },
        picturesGrid: {
          flexDirection: "row",
          gap: DesignTokens.spacing[3],
          // NO marginTop - PhotoTabs component handles spacing above grid
        },
        gridImageContainer: {
          flex: 1, // Each item takes equal space
          aspectRatio: 4 / 3,
          borderRadius: DesignTokens.borderRadius.lg,
          overflow: "hidden",
          ...DesignTokens.shadows.sm, // Subtle shadow for depth
        },
        gridImageContainerPressed: {
          transform: [{ scale: 0.95 }],
          ...DesignTokens.shadows.md,
        },
        gridImage: {
          width: "100%",
          height: "100%",
        },
        moreImagesOverlay: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.background.overlay,
          justifyContent: "center",
          alignItems: "center",
        },
        moreImagesText: {
          fontSize: DesignTokens.typography.fontSize.xl,
          fontWeight: DesignTokens.typography.fontWeight.bold,
          color: theme.colors.text.inverse,
          textAlign: "center",
        },
        sectionSubtitle: {
          ...commonStyles.text.smallText,
          marginBottom: DesignTokens.spacing[5], // Space before tabs
        },
        pictureContainer: {
          width: 280,
          marginRight: DesignTokens.spacing[4],
          backgroundColor: theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.lg,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
        },
        pictureContainerPressed: {
          transform: [{ scale: 0.98 }],
          ...DesignTokens.shadows.md,
        },
        imageCounter: {
          marginTop: DesignTokens.spacing[3],
          textAlign: "center",
          fontSize: DesignTokens.typography.fontSize.sm,
          opacity: 0.7,
        },
        picture: {
          width: "100%",
          height: 200,
        },
        pictureOverlay: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.background.overlay,
          justifyContent: "center",
          alignItems: "center",
          opacity: 0,
        },
        pictureOverlayVisible: {
          opacity: 1,
        },
        zoomIcon: {
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.lg,
          width: DesignTokens.componentSizes.iconButton,
          height: DesignTokens.componentSizes.iconButton,
          justifyContent: "center",
          alignItems: "center",
        },
        pictureInfo: {
          padding: DesignTokens.spacing[4],
        },
        pictureType: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: "600",
          marginBottom: DesignTokens.spacing[1],
          textTransform: "capitalize",
        },
        pictureDescription: {
          ...commonStyles.text.smallText,
          opacity: 0.7,
        },
        documentsList: {
          flexDirection: "column",
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.lg,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
        },
        documentContainer: {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: DesignTokens.spacing[4],
          paddingHorizontal: DesignTokens.spacing[5],
          backgroundColor: theme.colors.background.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.primary,
          minHeight: 72,
        },
        documentContainerLast: {
          borderBottomWidth: 0,
        },
        documentIcon: {
          width: 40,
          height: 40,
          borderRadius: DesignTokens.borderRadius.md,
          backgroundColor: theme.colors.background.secondary,
          justifyContent: "center",
          alignItems: "center",
          marginRight: DesignTokens.spacing[4],
        },
        documentContent: {
          flex: 1,
          justifyContent: "center",
        },
        documentHeader: {
          flexDirection: "row",
          alignItems: "center",
          marginBottom: DesignTokens.spacing[1],
        },
        documentName: {
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: "600",
          color: theme.colors.text.primary,
          flex: 1,
          marginRight: DesignTokens.spacing[2],
        },
        documentType: {
          fontSize: DesignTokens.typography.fontSize.xs,
          fontWeight: "500",
          color: theme.colors.text.secondary,
          backgroundColor: theme.colors.background.secondary,
          paddingHorizontal: DesignTokens.spacing[2],
          paddingVertical: DesignTokens.spacing[1],
          borderRadius: DesignTokens.borderRadius.sm,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        documentDescription: {
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.text.secondary,
          lineHeight:
            DesignTokens.typography.fontSize.sm *
            DesignTokens.typography.lineHeight.normal,
          marginTop: DesignTokens.spacing[1],
        },
        documentAction: {
          width: 32,
          height: 32,
          borderRadius: DesignTokens.borderRadius.sm,
          backgroundColor: theme.colors.background.secondary,
          justifyContent: "center",
          alignItems: "center",
          marginLeft: DesignTokens.spacing[2],
        },
        sectionHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: DesignTokens.spacing[4],
        },
        viewAllButton: {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: DesignTokens.spacing[2],
          paddingHorizontal: DesignTokens.spacing[3],
          backgroundColor: theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.md,
        },
        viewAllButtonText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: "600",
          color: theme.colors.interactive.primary,
          marginRight: DesignTokens.spacing[1],
        },
        documentsPreview: {
          backgroundColor: theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.md,
          padding: DesignTokens.spacing[4],
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
        },
        documentPreviewItem: {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[3],
          borderRadius: DesignTokens.borderRadius.md,
          marginBottom: DesignTokens.spacing[2],
        },
        documentPreviewIcon: {
          width: 32,
          height: 32,
          borderRadius: DesignTokens.borderRadius.sm,
          backgroundColor: theme.colors.background.secondary,
          justifyContent: "center",
          alignItems: "center",
          marginRight: DesignTokens.spacing[3],
        },
        documentPreviewContent: {
          flex: 1,
        },
        documentPreviewName: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: "600",
          color: theme.colors.text.primary,
          marginBottom: DesignTokens.spacing[1],
        },
        documentPreviewType: {
          fontSize: DesignTokens.typography.fontSize.xs,
          color: theme.colors.text.secondary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        moreDocumentsButton: {
          alignItems: "center",
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[4],
          backgroundColor: theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.md,
          marginTop: DesignTokens.spacing[2],
        },
        moreDocumentsText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: "600",
          color: theme.colors.interactive.primary,
        },
        assetThumbnails: {
          paddingHorizontal: DesignTokens.spacing[4],
          gap: DesignTokens.spacing[4],
          paddingBottom: DesignTokens.spacing[2],
        },
        moreAssetsButton: {
          width: 120,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          padding: DesignTokens.spacing[3],
        },
        moreAssetsText: {
          color: theme.colors.text.primary,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
          fontSize: DesignTokens.typography.fontSize.sm,
        },
        logsList: {
          flexDirection: "column",
        },
        logContainer: {
          width: "100%",
          marginBottom: DesignTokens.spacing[3],
          padding: DesignTokens.spacing[4],
          backgroundColor: theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          flexDirection: "row",
          alignItems: "flex-start",
          position: "relative",
        },
        logTimeline: {
          position: "absolute",
          left: 20,
          top: 0,
          bottom: -DesignTokens.spacing[3],
          width: 2,
          backgroundColor: theme.colors.border.primary,
        },
        logTimelineLast: {
          bottom: 0,
        },
        logIcon: {
          marginRight: DesignTokens.spacing[3],
          marginTop: DesignTokens.spacing[1],
          zIndex: 1,
        },
        logContent: {
          flex: 1,
        },
        emptyState: {
          padding: DesignTokens.spacing[8],
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.md,
        },
        emptyStateText: {
          fontSize: DesignTokens.typography.fontSize.base,
          opacity: 0.6,
          textAlign: "center",
          marginTop: DesignTokens.spacing[2],
        },
        loadingSkeleton: {
          backgroundColor: theme.colors.background.accent,
          borderRadius: DesignTokens.borderRadius.lg,
          height: 100,
          marginBottom: DesignTokens.spacing[3],
        },
        logContainerLast: {
          marginBottom: 0,
        },
        logDate: {
          ...commonStyles.text.caption,
          opacity: 0.6,
          marginBottom: DesignTokens.spacing[1],
        },
        logDescription: {
          ...commonStyles.text.smallText,
        },
      }),
    [theme]
  );

  if (!project) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false, // Hide React Navigation's header
          }}
        />
        <ThemedView style={styles.container}>
          <PageHeader
            title="Project Details"
            showBack={true}
            backLabel="Back"
          />
          <ThemedView style={styles.errorState}>
            <ThemedText style={styles.errorText}>Project not found</ThemedText>
          </ThemedView>
        </ThemedView>
      </>
    );
  }

  // OPTIMIZATION 3: Gallery image renderer with optimized image props
  const renderGridImage = (
    item: any,
    index: number,
    isMoreCell: boolean = false
  ) => {
    const isPressed = pressedImageIndex === index;

    return (
      <ThemedView key={`grid-image-${index}`} style={styles.gridImageContainer}>
        <Pressable
          onPress={() =>
            isMoreCell ? handleMoreImagesPress() : handleImagePress(index)
          }
          onPressIn={() => setPressedImageIndex(index)}
          onPressOut={() => setPressedImageIndex(null)}
          style={isPressed ? styles.gridImageContainerPressed : undefined}
        >
          <Image
            source={{ uri: item.url }}
            style={styles.gridImage}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
            priority="normal"
            recyclingKey={item.url}
          />
          {isMoreCell && (
            <ThemedView style={styles.moreImagesOverlay}>
              <ThemedText style={styles.moreImagesText}>
                +{aggregatedPictures.length - 2} more photos
              </ThemedText>
            </ThemedView>
          )}
        </Pressable>
      </ThemedView>
    );
  };

  const renderDocumentPreview = (item: any, index: number) => (
    <Pressable
      key={`document-preview-${index}`}
      style={({ pressed }) => [
        styles.documentPreviewItem,
        pressed && { backgroundColor: theme.colors.background.secondary },
      ]}
      onPress={() => router.push(`/project/${project.id}/documents`)}
      accessible={true}
      accessibilityLabel={`View ${item.name}, ${item.type} document`}
      accessibilityHint="Double tap to view all documents"
      accessibilityRole="button"
    >
      <View style={styles.documentPreviewIcon}>
        <MaterialIcons
          name={getDocumentIcon(item.type) as any}
          size={18}
          color={theme.colors.interactive.primary}
        />
      </View>
      <View style={styles.documentPreviewContent}>
        <ThemedText style={styles.documentPreviewName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.documentPreviewType}>{item.type}</ThemedText>
      </View>
    </Pressable>
  );

  const renderLog = (item: any, index: number, isLast: boolean) => (
    <ThemedView
      key={`log-${index}`}
      style={[styles.logContainer, isLast && styles.logContainerLast]}
    >
      <View style={[styles.logTimeline, isLast && styles.logTimelineLast]} />
      <MaterialIcons
        name={getLogIcon(item.type || "update") as any}
        size={20}
        color={theme.colors.interactive.primary}
        style={styles.logIcon}
      />
      <ThemedView style={styles.logContent}>
        <ThemedText style={styles.logDate}>
          {item.date instanceof Date
            ? item.date.toLocaleDateString()
            : item.date}
        </ThemedText>
        <ThemedText style={styles.logDescription}>
          {item.description}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false, // Hide React Navigation's header
        }}
      />
      <ThemedView style={styles.container}>
        <PageHeader
          title={project.name}
          showBack={true}
          backLabel="Back"
          variant="compact"
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: DesignTokens.spacing[20] }}
        >
          {/* Hero Image - OPTIMIZED with caching and transitions */}
          {heroImageUrl ? (
            <Animated.View
              key={`hero-container-${selectedComponentId || 'default'}`}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
            >
              <Image
                key={`hero-${selectedComponentId || 'default'}`}
                source={{ uri: heroImageUrl }}
                style={styles.heroImage}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                priority="high"
                recyclingKey={heroImageUrl}
              />
            </Animated.View>
          ) : null}

          {/* Component Selector - only show if multiple components */}
          {project.components.length > 1 && (
            <ComponentSelector
              components={project.components}
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
              getComponentLabel={getComponentLabel}
            />
          )}

          {/* Project Header */}
          <ThemedView style={styles.header}>
            <ThemedView style={styles.headerContent}>
              {/* Component Name - show if exists (project name is in header) */}
              {currentComponent?.name && (
                <ThemedText
                  style={[
                    styles.componentName,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {currentComponent.name}
                </ThemedText>
              )}
              <ThemedText
                key={`description-${selectedComponentId || 'default'}`}
                style={[
                  styles.projectDescription,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {displayDescription}
              </ThemedText>
            </ThemedView>

            {/* Status Badge */}
            <ThemedView
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusBadgeStyle(project.status)
                    .backgroundColor,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.statusBadgeText,
                  { color: getStatusBadgeStyle(project.status).color },
                ]}
              >
                {project.status.replace("-", " ").toUpperCase()}
              </ThemedText>
            </ThemedView>

            {/* Project Meta */}
            <ThemedView style={styles.metaGrid}>
              <ThemedView style={styles.metaItem}>
                <ThemedText
                  style={[
                    styles.metaLabel,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Status
                </ThemedText>
                <ThemedText style={styles.metaValue}>
                  {project.status.replace("-", " ").toUpperCase()}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.metaItem}>
                <ThemedText
                  style={[
                    styles.metaLabel,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Category
                </ThemedText>
                <ThemedText style={styles.metaValue}>
                  {currentComponent
                    ? getCategoryLabel(currentComponent.category)
                    : "Miscellaneous"}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.metaItem}>
                <ThemedText
                  style={[
                    styles.metaLabel,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Location
                </ThemedText>
                <ThemedText style={styles.metaValue}>
                  {project.location?.neighborhood || "Austin, TX"}{" "}
                  {project.location?.zipCode || ""}
                </ThemedText>
              </ThemedView>
              <ThemedView style={[styles.metaItem, styles.metaItemLast]}>
                <ThemedText
                  style={[
                    styles.metaLabel,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  Duration
                </ThemedText>
                <ThemedText style={styles.metaValue}>
                  {displayTimeline
                    ? getProjectDuration({ timeline: displayTimeline })
                    : getProjectDuration(project)}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Pictures Section */}
          <ThemedView style={styles.section}>
            <ThemedText
              style={[
                styles.sectionTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              Project Photos ({currentMedia.length})
            </ThemedText>
            <ThemedText
              style={[
                styles.sectionSubtitle,
                { color: theme.colors.text.secondary },
              ]}
            >
              Tap any photo to view gallery
            </ThemedText>

            {aggregatedPictures.length > 0 ? (
              <>
                {/* Photo Category Tabs */}
                <PhotoTabs
                  activeTab={activePhotoTab}
                  onTabChange={setActivePhotoTab}
                  photoCounts={photoCounts}
                />

                {/* Photo Grid */}
                {previewPhotos.length > 0 ? (
                  <ThemedView variant="ghost" style={styles.picturesGrid}>
                    {previewPhotos.map((item) => {
                      // Find the index in the filtered gallery images for correct navigation
                      const galleryIndex = galleryImages.findIndex(
                        (p) => p.id === item.id
                      );
                      return renderGridImage(item, galleryIndex);
                    })}
                    {/* "+X more" card */}
                    {hasMorePhotos && (
                      <MorePhotosCard
                        count={remainingCount}
                        backgroundPhoto={
                          galleryImages[previewPhotos.length] ||
                          galleryImages[0]
                        }
                        onPress={() => {
                          // Open gallery starting from first photo in filtered set
                          setSelectedImageIndex(0);
                          setGalleryVisible(true);
                        }}
                      />
                    )}
                  </ThemedView>
                ) : (
                  <ThemedView style={styles.emptyState}>
                    <MaterialIcons
                      name="photo-library"
                      size={48}
                      color={theme.colors.text.tertiary}
                    />
                    <ThemedText
                      style={[
                        styles.emptyStateText,
                        { color: theme.colors.text.secondary },
                      ]}
                    >
                      No {activePhotoTab === "all" ? "" : activePhotoTab} photos
                      available
                    </ThemedText>
                  </ThemedView>
                )}
              </>
            ) : (
              <ThemedView style={styles.emptyState}>
                <MaterialIcons
                  name="photo-library"
                  size={48}
                  color={theme.colors.text.tertiary}
                />
                <ThemedText
                  style={[
                    styles.emptyStateText,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  No pictures available
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          {/* Assets Section */}
          {currentDocuments && currentDocuments.length > 0 && (
            <ThemedView style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  Assets ({currentDocuments.length})
                </ThemedText>
                <Pressable
                  style={styles.viewAllButton}
                  onPress={() =>
                    router.push(`/project/${project.id}/documents`)
                  }
                  accessible={true}
                  accessibilityLabel="View all assets"
                  accessibilityRole="button"
                >
                  <ThemedText style={styles.viewAllButtonText}>
                    View All
                  </ThemedText>
                  <MaterialIcons
                    name="chevron-right"
                    size={16}
                    color={theme.colors.interactive.primary}
                  />
                </Pressable>
              </View>

              {/* Asset Category Tabs */}
              <AssetCategoryTabs
                activeTab={selectedAssetCategory}
                onTabChange={setSelectedAssetCategory}
                documents={currentDocuments}
              />

              {/* Asset Thumbnails */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.assetThumbnails}
              >
                {filteredDocuments.slice(0, 4).map((doc) => (
                  <AssetThumbnail
                    key={doc.id}
                    document={doc}
                    onPress={() => {
                      openAsset(doc, filteredDocuments, router, {
                        setAssetGalleryVisible,
                        setSelectedAssetIndex,
                      });
                    }}
                  />
                ))}
                {filteredDocuments.length > 4 && (
                  <Pressable
                    style={styles.moreAssetsButton}
                    onPress={() =>
                      router.push(`/project/${project.id}/documents`)
                    }
                    accessible={true}
                    accessibilityLabel={`View ${
                      filteredDocuments.length - 4
                    } more assets`}
                    accessibilityRole="button"
                  >
                    <ThemedText style={styles.moreAssetsText}>
                      +{filteredDocuments.length - 4} more
                    </ThemedText>
                  </Pressable>
                )}
              </ScrollView>
            </ThemedView>
          )}

          {/* Logs Section */}
          {project.logs && project.logs.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.text.primary },
                ]}
              >
                Project Logs ({project.logs.length})
              </ThemedText>
              <ThemedView style={styles.logsList}>
                {project.logs.map((item, index) =>
                  renderLog(item, index, index === project.logs.length - 1)
                )}
              </ThemedView>
            </ThemedView>
          )}

          {/* Testimonial Section */}
          {project.testimonial && (
            <ThemedView style={styles.section}>
              <ThemedText
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.text.primary },
                ]}
              >
                Client Testimonial
              </ThemedText>
              <ThemedView
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  padding: DesignTokens.spacing[6],
                  borderRadius: DesignTokens.borderRadius.md,
                  borderLeftWidth: 4,
                  borderLeftColor: theme.colors.text.accent,
                }}
              >
                <ThemedText
                  style={[
                    styles.projectDescription,
                    { color: theme.colors.text.secondary, fontStyle: "italic" },
                  ]}
                >
                  &ldquo;{project.testimonial.text}&rdquo;
                </ThemedText>
                <ThemedText
                  style={[
                    styles.metaValue,
                    { marginTop: DesignTokens.spacing[4], textAlign: "right" },
                  ]}
                >
                  — {project.testimonial.author}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          )}
        </ScrollView>
      </ThemedView>

      {/* Image Gallery Modal */}
      {galleryImages.length > 0 && (
        <ImageGalleryModal
          visible={galleryVisible}
          images={galleryImages}
          initialIndex={selectedImageIndex}
          onClose={closeGallery}
        />
      )}

      {/* Asset Image Gallery (for images in Assets section) */}
      {assetGalleryImages.length > 0 && (
        <ImageGalleryModal
          visible={assetGalleryVisible}
          images={assetGalleryImages}
          initialIndex={selectedAssetIndex}
          onClose={() => setAssetGalleryVisible(false)}
        />
      )}
    </>
  );
}
