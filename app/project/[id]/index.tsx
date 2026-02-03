import { EditButton } from "@/shared/components/EditButton";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { type PhotoCategory } from "@/shared/constants";
import { PhotoPreviewSection } from "@/features/gallery/components/PhotoPreview";
import {
  AssetsSection,
  EditDescriptionModal,
  FeaturedToggle,
  ProjectLogsSection,
  ProjectMetaGrid,
  TestimonialSection,
} from "@/features/projects";
import { useProjectComponentSelection } from "@/features/projects/hooks/useProjectComponentSelection";
import { createProjectDetailStyles } from "@/features/projects/styles/projectDetailStyles";
import {
  Can,
  LoadingState,
  PageHeader,
  RefreshableScrollView,
  ThemedText,
  ThemedView,
} from "@/shared/components";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { useProjects, useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import {
  getCategoryLabel,
  getProjectThumbnail,
  getSubcategoryLabel,
  ProjectComponent,
} from "@/shared/types";

export default function ProjectDetailScreen() {
  const {
    id,
    componentId,
    activePhotoCategory = "all",
  } = useLocalSearchParams<{
    id: string;
    componentId?: string;
    activePhotoCategory?: PhotoCategory;
  }>();
  const {
    projects,
    isLoading,
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

  // Modal state
  const [showEditDescriptionModal, setShowEditDescriptionModal] =
    useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Preload all component images when project loads
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

        await Promise.all(allHeroImages.map((url) => Image.prefetch(url)));

        // Preload first 6 thumbnails from each component
        const allThumbnails = project.components.flatMap((c) =>
          (c.media || [])
            .slice(0, 6)
            .map((m) => m.url)
            .filter(Boolean),
        ) as string[];

        await Promise.all(allThumbnails.map((url) => Image.prefetch(url)));
      } catch {
        // Silently fail - preloading is best effort
      }
    };

    preloadImages();
  }, [project]);

  /**
   * Get display label for a component pill
   */
  const getComponentLabel = (component: ProjectComponent): string => {
    if (component.subcategory) {
      return getSubcategoryLabel(component.subcategory);
    }
    return getCategoryLabel(component.category);
  };

  const displayDescription = useMemo(() => {
    if (!project) return "";
    return selectedComponent?.description ?? project.description ?? "";
  }, [selectedComponent, project]);

  const displayTimeline = useMemo(() => {
    if (!project) return null;
    return selectedComponent?.timeline || project.timeline || null;
  }, [project, selectedComponent]);

  const heroImageUrl = useMemo(() => {
    if (!project) return "";
    return getProjectThumbnail(project, selectedComponent || undefined);
  }, [project, selectedComponent]);

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
        error instanceof Error ? error.message : "Failed to update description",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFeatured = async (value: boolean) => {
    if (!project) return;

    if (selectedComponent?.id) {
      await updateComponent(project.id, selectedComponent.id, {
        isFeatured: value,
      });
    } else {
      await updateProjectContext(project.id, { isFeatured: value });
    }
  };

  // Get the current featured status (component level takes precedence)
  const isFeatured = useMemo(() => {
    const result = selectedComponent
      ? (selectedComponent.isFeatured ?? project?.isFeatured ?? false)
      : (project?.isFeatured ?? false);

    console.log("[FeaturedToggle] isFeatured calculation:", {
      selectedComponentId: selectedComponent?.id,
      selectedComponentIsFeatured: selectedComponent?.isFeatured,
      projectIsFeatured: project?.isFeatured,
      result,
    });

    return result;
  }, [selectedComponent, project]);

  const styles = useMemo(() => createProjectDetailStyles(theme), [theme]);

  if (isLoading && !project) {
    return (
      <ThemedView style={styles.container}>
        <PageHeader title="Project Details" showBack={true} backLabel="Back" />
        <LoadingState message="Loading project..." />
      </ThemedView>
    );
  }

  if (!project) {
    return (
      <ThemedView style={styles.container}>
        <PageHeader title="Project Details" showBack={true} backLabel="Back" />
        <ThemedView style={styles.errorState}>
          <ThemedText style={styles.errorText}>Project not found</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <>
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
          {/* Hero Image */}
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

          {/* Component Selector */}
          {project.components.length > 1 && sortedComponents.length > 0 && (
            <SegmentedControl
              variant="pills"
              options={sortedComponents.map((c) => c.id) as readonly string[]}
              selected={selectedComponent?.id || sortedComponents[0].id}
              onSelect={setSelectedComponent}
              getLabel={(componentId) => {
                const component = sortedComponents.find(
                  (c) => c.id === componentId,
                );
                return component ? getComponentLabel(component) : componentId;
              }}
              ariaLabel="Select project component"
            />
          )}

          {/* Project Header */}
          <ThemedView style={styles.header}>
            <ThemedView style={styles.headerContent}>
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

            <ProjectMetaGrid
              project={project}
              selectedComponent={selectedComponent}
              displayTimeline={displayTimeline}
            />

            <Can edit>
              <View style={{ marginTop: DesignTokens.spacing[4] }}>
                <FeaturedToggle
                  isFeatured={isFeatured}
                  onToggle={handleToggleFeatured}
                />
              </View>
            </Can>
          </ThemedView>

          <PhotoPreviewSection
            photos={currentMedia}
            title="Project Photos"
            activePhotoCategory={activePhotoCategory}
            onPhotoCategoryChange={(newPhotoCategory) =>
              router.setParams({ activePhotoCategory: newPhotoCategory })
            }
            onOpenGrid={(activePhotoCategory) =>
              project?.id &&
              router.push({
                pathname: "/project/[id]/photos",
                params: {
                  id: project.id,
                  componentId: selectedComponent?.id,
                  activePhotoCategory: activePhotoCategory || "all",
                },
              })
            }
            onOpenImage={(index) =>
              project?.id &&
              router.push({
                pathname: "/project/[id]/photos/viewer",
                params: {
                  id: project.id,
                  initialIndex: index,
                  componentId: selectedComponent?.id,
                  activePhotoCategory: activePhotoCategory || "all",
                },
              })
            }
          />

          <AssetsSection
            documents={currentDocuments}
            projectId={project.id}
            selectedComponentId={selectedComponent?.id || null}
          />

          <ProjectLogsSection logs={project.sharedLogs} />

          <TestimonialSection testimonial={project.testimonial} />
        </RefreshableScrollView>
      </ThemedView>

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
