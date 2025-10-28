import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ImageGalleryModal } from "@/components/gallery";
import { ThemedText, ThemedView } from "@/components/themed";
import { useProjects, useTheme } from "@/contexts";
// Comment out mock data for now (keeping for fallback)
// import { mockProjects } from "@/data/mockProjects";
import { DesignTokens } from "@/themes";
import { Project } from "@/types";
import { getProjectDuration } from "@/utils/duration";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [pressedImageIndex, setPressedImageIndex] = useState<number | null>(
    null
  );
  const { theme } = useTheme();

  const screenWidth = Dimensions.get("window").width;
  const gridPadding = DesignTokens.spacing[6] * 2; // left + right padding
  const gridGap = DesignTokens.spacing[3];
  const imageWidth = (screenWidth - gridPadding - gridGap * 2) / 3; // 3 columns with 2 gaps

  useEffect(() => {
    if (id) {
      // Use Firebase data instead of mock data
      const foundProject = projects.find((p) => p.id === id);
      setProject(foundProject || null);

      // Fallback to mock data if needed (commented out for now)
      // const foundProject = mockProjects.find((p) => p.id === id);
    }
  }, [id, projects]);

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
          fontSize: DesignTokens.typography.fontSize.xs,
          fontWeight: DesignTokens.typography.fontWeight.bold,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        projectName: {
          fontSize: DesignTokens.typography.fontSize["4xl"],
          fontWeight: DesignTokens.typography.fontWeight.extrabold,
          marginBottom: DesignTokens.spacing[2],
          lineHeight:
            DesignTokens.typography.fontSize["4xl"] *
            DesignTokens.typography.lineHeight.tight,
        },
        projectDescription: {
          fontSize: DesignTokens.typography.fontSize.lg,
          lineHeight:
            DesignTokens.typography.fontSize.lg *
            DesignTokens.typography.lineHeight.normal,
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
          fontSize: DesignTokens.typography.fontSize.xs,
          marginBottom: 0,
          textTransform: "uppercase",
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          flex: 1,
        },
        metaValue: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.bold,
          flex: 1,
          textAlign: "right",
        },
        section: {
          backgroundColor: theme.colors.background.card,
          marginBottom: DesignTokens.spacing[4],
          padding: DesignTokens.spacing[6],
          borderRadius: DesignTokens.borderRadius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.md,
        },
        sectionTitle: {
          fontSize: DesignTokens.typography.fontSize["2xl"],
          fontWeight: DesignTokens.typography.fontWeight.bold,
          marginBottom: DesignTokens.spacing[6],
        },
        picturesGrid: {
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: DesignTokens.spacing[4],
        },
        gridImageContainer: {
          aspectRatio: 4 / 3,
          marginBottom: DesignTokens.spacing[3],
          borderRadius: DesignTokens.borderRadius.lg,
          overflow: "hidden",
          backgroundColor: theme.colors.background.secondary,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
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
          fontSize: DesignTokens.typography.fontSize.sm,
          marginTop: DesignTokens.spacing[1],
          opacity: 0.7,
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
          fontSize: DesignTokens.typography.fontSize.sm,
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
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.lg,
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
        logsList: {
          flexDirection: "column",
        },
        logContainer: {
          width: "100%",
          marginBottom: DesignTokens.spacing[3],
          padding: DesignTokens.spacing[4],
          backgroundColor: theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.lg,
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
          fontSize: DesignTokens.typography.fontSize.xs,
          opacity: 0.6,
          marginBottom: DesignTokens.spacing[1],
        },
        logDescription: {
          fontSize: DesignTokens.typography.fontSize.sm,
          lineHeight:
            DesignTokens.typography.fontSize.sm *
            DesignTokens.typography.lineHeight.normal,
        },
      }),
    [theme]
  );

  if (!project) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Project Details",
            headerBackTitle: "Back",
          }}
        />
        <ThemedView style={styles.container}>
          <ThemedView style={styles.errorState}>
            <ThemedText style={styles.errorText}>Project not found</ThemedText>
          </ThemedView>
        </ThemedView>
      </>
    );
  }

  const renderGridImage = (
    item: any,
    index: number,
    isMoreCell: boolean = false
  ) => {
    const isPressed = pressedImageIndex === index;

    return (
      <ThemedView
        key={`grid-image-${index}`}
        style={[styles.gridImageContainer, { width: imageWidth }]}
      >
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
          />
          {isMoreCell && (
            <ThemedView style={styles.moreImagesOverlay}>
              <ThemedText style={styles.moreImagesText}>
                +{project.pictures.length - 2} more photos
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
          title: project.name,
          headerBackTitle: "Back",
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: DesignTokens.spacing[20] }}
      >
        {/* Hero Image */}
        <Image
          source={{ uri: project.thumbnail }}
          style={styles.heroImage}
          contentFit="cover"
        />

        {/* Project Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.headerContent}>
            <ThemedText style={styles.projectName}>{project.name}</ThemedText>
            <ThemedText
              style={[
                styles.projectDescription,
                { color: theme.colors.text.secondary },
              ]}
            >
              {project.longDescription}
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
                {project.category.charAt(0).toUpperCase() +
                  project.category.slice(1)}
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
                {getProjectDuration(project)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Pictures Section */}
        <ThemedView style={styles.section}>
          <ThemedText
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            Project Photos ({project.pictures?.length || 0})
          </ThemedText>
          <ThemedText
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.text.secondary },
            ]}
          >
            Tap any photo to view gallery
          </ThemedText>

          {project.pictures && project.pictures.length > 0 ? (
            <ThemedView style={styles.picturesGrid}>
              {project.pictures
                .slice(0, 2)
                .map((item, index) => renderGridImage(item, index))}
              {project.pictures.length > 2 &&
                renderGridImage(project.pictures[2], 2, true)}
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
                No pictures available
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Documents Section */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText
              style={[
                styles.sectionTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              Documents
            </ThemedText>
            {project.documents && project.documents.length > 0 && (
              <Pressable
                style={styles.viewAllButton}
                onPress={() => router.push(`/project/${project.id}/documents`)}
                accessible={true}
                accessibilityLabel="View all documents"
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
            )}
          </View>
          {project.documents && project.documents.length > 0 ? (
            <ThemedView style={styles.documentsPreview}>
              {project.documents
                .slice(0, 2)
                .map((item, index) => renderDocumentPreview(item, index))}
              {project.documents.length > 2 && (
                <Pressable
                  style={styles.moreDocumentsButton}
                  onPress={() =>
                    router.push(`/project/${project.id}/documents`)
                  }
                  accessible={true}
                  accessibilityLabel={`View ${
                    project.documents.length - 2
                  } more documents`}
                  accessibilityRole="button"
                >
                  <ThemedText style={styles.moreDocumentsText}>
                    +{project.documents.length - 2} more
                  </ThemedText>
                </Pressable>
              )}
            </ThemedView>
          ) : (
            <ThemedView style={[styles.emptyState, { marginTop: 0 }]}>
              <MaterialIcons
                name="description"
                size={48}
                color={theme.colors.text.tertiary}
              />
              <ThemedText
                style={[
                  styles.emptyStateText,
                  { color: theme.colors.text.secondary },
                ]}
              >
                No documents available
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Logs Section */}
        <ThemedView style={styles.section}>
          <ThemedText
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            Project Logs
          </ThemedText>
          {project.logs && project.logs.length > 0 ? (
            <ThemedView style={styles.logsList}>
              {project.logs.map((item, index) =>
                renderLog(item, index, index === project.logs.length - 1)
              )}
            </ThemedView>
          ) : (
            <ThemedView style={styles.emptyState}>
              <MaterialIcons
                name="timeline"
                size={48}
                color={theme.colors.text.tertiary}
              />
              <ThemedText
                style={[
                  styles.emptyStateText,
                  { color: theme.colors.text.secondary },
                ]}
              >
                No project logs available
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Scope Section */}
        {project.scope && (
          <ThemedView style={styles.section}>
            <ThemedText
              style={[
                styles.sectionTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              Project Scope
            </ThemedText>
            <ThemedText
              style={[
                styles.projectDescription,
                { color: theme.colors.text.secondary },
              ]}
            >
              {project.scope}
            </ThemedText>
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
                borderRadius: DesignTokens.borderRadius.xl,
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

      {/* Image Gallery Modal */}
      {project && project.pictures && project.pictures.length > 0 && (
        <ImageGalleryModal
          visible={galleryVisible}
          images={project.pictures}
          initialIndex={selectedImageIndex}
          onClose={closeGallery}
        />
      )}
    </>
  );
}
