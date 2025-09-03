import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { mockProjects } from "@/data/mockProjects";
import { Project } from "@/types";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id) {
      const foundProject = mockProjects.find((p) => p.id === id);
      setProject(foundProject || null);
    }
  }, [id]);

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
        <ThemedText style={styles.pictureType}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </ThemedText>
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
      <ThemedText style={styles.logTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.logDescription}>{item.description}</ThemedText>
      <ThemedText style={styles.logDate}>
        {item.date.toLocaleDateString()}
      </ThemedText>
      <ThemedText style={styles.logAuthor}>By {item.author}</ThemedText>
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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image
          source={{ uri: project.thumbnail }}
          style={styles.heroImage}
          contentFit="cover"
        />

        {/* Project Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.projectName}>
            {project.name}
          </ThemedText>
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
              <ThemedText style={styles.metaLabel}>Cost</ThemedText>
              <ThemedText style={styles.metaValue}>
                ${project.estimatedCost?.toLocaleString()}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Before/After Pictures */}
        {project.pictures.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Project Photos
            </ThemedText>
            <FlatList
              data={project.pictures}
              renderItem={renderPicture}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.picturesList}
            />
          </ThemedView>
        )}

        {/* Documents */}
        {project.documents.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Documents
            </ThemedText>
            <FlatList
              data={project.documents}
              renderItem={renderDocument}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.documentsList}
            />
          </ThemedView>
        )}

        {/* Project Logs */}
        {project.logs.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Project Timeline
            </ThemedText>
            <FlatList
              data={project.logs}
              renderItem={renderLog}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.logsList}
            />
          </ThemedView>
        )}

        {/* Client Info */}
        {project.clientInfo && (
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Client Information
            </ThemedText>
            <ThemedView style={styles.clientInfo}>
              <ThemedText style={styles.clientName}>
                {project.clientInfo.name}
              </ThemedText>
              <ThemedText style={styles.clientAddress}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    opacity: 0.6,
  },
  heroImage: {
    width: "100%",
    height: 300,
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  projectName: {
    fontSize: 28,
    marginBottom: 12,
    lineHeight: 34,
  },
  projectDescription: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.7,
    marginBottom: 20,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  metaItem: {
    flex: 1,
    minWidth: "45%",
  },
  metaLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  metaValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  picturesList: {
    paddingRight: 20,
  },
  pictureContainer: {
    width: 280,
    marginRight: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    overflow: "hidden",
  },
  picture: {
    width: "100%",
    height: 200,
  },
  pictureInfo: {
    padding: 16,
  },
  pictureType: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  pictureDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  documentsList: {
    paddingRight: 20,
  },
  documentContainer: {
    width: 250,
    marginRight: 16,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  documentName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  documentType: {
    fontSize: 12,
    opacity: 0.6,
    textTransform: "capitalize",
    marginBottom: 8,
  },
  documentDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  logsList: {
    paddingRight: 20,
  },
  logContainer: {
    width: 280,
    marginRight: 16,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  logTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  logDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  logDate: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  logAuthor: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
  },
  clientInfo: {
    gap: 8,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600",
  },
  clientAddress: {
    fontSize: 14,
    opacity: 0.7,
  },
  clientContact: {
    fontSize: 14,
    opacity: 0.7,
  },
});
