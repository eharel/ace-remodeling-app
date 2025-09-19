import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ImageGalleryModal } from "@/components/gallery";
import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { mockProjects } from "@/data/mockProjects";
import { DesignTokens } from "@/themes";
import { Project } from "@/types";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    if (id) {
      const foundProject = mockProjects.find((p) => p.id === id);
      setProject(foundProject || null);
    }
  }, [id]);

  const openGallery = (index: number) => {
    console.log(`🖼️ Opening gallery at index: ${index}`);
    setSelectedImageIndex(index);
    setGalleryVisible(true);
  };

  const closeGallery = () => {
    setGalleryVisible(false);
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
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        projectName: {
          fontSize: DesignTokens.typography.fontSize["4xl"],
          fontWeight: "800",
          marginBottom: DesignTokens.spacing[2],
          lineHeight: 40,
        },
        projectDescription: {
          fontSize: DesignTokens.typography.fontSize.lg,
          lineHeight: 26,
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
          fontWeight: "600",
          flex: 1,
        },
        metaValue: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: "700",
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
          fontWeight: "700",
          marginBottom: DesignTokens.spacing[6],
        },
        picturesList: {
          paddingRight: DesignTokens.spacing[5],
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
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          justifyContent: "center",
          alignItems: "center",
          opacity: 0,
        },
        pictureOverlayVisible: {
          opacity: 1,
        },
        zoomIcon: {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 20,
          width: 40,
          height: 40,
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
        },
        documentContainer: {
          width: "100%",
          marginBottom: DesignTokens.spacing[3],
          padding: DesignTokens.spacing[4],
          backgroundColor: theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.lg,
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.interactive.primary,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          flexDirection: "row",
          alignItems: "flex-start",
        },
        documentIcon: {
          marginRight: DesignTokens.spacing[3],
          marginTop: DesignTokens.spacing[1],
        },
        documentContent: {
          flex: 1,
        },
        documentContainerLast: {
          marginBottom: 0,
        },
        documentName: {
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: "600",
          marginBottom: DesignTokens.spacing[2],
        },
        documentType: {
          fontSize: DesignTokens.typography.fontSize.xs,
          opacity: 0.6,
          textTransform: "capitalize",
          marginBottom: DesignTokens.spacing[2],
        },
        documentDescription: {
          fontSize: DesignTokens.typography.fontSize.sm,
          opacity: 0.7,
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
          lineHeight: 20,
        },
        clientInfo: {
          backgroundColor: theme.colors.background.secondary,
          padding: DesignTokens.spacing[6],
          borderRadius: DesignTokens.borderRadius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
        },
        clientName: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: "600",
          marginBottom: DesignTokens.spacing[2],
        },
        clientDetails: {
          fontSize: DesignTokens.typography.fontSize.sm,
          opacity: 0.7,
          lineHeight: 20,
        },
        clientContact: {
          fontSize: DesignTokens.typography.fontSize.sm,
          opacity: 0.7,
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

  const renderPicture = ({ item, index }: { item: any; index: number }) => (
    <ThemedView style={styles.pictureContainer}>
      <Pressable
        onPress={() => openGallery(index)}
        style={({ pressed }) => [pressed && styles.pictureContainerPressed]}
      >
        <Image
          source={{ uri: item.url }}
          style={styles.picture}
          contentFit="cover"
        />
      </Pressable>
      <ThemedView style={styles.pictureInfo}>
        <ThemedText style={styles.pictureType}>{item.type}</ThemedText>
        <ThemedText style={styles.pictureDescription}>
          {item.description}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

  const renderDocument = (item: any, index: number, isLast: boolean) => (
    <ThemedView
      key={`document-${index}`}
      style={[styles.documentContainer, isLast && styles.documentContainerLast]}
    >
      <MaterialIcons
        name={getDocumentIcon(item.type) as any}
        size={24}
        color={theme.colors.interactive.primary}
        style={styles.documentIcon}
      />
      <ThemedView style={styles.documentContent}>
        <ThemedText style={styles.documentName}>{item.name}</ThemedText>
        <ThemedText style={styles.documentType}>{item.type}</ThemedText>
        <ThemedText style={styles.documentDescription}>
          {item.description}
        </ThemedText>
      </ThemedView>
    </ThemedView>
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
                {project.location}
              </ThemedText>
            </ThemedView>
            <ThemedView style={[styles.metaItem, styles.metaItemLast]}>
              <ThemedText
                style={[
                  styles.metaLabel,
                  { color: theme.colors.text.secondary },
                ]}
              >
                Estimated Cost
              </ThemedText>
              <ThemedText style={styles.metaValue}>
                ${project.estimatedCost?.toLocaleString() || "N/A"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Pictures Section */}
        <ThemedView style={styles.section}>
          <ThemedText
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            Project Pictures
          </ThemedText>
          {project.pictures && project.pictures.length > 0 ? (
            <>
              <FlatList
                data={project.pictures}
                renderItem={renderPicture}
                keyExtractor={(item, index) => `picture-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.picturesList}
              />
              <ThemedText
                style={[
                  styles.imageCounter,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {project.pictures.length} image
                {project.pictures.length !== 1 ? "s" : ""}
              </ThemedText>
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

        {/* Documents Section */}
        <ThemedView style={styles.section}>
          <ThemedText
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            Documents
          </ThemedText>
          {project.documents && project.documents.length > 0 ? (
            <ThemedView style={styles.documentsList}>
              {project.documents.map((item, index) =>
                renderDocument(
                  item,
                  index,
                  index === project.documents.length - 1
                )
              )}
            </ThemedView>
          ) : (
            <ThemedView style={styles.emptyState}>
              <MaterialIcons
                name="folder-open"
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

        {/* Client Information */}
        {project.clientInfo && (
          <ThemedView style={styles.section}>
            <ThemedText
              style={[
                styles.sectionTitle,
                { color: theme.colors.text.primary },
              ]}
            >
              Client Information
            </ThemedText>
            <ThemedView style={styles.clientInfo}>
              <ThemedText style={styles.clientName}>
                {project.clientInfo.name}
              </ThemedText>
              <ThemedText style={styles.clientDetails}>
                {project.clientInfo.address}
              </ThemedText>
              {project.clientInfo.phone && (
                <ThemedText style={styles.clientContact}>
                  {project.clientInfo.phone}
                </ThemedText>
              )}
              {project.clientInfo.email && (
                <ThemedText style={styles.clientContact}>
                  {project.clientInfo.email}
                </ThemedText>
              )}
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
