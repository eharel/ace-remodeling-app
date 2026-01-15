import { StyleSheet } from "react-native";
import { DesignTokens } from "@/shared/themes";
import { commonStyles } from "@/shared/utils";
import type { Theme } from "@/shared/themes/base/types";

/**
 * Creates styles for the ProjectDetailScreen component
 * @param theme - The current theme object
 * @returns StyleSheet object with all component styles
 */
export const createProjectDetailStyles = (theme: Theme) =>
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
      marginTop: DesignTokens.spacing[2], // Add space for status badge
    },
    statusBadge: {
      alignSelf: "flex-end",
      marginBottom: DesignTokens.spacing[2],
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
    editButtonContainer: {
      alignItems: "flex-end", // Push button to right
      marginBottom: DesignTokens.spacing[2], // Space before description
      marginTop: DesignTokens.spacing[1], // Space after component name (if present)
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
    metaValuePill: {
      alignItems: "flex-end",
    },
    statusPill: {
      paddingHorizontal: DesignTokens.spacing[3],
      paddingVertical: DesignTokens.spacing[1],
      borderRadius: DesignTokens.borderRadius.full,
      minWidth: 80,
      alignItems: "center",
    },
    statusPillText: {
      ...commonStyles.text.badge,
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
  });
