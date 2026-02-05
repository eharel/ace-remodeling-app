import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Pressable, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { type PhotoCategory } from "@/shared/constants";
import { PhotoPreviewSection } from "@/features/gallery/components/PhotoPreview";
import {
  AddComponentModal,
  AssetsSection,
  EditComponentModal,
  FeaturedToggle,
  ProjectLogsSection,
  ProjectMetaGrid,
  ProjectMetaGridRef,
  TestimonialSection,
} from "@/features/projects";
import { useProjectComponentSelection } from "@/features/projects/hooks/useProjectComponentSelection";
import { createProjectDetailStyles } from "@/features/projects/styles/projectDetailStyles";
import {
  Can,
  LoadingState,
  PageHeader,
  RefreshableScrollView,
  ThemedIconButton,
  ThemedText,
  ThemedView,
  Toast,
  ToastType,
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
import { CoreCategory } from "@/shared/types/ComponentCategory";
import { ProjectStatus } from "@/shared/types/Status";
import { checkProjectNumberExists } from "@/services/projects/projectsService";

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
    addComponent,
    deleteComponent,
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

  // Edit mode state - unified edit mode for the whole page
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Inline description editing state
  const [editedDescription, setEditedDescription] = useState<string>("");
  const [isSavingDescription, setIsSavingDescription] = useState<boolean>(false);

  // Ref to ProjectMetaGrid for save/cancel operations
  const metaGridRef = useRef<ProjectMetaGridRef>(null);

  // Toast state for feedback
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({ visible: false, message: "", type: "info" });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ visible: true, message, type });
  };

  // Component modal states
  const [showAddComponentModal, setShowAddComponentModal] = useState(false);
  const [showEditComponentModal, setShowEditComponentModal] = useState(false);
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [isSavingComponent, setIsSavingComponent] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);

  // Handle save - dismiss keyboard to trigger blur saves, then exit edit mode
  const handleSaveAndExit = async () => {
    // Dismiss keyboard triggers onBlur on any focused input
    Keyboard.dismiss();

    // Call saveAll on ProjectMetaGrid if available
    if (metaGridRef.current?.saveAll) {
      await metaGridRef.current.saveAll();
    }

    // Save description if changed
    if (editedDescription !== displayDescription) {
      await handleSaveDescription();
    }

    setIsEditMode(false);
    showToast("Changes saved", "success");
  };

  // Handle cancel - reset all pending changes and exit edit mode
  const handleCancelEdit = () => {
    // Reset description to original
    setEditedDescription(displayDescription);

    // Reset ProjectMetaGrid fields
    if (metaGridRef.current?.resetAll) {
      metaGridRef.current.resetAll();
    }

    setIsEditMode(false);
  };

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

  // Initialize edited description when entering edit mode or changing component
  useEffect(() => {
    if (isEditMode) {
      setEditedDescription(displayDescription);
    }
  }, [isEditMode, selectedComponent?.id]);

  const handleSaveDescription = async () => {
    if (!project) return;
    if (editedDescription === displayDescription) return; // No changes

    setIsSavingDescription(true);
    try {
      if (selectedComponent?.id) {
        await updateComponent(project.id, selectedComponent.id, {
          description: editedDescription,
        });
      } else {
        await updateProjectContext(project.id, { description: editedDescription });
      }
    } catch (error) {
      // Reset to original on error
      setEditedDescription(displayDescription);
    } finally {
      setIsSavingDescription(false);
    }
  };

  // Toggle featured status for the selected component
  const handleToggleFeatured = async (value: boolean) => {
    if (!project || !selectedComponent?.id) return;

    await updateComponent(project.id, selectedComponent.id, {
      isFeatured: value,
    });
  };

  // Update project status
  const handleStatusChange = async (status: ProjectStatus) => {
    if (!project) return;
    try {
      await updateProjectContext(project.id, { status });
      showToast("Status updated", "success");
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  // Update component category
  const handleCategoryChange = async (category: CoreCategory) => {
    if (!project || !selectedComponent?.id) return;
    try {
      await updateComponent(project.id, selectedComponent.id, { category });
      showToast("Category updated", "success");
    } catch (error) {
      showToast("Failed to update category", "error");
    }
  };

  // Update project location
  const handleLocationChange = async (location: { neighborhood?: string; zipCode?: string }) => {
    if (!project) return;
    try {
      await updateProjectContext(project.id, {
        location: {
          ...project.location,
          ...location,
        },
      });
      showToast("Location updated", "success");
    } catch (error) {
      showToast("Failed to update location", "error");
    }
  };

  // Update project number with validation
  const handleProjectNumberChange = async (
    newNumber: string
  ): Promise<{ valid: boolean; error?: string }> => {
    if (!project) return { valid: false, error: "Project not found" };
    if (!newNumber.trim()) {
      showToast("Project number is required", "error");
      return { valid: false, error: "Project number is required" };
    }

    // Check if the number already exists (excluding current project)
    try {
      const exists = await checkProjectNumberExists(newNumber.trim(), project.id);
      if (exists) {
        showToast("This project number already exists", "error");
        return { valid: false, error: "This project number already exists" };
      }
    } catch (error) {
      showToast("Failed to validate project number", "error");
      return { valid: false, error: "Failed to validate project number" };
    }

    // Update the project
    try {
      await updateProjectContext(project.id, { number: newNumber.trim() });
      showToast("Project number updated", "success");
      return { valid: true };
    } catch (error) {
      showToast("Failed to update project number", "error");
      return { valid: false, error: "Failed to update project number" };
    }
  };

  // Get the featured status for the currently viewed component
  // Featuring is now per-component only
  const isFeatured = useMemo(() => {
    return selectedComponent?.isFeatured ?? false;
  }, [selectedComponent]);

  // Add new component handler
  const handleAddComponent = async (input: {
    category: CoreCategory;
    subcategory?: string;
    name?: string;
  }) => {
    if (!project) return;
    setIsAddingComponent(true);
    setComponentError(null);
    try {
      const newComponent = await addComponent(project.id, input);
      setShowAddComponentModal(false);
      setSelectedComponent(newComponent.id);
      showToast("Component added", "success");
    } catch (error) {
      setComponentError(
        error instanceof Error ? error.message : "Failed to add component"
      );
    } finally {
      setIsAddingComponent(false);
    }
  };

  // Edit component handler (name/subcategory)
  const handleEditComponent = async (updates: {
    name?: string;
    subcategory?: string;
  }) => {
    if (!project || !selectedComponent) return;
    setIsSavingComponent(true);
    setComponentError(null);
    try {
      await updateComponent(project.id, selectedComponent.id, updates);
      setShowEditComponentModal(false);
      showToast("Component updated", "success");
    } catch (error) {
      setComponentError(
        error instanceof Error ? error.message : "Failed to update component"
      );
    } finally {
      setIsSavingComponent(false);
    }
  };

  // Delete component handler
  const handleDeleteComponent = async () => {
    if (!project || !selectedComponent) return;
    setIsSavingComponent(true);
    setComponentError(null);
    try {
      // Find another component to select after deletion
      const remainingComponents = project.components.filter(
        (c) => c.id !== selectedComponent.id
      );
      const nextComponent = remainingComponents[0];

      await deleteComponent(project.id, selectedComponent.id);
      setShowEditComponentModal(false);

      // Select the next available component
      if (nextComponent) {
        setSelectedComponent(nextComponent.id);
      }
      showToast("Component deleted", "success");
    } catch (error) {
      setComponentError(
        error instanceof Error ? error.message : "Failed to delete component"
      );
    } finally {
      setIsSavingComponent(false);
    }
  };

  // Can delete if there's more than one component
  const canDeleteComponent = (project?.components.length ?? 0) > 1;

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
          rightAction={
            <Can edit>
              {isEditMode ? (
                <View style={{ flexDirection: "row", gap: DesignTokens.spacing[2] }}>
                  <ThemedIconButton
                    icon="close"
                    onPress={handleCancelEdit}
                    variant="ghost"
                    size="small"
                    accessibilityLabel="Cancel editing"
                  />
                  <ThemedIconButton
                    icon="check"
                    onPress={handleSaveAndExit}
                    variant="success"
                    size="small"
                    accessibilityLabel="Save changes"
                  />
                </View>
              ) : (
                <ThemedIconButton
                  icon="edit"
                  onPress={() => setIsEditMode(true)}
                  variant="ghost"
                  size="small"
                  accessibilityLabel="Edit project"
                />
              )}
            </Can>
          }
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
          {(project.components.length > 1 || isEditMode) && sortedComponents.length > 0 && (
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              paddingRight: DesignTokens.spacing[4],
              paddingVertical: DesignTokens.spacing[2],
              gap: DesignTokens.spacing[2],
            }}>
              <View style={{ flex: 1 }}>
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
                  renderSuffix={isEditMode ? (componentId, isSelected) => {
                    // Only show edit icon on selected pill
                    if (!isSelected) return null;
                    return (
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          setShowEditComponentModal(true);
                        }}
                        hitSlop={8}
                        accessibilityLabel="Edit component"
                      >
                        <MaterialIcons
                          name="edit"
                          size={16}
                          color="#FFFFFF"
                        />
                      </Pressable>
                    );
                  } : undefined}
                  ariaLabel="Select project component"
                />
              </View>
              {/* Add button in edit mode */}
              {isEditMode && (
                <Can edit>
                  <ThemedIconButton
                    icon="add"
                    onPress={() => setShowAddComponentModal(true)}
                    variant="ghost"
                    size="small"
                    accessibilityLabel="Add component"
                  />
                </Can>
              )}
            </View>
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
              {/* Description - inline editable in edit mode */}
              {isEditMode ? (
                <TextInput
                  key={`description-input-${selectedComponent?.id || "default"}`}
                  style={[
                    styles.editableDescription,
                    styles.projectDescription,
                    {
                      borderColor: theme.colors.border.accent,
                      color: theme.colors.text.secondary,
                    },
                  ]}
                  value={editedDescription}
                  onChangeText={setEditedDescription}
                  onBlur={handleSaveDescription}
                  placeholder="Add a description..."
                  placeholderTextColor={theme.colors.text.tertiary}
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel="Edit description"
                  editable={!isSavingDescription}
                />
              ) : (
                displayDescription ? (
                  <ThemedText
                    key={`description-${selectedComponent?.id || "default"}`}
                    style={[
                      styles.projectDescription,
                      { color: theme.colors.text.secondary },
                    ]}
                  >
                    {displayDescription}
                  </ThemedText>
                ) : null
              )}
            </ThemedView>

            <ProjectMetaGrid
              ref={metaGridRef}
              project={project}
              selectedComponent={selectedComponent}
              displayTimeline={displayTimeline}
              isEditMode={isEditMode}
              onStatusChange={handleStatusChange}
              onCategoryChange={handleCategoryChange}
              onLocationChange={handleLocationChange}
              onProjectNumberChange={handleProjectNumberChange}
            />

            {/* Featured toggle - only shown in edit mode */}
            {selectedComponent && isEditMode && (
              <Can edit>
                <View style={{ marginTop: DesignTokens.spacing[4] }}>
                  <FeaturedToggle
                    isFeatured={isFeatured}
                    onToggle={handleToggleFeatured}
                  />
                </View>
              </Can>
            )}
          </ThemedView>

          <PhotoPreviewSection
            photos={currentMedia}
            title="Project Photos"
            isEditMode={isEditMode}
            activePhotoCategory={activePhotoCategory}
            onPhotoCategoryChange={(newPhotoCategory) =>
              router.setParams({ activePhotoCategory: newPhotoCategory })
            }
            onOpenGrid={(activePhotoCategory, editMode) =>
              project?.id &&
              router.push({
                pathname: "/project/[id]/photos",
                params: {
                  id: project.id,
                  componentId: selectedComponent?.id,
                  activePhotoCategory: activePhotoCategory || "all",
                  editMode: editMode ? "true" : undefined,
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
            isEditMode={isEditMode}
          />

          <ProjectLogsSection logs={project.sharedLogs} />

          <TestimonialSection testimonial={project.testimonial} />
        </RefreshableScrollView>
      </ThemedView>

      {/* Toast for feedback */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      {/* Add Component Modal */}
      <AddComponentModal
        visible={showAddComponentModal}
        onClose={() => {
          setShowAddComponentModal(false);
          setComponentError(null);
        }}
        onAdd={handleAddComponent}
        isAdding={isAddingComponent}
        error={componentError}
      />

      {/* Edit Component Modal */}
      <EditComponentModal
        visible={showEditComponentModal}
        onClose={() => {
          setShowEditComponentModal(false);
          setComponentError(null);
        }}
        onSave={handleEditComponent}
        onDelete={handleDeleteComponent}
        component={selectedComponent}
        isSaving={isSavingComponent}
        canDelete={canDeleteComponent}
        error={componentError}
      />
    </>
  );
}
