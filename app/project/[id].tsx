import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet } from "react-native";

import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { mockProjects } from "@/data/mockProjects";
import { Project } from "@/types";
import { styling } from "@/utils/styling";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (id) {
      const foundProject = mockProjects.find((p) => p.id === id);
      setProject(foundProject || null);
    }
  }, [id]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.secondary,
    },
    errorState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: styling.spacing(10),
    },
    errorText: {
      fontSize: styling.fontSize("lg"),
      opacity: 0.6,
    },
    heroImage: {
      width: "100%",
      height: 300,
    },
    header: {
      padding: styling.spacing(5),
      backgroundColor: theme.colors.background.card,
      marginBottom: styling.spacing(4),
      borderRadius: styling.borderRadius("lg"),
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      ...styling.shadow("sm"),
    },
    projectName: {
      fontSize: styling.fontSize("3xl"),
      marginBottom: styling.spacing(3),
      lineHeight: 34,
    },
    projectDescription: {
      fontSize: styling.fontSize("base"),
      lineHeight: 22,
      opacity: 0.7,
      marginBottom: styling.spacing(5),
    },
    metaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: styling.spacing(4),
    },
    metaItem: {
      flex: 1,
      minWidth: "45%",
    },
    metaLabel: {
      fontSize: styling.fontSize("xs"),
      opacity: 0.6,
      marginBottom: styling.spacing(1),
      textTransform: "uppercase",
      fontWeight: "600",
    },
    metaValue: {
      fontSize: styling.fontSize("base"),
      fontWeight: "600",
    },
    section: {
      backgroundColor: theme.colors.background.card,
      marginBottom: styling.spacing(4),
      padding: styling.spacing(5),
      borderRadius: styling.borderRadius("lg"),
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      ...styling.shadow("sm"),
    },
    sectionTitle: {
      fontSize: styling.fontSize("xl"),
      marginBottom: styling.spacing(4),
    },
    picturesList: {
      paddingRight: styling.spacing(5),
    },
    pictureContainer: {
      width: 280,
      marginRight: styling.spacing(4),
      backgroundColor: theme.colors.background.secondary,
      borderRadius: styling.borderRadius("lg"),
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    picture: {
      width: "100%",
      height: 200,
    },
    pictureInfo: {
      padding: styling.spacing(4),
    },
    pictureType: {
      fontSize: styling.fontSize("sm"),
      fontWeight: "600",
      marginBottom: styling.spacing(1),
      textTransform: "capitalize",
    },
    pictureDescription: {
      fontSize: styling.fontSize("sm"),
      opacity: 0.7,
    },
    documentsList: {
      paddingRight: styling.spacing(5),
    },
    documentContainer: {
      width: 250,
      marginRight: styling.spacing(4),
      padding: styling.spacing(4),
      backgroundColor: theme.colors.background.secondary,
      borderRadius: styling.borderRadius("lg"),
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.interactive.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    documentName: {
      fontSize: styling.fontSize("base"),
      fontWeight: "600",
      marginBottom: styling.spacing(2),
    },
    documentType: {
      fontSize: styling.fontSize("xs"),
      opacity: 0.6,
      textTransform: "capitalize",
      marginBottom: styling.spacing(2),
    },
    documentDescription: {
      fontSize: styling.fontSize("sm"),
      opacity: 0.7,
    },
    logsList: {
      paddingRight: styling.spacing(5),
    },
    logContainer: {
      width: 280,
      marginRight: styling.spacing(4),
      padding: styling.spacing(4),
      backgroundColor: theme.colors.background.secondary,
      borderRadius: styling.borderRadius("lg"),
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    logDate: {
      fontSize: styling.fontSize("xs"),
      opacity: 0.6,
      marginBottom: styling.spacing(1),
    },
    logDescription: {
      fontSize: styling.fontSize("sm"),
      lineHeight: 20,
    },
    clientInfo: {
      backgroundColor: theme.colors.background.secondary,
      padding: styling.spacing(4),
      borderRadius: styling.borderRadius("lg"),
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    clientName: {
      fontSize: styling.fontSize("lg"),
      fontWeight: "600",
      marginBottom: styling.spacing(2),
    },
    clientDetails: {
      fontSize: styling.fontSize("sm"),
      opacity: 0.7,
      lineHeight: 20,
    },
    clientContact: {
      fontSize: styling.fontSize("sm"),
      opacity: 0.7,
    },
  });

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

  const renderPicture = ({ item }: { item: any }) => (
    <ThemedView style={styles.pictureContainer}>
      <Image
        source={{ uri: item.url }}
        style={styles.picture}
        contentFit="cover"
      />
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
    </>
  );
}
