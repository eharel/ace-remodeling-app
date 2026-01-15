import { EditButton } from "@/shared/components/EditButton";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import {
  AssetThumbnail,
  ImageGalleryModal,
  MorePhotosCard,
  type PhotoTabValue,
} from "@/features/gallery";
import {
  LoadingState,
  PageHeader,
  RefreshableScrollView,
  ThemedText,
  ThemedView,
} from "@/shared/components";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { useProjects, useTheme } from "@/shared/contexts";
// Comment out mock data for now (keeping for fallback)
// import { mockProjects } from "@/data/mockProjects";
import { EditDescriptionModal } from "@/features/projects/components/EditDescriptionModal";
import { DesignTokens } from "@/shared/themes";
import {
  getCategoryLabel,
  getProjectThumbnail,
  getSubcategoryLabel,
  ProjectComponent,
} from "@/shared/types";
import { getProjectDuration } from "@/shared/utils";
import { createProjectDetailStyles } from "./[id].styles";
import { useAssetCategoryManagement } from "./hooks/useAssetCategoryManagement";
import { usePhotoGallery } from "./hooks/usePhotoGallery";
import { useProjectComponentSelection } from "./hooks/useProjectComponentSelection";

export default function ProjectDetailScreen() {
  const { id, componentId } = useLocalSearchParams<{
    id: string;
    componentId?: string;
  }>();
  const {
    projects,
    loading,
    updateProject: updateProjectContext,
    updateComponent,
  } = useProjects();
  const { theme } = useTheme();

  // Component selection and project data
  const {
    project,
    selectedComponent,
    setSelectedComponent,
    sortedComponents,
    currentMedia,
    currentDocuments,
  } = useProjectComponentSelection(id, componentId, projects);

  // Photo gallery state
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [pressedImageIndex, setPressedImageIndex] = useState<number | null>(
    null
  );
  const [activePhotoTab, setActivePhotoTab] = useState<PhotoTabValue>("after");
  const previewCount = 3;

  // Photo gallery logic
  const {
    photoCounts,
    previewPhotos,
    hasMorePhotos,
    remainingCount,
    galleryImages,
  } = usePhotoGallery({
    media: currentMedia,
    activePhotoTab,
    previewCount,
  });

  // Asset category management
  const {
    selectedAssetCategory,
    setSelectedAssetCategory,
    selectedAssetIndex,
    setSelectedAssetIndex,
    assetGalleryVisible,
    setAssetGalleryVisible,
    assetCounts,
    availableAssetCategories,
    filteredDocuments,
    assetGalleryImages,
    documentToImageIndex,
    getAssetCategoryLabel,
  } = useAssetCategoryManagement({
    documents: currentDocuments,
    selectedComponentId: selectedComponent?.id || null,
  });

  // Modal state
  const [showEditDescriptionModal, setShowEditDescriptionModal] =
    useState<boolean>(false);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
        await Promise.all(allHeroImages.map((url) => Image.prefetch(url)));

        // Preload first 6 thumbnails from each component
        const allThumbnails = project.components.flatMap((c) =>
          (c.media || [])
            .slice(0, 6)
            .map((m) => m.url)
            .filter(Boolean)
        ) as string[];

        // Preload thumbnails
        await Promise.all(allThumbnails.map((url) => Image.prefetch(url)));
      } catch {
        // Silently fail - preloading is best effort
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

  const selectedComponentLabel = selectedComponent
    ? getComponentLabel(selectedComponent)
    : null;

  /**
   * Display description - component description with fallback to project description
   * Uses nullish coalescing (??) to properly handle empty strings
   */
  const displayDescription = useMemo(() => {
    if (!project) return "";
    // Use component description if it exists, otherwise fall back to project description
    return selectedComponent?.description ?? project.description ?? "";
  }, [selectedComponent, project]);

  /**
   * Display timeline/duration - component timeline with fallback to project timeline
   */
  const displayTimeline = useMemo(() => {
    if (!project) return null;
    // Use component timeline if available, otherwise use project timeline
    return selectedComponent?.timeline || project.timeline || null;
  }, [project, selectedComponent]);

  /**
   * Hero image URL - component-specific thumbnail with fallback
   */
  const heroImageUrl = useMemo(() => {
    if (!project) return "";
    return getProjectThumbnail(project, selectedComponent || undefined);
  }, [project, selectedComponent]);

  // Legacy: Keep aggregatedPictures for backward compatibility during transition
  // This will be replaced with currentMedia in next steps
  const aggregatedPictures = useMemo(() => {
    return currentMedia;
  }, [currentMedia]);

  // Debug logging for asset filtering (current issue)
  useEffect(() => {
    if (!project) return;
  }, [
    project,
    selectedComponent,
    selectedComponentLabel,
    selectedAssetCategory,
    currentDocuments,
    filteredDocuments,
  ]);

  const closeGallery = () => {
    setGalleryVisible(false);
  };

  const handleUpdateDescription = async (description: string) => {
    if (!project) throw new Error("Project not found");

    setIsSaving(true);
    setSaveError(null);
    try {
      if (selectedComponent?.id) {
        await updateComponent(project.id, selectedComponent.id, {
          description,
        });
      } else {
        await updateProjectContext(project.id, { description });
      }
      setShowEditDescriptionModal(false);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to update description"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleImagePress = (index: number) => {
    // Ensure index is within bounds before opening gallery
    if (galleryImages.length === 0) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(index, galleryImages.length - 1));

    if (safeIndex < 0 || safeIndex >= galleryImages.length) {
      return;
    }

    setSelectedImageIndex(safeIndex);
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

  const styles = useMemo(() => createProjectDetailStyles(theme), [theme]);

  // Show loading state only on initial load (when no project found yet)
  // During refresh, keep content visible and just show refresh spinner
  if (loading && !project) {
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
          <LoadingState message="Loading project..." />
        </ThemedView>
      </>
    );
  }

  // Show error state only after loading is complete and project is still not found
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
        <RefreshableScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: DesignTokens.spacing[20] }}
        >
          {/* Hero Image - OPTIMIZED with caching and transitions */}
          {heroImageUrl ? (
            <Animated.View
              key={`hero-container-${selectedComponent?.id || "default"}`}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
            >
              <Image
                key={`hero-${selectedComponent?.id || "default"}`}
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
          {project.components.length > 1 && sortedComponents.length > 0 && (
            <SegmentedControl
              variant="pills"
              options={sortedComponents.map((c) => c.id) as readonly string[]}
              selected={selectedComponent?.id || sortedComponents[0].id}
              onSelect={setSelectedComponent}
              getLabel={(componentId) => {
                const component = sortedComponents.find(
                  (c) => c.id === componentId
                );
                return component ? getComponentLabel(component) : componentId;
              }}
              ariaLabel="Select project component"
            />
          )}

          {/* Project Header */}
          <ThemedView style={styles.header}>
            <ThemedView style={styles.headerContent}>
              {/* Component Name - show if exists (project name is in header) */}
              {selectedComponent?.name && (
                <ThemedText
                  style={[
                    styles.componentName,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  {selectedComponent.name}
                </ThemedText>
              )}
              <View style={styles.editButtonContainer}>
                <EditButton onPress={() => setShowEditDescriptionModal(true)} />
              </View>
              <ThemedText
                key={`description-${selectedComponent?.id || "default"}`}
                style={[
                  styles.projectDescription,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {displayDescription}
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
                <ThemedView style={styles.metaValuePill}>
                  <ThemedView
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: getStatusBadgeStyle(project.status)
                          .backgroundColor,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.statusPillText,
                        { color: getStatusBadgeStyle(project.status).color },
                      ]}
                    >
                      {project.status.replace("-", " ").toUpperCase()}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
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
                  {selectedComponent
                    ? getCategoryLabel(selectedComponent.category)
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
                <SegmentedControl
                  variant="tabs"
                  options={["after", "before", "progress", "all"] as const}
                  selected={activePhotoTab}
                  onSelect={setActivePhotoTab}
                  showCounts={true}
                  getCounts={(tab) => photoCounts[tab as PhotoTabValue]}
                  getLabel={(tab) => {
                    const labels: Record<PhotoTabValue, string> = {
                      after: "After",
                      before: "Before",
                      progress: "In Progress",
                      all: "All Photos",
                    };
                    return labels[tab as PhotoTabValue] || tab;
                  }}
                  ariaLabel="Filter photos by stage"
                />

                {/* Photo Grid */}
                {previewPhotos.length > 0 ? (
                  <ThemedView variant="ghost" style={styles.picturesGrid}>
                    {previewPhotos.map((item, previewIndex) => {
                      // Find the index in the filtered gallery images for correct navigation
                      const galleryIndex = galleryImages.findIndex(
                        (p: { id?: string }) => p.id === item.id
                      );
                      // If not found, use previewIndex as fallback (but ensure it's in bounds)
                      const safeIndex =
                        galleryIndex >= 0
                          ? galleryIndex
                          : Math.min(previewIndex, galleryImages.length - 1);

                      return renderGridImage(item, safeIndex);
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
              {currentDocuments.length > 0 &&
                availableAssetCategories.length > 0 && (
                  <SegmentedControl
                    variant="tabs"
                    options={
                      availableAssetCategories as readonly AssetCategoryValue[]
                    }
                    selected={
                      selectedAssetCategory || availableAssetCategories[0]
                    }
                    onSelect={setSelectedAssetCategory}
                    showCounts={true}
                    getCounts={(category) =>
                      assetCounts[category as AssetCategoryValue]
                    }
                    getLabel={(category) =>
                      getAssetCategoryLabel(category as AssetCategoryValue)
                    }
                    ariaLabel="Filter assets by category"
                  />
                )}

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
                      // Check if this is an image
                      const isImage =
                        doc.fileType?.includes("image/") ||
                        doc.filename.match(/\.(jpg|jpeg|png|heic)$/i);

                      if (isImage) {
                        // Look up this document's index in the gallery using URL
                        // URLs are consistent between documents and gallery images
                        const galleryIndex = documentToImageIndex.get(doc.url);

                        if (
                          galleryIndex === undefined ||
                          galleryIndex < 0 ||
                          galleryIndex >= assetGalleryImages.length
                        ) {
                          return;
                        }

                        setSelectedAssetIndex(galleryIndex);
                        setAssetGalleryVisible(true);
                      } else {
                        // This is a PDF - open PDF viewer
                        router.push({
                          pathname: "/pdf-viewer",
                          params: {
                            url: encodeURIComponent(doc.url),
                            name: doc.name || doc.filename,
                            id: doc.id,
                          },
                        });
                      }
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
          {project.sharedLogs && project.sharedLogs.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.text.primary },
                ]}
              >
                Project Logs ({project.sharedLogs.length})
              </ThemedText>
              <ThemedView style={styles.logsList}>
                {project.sharedLogs.map((item, index) =>
                  renderLog(
                    item,
                    index,
                    index === (project.sharedLogs?.length ?? 0) - 1
                  )
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
        </RefreshableScrollView>
      </ThemedView>

      {/* Image Gallery Modal */}
      {galleryImages.length > 0 && (
        <ImageGalleryModal
          visible={galleryVisible}
          images={galleryImages}
          initialIndex={Math.max(
            0,
            Math.min(selectedImageIndex, galleryImages.length - 1)
          )}
          onClose={closeGallery}
        />
      )}

      {/* Asset Image Gallery - with safety check */}
      {assetGalleryVisible && assetGalleryImages.length > 0 && (
        <ImageGalleryModal
          visible={assetGalleryVisible}
          images={assetGalleryImages}
          initialIndex={Math.max(
            0,
            Math.min(selectedAssetIndex, assetGalleryImages.length - 1)
          )}
          onClose={() => {
            setAssetGalleryVisible(false);
          }}
        />
      )}

      <EditDescriptionModal
        visible={showEditDescriptionModal}
        onClose={() => setShowEditDescriptionModal(false)}
        onSave={handleUpdateDescription}
        currentDescription={displayDescription}
        isSaving={isSaving}
        error={saveError}
      />
    </>
  );
}
