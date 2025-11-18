import {
  MediaAsset,
  MediaStage,
  MEDIA_STAGES,
} from "@/core/types";

/**
 * Configuration for a gallery tab
 */
export interface GalleryTab {
  /** Unique key for React rendering */
  key: string;

  /** Display label for the tab */
  label: string;

  /** Stage to filter by (null = show all) */
  stage: MediaStage | null;
}

/**
 * Human-readable labels for media stages
 * Maps stage values to display-friendly text
 */
const STAGE_LABELS: Record<MediaStage, string> = {
  [MEDIA_STAGES.BEFORE]: "Before",
  [MEDIA_STAGES.AFTER]: "After",
  [MEDIA_STAGES.IN_PROGRESS]: "In Progress",
  [MEDIA_STAGES.RENDERINGS]: "Renderings",
  [MEDIA_STAGES.OTHER]: "Other",
};

/**
 * Get display label for a media stage
 *
 * @param stage - The media stage to get label for
 * @returns Human-readable label for the stage
 */
export function getStageLabel(stage: MediaStage): string {
  return STAGE_LABELS[stage] || stage;
}

/**
 * Logical display order for media stages (timeline order)
 * Stages appear in this order in gallery tabs
 */
const STAGE_ORDER: MediaStage[] = [
  MEDIA_STAGES.BEFORE,
  MEDIA_STAGES.IN_PROGRESS,
  MEDIA_STAGES.AFTER,
  MEDIA_STAGES.RENDERINGS,
  MEDIA_STAGES.OTHER,
];

/**
 * Generate gallery tabs based on available media stages
 *
 * Scans media array to find which stages have content, then creates
 * tabs only for stages that exist. Always includes "All" tab first.
 *
 * LOGIC:
 * - "All" tab always appears first
 * - Remaining tabs appear in timeline order (before → in-progress → after → renderings)
 * - Only stages with actual media content get tabs (no empty tabs)
 *
 * EXAMPLE:
 * Media has before/after/renderings → Returns: [All, Before, After, Renderings]
 * Media has only after → Returns: [All, After]
 *
 * @param media - Array of media assets to scan
 * @returns Array of tab configurations
 */
export function getGalleryTabs(media: MediaAsset[]): GalleryTab[] {
  // Find which stages have content
  const availableStages = new Set(media.map((m) => m.stage));

  // Always start with "All" tab
  const tabs: GalleryTab[] = [
    {
      key: "all",
      label: "All",
      stage: null,
    },
  ];

  // Add tabs for stages that exist, in logical order
  STAGE_ORDER.forEach((stage) => {
    if (availableStages.has(stage)) {
      tabs.push({
        key: stage,
        label: getStageLabel(stage),
        stage: stage,
      });
    }
  });

  return tabs;
}

/**
 * Filter media assets by stage
 *
 * @param media - Array of media assets
 * @param stage - Stage to filter by (null = return all)
 * @returns Filtered media array
 */
export function filterMediaByStage(
  media: MediaAsset[],
  stage: MediaStage | null
): MediaAsset[] {
  if (stage === null) {
    return media;
  }
  return media.filter((m) => m.stage === stage);
}

