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
  const { theme, isMain } = useTheme();

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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: isMain
            ? theme.colors.background.primary
            : theme.colors.background.secondary,
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
          padding: DesignTokens.spacing[5],
          backgroundColor: isMain
            ? theme.colors.background.secondary
            : theme.colors.background.card,
          marginBottom: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
        },
        projectName: {
          fontSize: DesignTokens.typography.fontSize["3xl"],
          marginBottom: DesignTokens.spacing[3],
          lineHeight: 34,
        },
        projectDescription: {
          fontSize: DesignTokens.typography.fontSize.base,
          lineHeight: 22,
          opacity: 0.7,
          marginBottom: DesignTokens.spacing[5],
        },
        metaGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: DesignTokens.spacing[4],
        },
        metaItem: {
          flex: 1,
          minWidth: "45%",
        },
        metaLabel: {
          fontSize: DesignTokens.typography.fontSize.xs,
          opacity: 0.6,
          marginBottom: DesignTokens.spacing[1],
          textTransform: "uppercase",
          fontWeight: "600",
        },
        metaValue: {
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: "600",
        },
        section: {
          backgroundColor: theme.colors.background.card,
          marginBottom: DesignTokens.spacing[4],
          padding: DesignTokens.spacing[5],
          borderRadius: DesignTokens.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.sm,
        },
        sectionTitle: {
          fontSize: DesignTokens.typography.fontSize.xl,
          marginBottom: DesignTokens.spacing[4],
        },
        picturesList: {
          paddingRight: DesignTokens.spacing[5],
        },
        pictureContainer: {
          width: 280,
          marginRight: DesignTokens.spacing[4],
          backgroundColor: isMain
            ? theme.colors.background.primary
            : theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.lg,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
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
          paddingRight: DesignTokens.spacing[5],
        },
        documentContainer: {
          width: 250,
          marginRight: DesignTokens.spacing[4],
          padding: DesignTokens.spacing[4],
          backgroundColor: isMain
            ? theme.colors.background.card
            : theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.lg,
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.interactive.primary,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
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
          paddingRight: DesignTokens.spacing[5],
        },
        logContainer: {
          width: 280,
          marginRight: DesignTokens.spacing[4],
          padding: DesignTokens.spacing[4],
          backgroundColor: isMain
            ? theme.colors.background.primary
            : theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
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
          backgroundColor: isMain
            ? theme.colors.background.card
            : theme.colors.background.secondary,
          padding: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
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
    [theme, isMain]
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
      <Pressable onPress={() => openGallery(index)}>
        <Image
          source={{ uri: item.url }}
          style={styles.picture}
          contentFit="cover"
        />
        <View style={styles.pictureOverlay}>
          <View style={styles.zoomIcon}>
            <MaterialIcons name="zoom-in" size={20} color="#333" />
          </View>
        </View>
      </Pressable>
      <ThemedView style={styles.pictureInfo}>
        <ThemedText style={styles.pictureType}>{item.type}</ThemedText>
        <ThemedText style={styles.pictureDescription}>
          {item.description}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

  const renderDocument = ({ item }: { item: any }) => (
    <ThemedView style={styles.documentContainer}>
      <ThemedText style={styles.documentName}>{item.name}</ThemedText>
      <ThemedText style={styles.documentType}>{item.type}</ThemedText>
      <ThemedText style={styles.documentDescription}>
        {item.description}
      </ThemedText>
    </ThemedView>
  );

  const renderLog = ({ item }: { item: any }) => (
    <ThemedView style={styles.logContainer}>
      <ThemedText style={styles.logDate}>
        {item.date instanceof Date ? item.date.toLocaleDateString() : item.date}
      </ThemedText>
      <ThemedText style={styles.logDescription}>{item.description}</ThemedText>
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
      <ScrollView style={styles.container}>
        {/* Hero Image */}
        <Image
          source={{ uri: project.thumbnail }}
          style={styles.heroImage}
          contentFit="cover"
        />

        {/* Project Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.projectName}>{project.name}</ThemedText>
          <ThemedText style={styles.projectDescription}>
            {project.longDescription}
          </ThemedText>

          {/* Project Meta */}
          <ThemedView style={styles.metaGrid}>
            <ThemedView style={styles.metaItem}>
              <ThemedText style={styles.metaLabel}>Status</ThemedText>
              <ThemedText style={styles.metaValue}>
                {project.status.replace("-", " ").toUpperCase()}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.metaItem}>
              <ThemedText style={styles.metaLabel}>Category</ThemedText>
              <ThemedText style={styles.metaValue}>
                {project.category.charAt(0).toUpperCase() +
                  project.category.slice(1)}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.metaItem}>
              <ThemedText style={styles.metaLabel}>Location</ThemedText>
              <ThemedText style={styles.metaValue}>
                {project.location}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.metaItem}>
              <ThemedText style={styles.metaLabel}>Estimated Cost</ThemedText>
              <ThemedText style={styles.metaValue}>
                ${project.estimatedCost?.toLocaleString() || "N/A"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Pictures Section */}
        {project.pictures && project.pictures.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Project Pictures
            </ThemedText>
            <FlatList
              data={project.pictures}
              renderItem={renderPicture}
              keyExtractor={(item, index) => `picture-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.picturesList}
            />
          </ThemedView>
        )}

        {/* Documents Section */}
        {project.documents && project.documents.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Documents</ThemedText>
            <FlatList
              data={project.documents}
              renderItem={renderDocument}
              keyExtractor={(item, index) => `document-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.documentsList}
            />
          </ThemedView>
        )}

        {/* Logs Section */}
        {project.logs && project.logs.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Project Logs</ThemedText>
            <FlatList
              data={project.logs}
              renderItem={renderLog}
              keyExtractor={(item, index) => `log-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.logsList}
            />
          </ThemedView>
        )}

        {/* Client Information */}
        {project.clientInfo && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
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
