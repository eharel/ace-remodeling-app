/**
 * Configuration constants for the Meeting Checklist feature
 * Business logic and content only - styling values moved to DesignTokens
 */

import type { ChecklistItem } from "@/features/checklist/utils/checklistHelpers";

/**
 * Checklist behavior configuration interface
 */
export interface ChecklistBehavior {
  /** Should the checklist state persist between app sessions? */
  PERSIST_STATE: boolean;
  /** Should progress be automatically saved as user checks items? */
  AUTO_SAVE: boolean;
  /** Should the progress percentage be displayed in the header? */
  SHOW_PROGRESS: boolean;
  /** Should the FAB be visible on all screens or only specific ones? */
  FAB_VISIBILITY: "all" | "specific" | "none";
  /** Should the modal close when all items are completed? */
  AUTO_CLOSE_ON_COMPLETION: boolean;
  /** Should there be haptic feedback when checking items? */
  HAPTIC_FEEDBACK: boolean;
}

/**
 * Feature flags interface for future functionality
 */
export interface ChecklistFeatures {
  /** Enable checklist customization (add/remove items) */
  CUSTOMIZATION_ENABLED: boolean;
  /** Enable checklist sharing between team members */
  SHARING_ENABLED: boolean;
  /** Enable checklist templates for different meeting types */
  TEMPLATES_ENABLED: boolean;
}

/**
 * Main checklist configuration
 * Uses hierarchical structure for parent-child relationships
 */
export const CHECKLIST_CONFIG = {
  // Hierarchical checklist content - meeting agenda with nested items
  ITEMS: [
    {
      id: "introduction",
      text: "Introduction",
      subItems: [
        {
          id: "introduction-rapport",
          text: "Build rapport with client",
        },
        {
          id: "introduction-personal",
          text: "Share something personal about yourself",
        },
        {
          id: "introduction-bag",
          text: "Place your bag where you can sit with the client after",
        },
      ],
    },
    {
      id: "company-presentation",
      text: "Company Presentation",
      subItems: [
        {
          id: "company-departments",
          text: "Introduce all company departments",
        },
        {
          id: "company-under-one-roof",
          text: "Explain design-permit-build under one roof",
        },
        {
          id: "company-in-house",
          text: "Highlight that all teams are in-house (aside from MEP)",
        },
      ],
    },
    {
      id: "product-introduction",
      text: "Product Introduction",
      subItems: [
        {
          id: "product-drafter",
          text: "Drafter",
        },
        {
          id: "product-plans",
          text: "Plans",
        },
        {
          id: "product-3d-model",
          text: "3D model",
        },
        {
          id: "product-materials",
          text: "Materials procurement",
        },
        {
          id: "product-preconstruction",
          text: "Pre-construction meeting",
        },
        {
          id: "product-demo",
          text: "Cover & demo",
        },
        {
          id: "product-framing",
          text: "Framing",
        },
        {
          id: "product-rough-ins",
          text: "Rough-ins",
        },
        {
          id: "product-inspection",
          text: "3rd party inspection",
        },
        {
          id: "product-waterproofing",
          text: "Walls closing / waterproofing",
        },
        {
          id: "product-cabinets",
          text: "Cabinets / countertops / tiles",
        },
        {
          id: "product-final-install",
          text: "Final install (plumbing / electrical / HVAC)",
        },
        {
          id: "product-walkthrough",
          text: "Final walkthrough and punch list",
        },
      ],
    },
    {
      id: "intro-finish",
      text: "Intro Finish",
      subItems: [
        {
          id: "intro-finish-warranty",
          text: "Warranty coverage",
        },
        {
          id: "intro-finish-insurance",
          text: "Insurance up to $5 million",
        },
      ],
    },
    {
      id: "rebuttals-exit",
      text: "Rebuttals & Exit Strategy",
      subItems: [
        {
          id: "rebuttals-signing-benefits",
          text: "Emphasize signing on-site benefits (guarantees quality oversight)",
        },
        {
          id: "rebuttals-check-license",
          text: "Check license of other contractors being considered",
        },
        {
          id: "rebuttals-photos",
          text: "Ask for photos of their previous projects",
        },
        {
          id: "rebuttals-work-sites",
          text: "Verify if other GCs can take you to open work sites",
        },
        {
          id: "rebuttals-office",
          text: "Confirm if other GCs have a physical office",
        },
        {
          id: "rebuttals-recommendations",
          text: "Request recommendations from their past clients",
        },
      ],
    },
  ] as const satisfies readonly ChecklistItem[],

  // Business behavior configuration
  BEHAVIOR: {
    PERSIST_STATE: true,
    AUTO_SAVE: true,
    SHOW_PROGRESS: true,
    FAB_VISIBILITY: "all" as const,
    AUTO_CLOSE_ON_COMPLETION: false,
    HAPTIC_FEEDBACK: true,
  } satisfies ChecklistBehavior,

  // Feature flags for future functionality
  FEATURES: {
    CUSTOMIZATION_ENABLED: false,
    SHARING_ENABLED: false,
    TEMPLATES_ENABLED: false,
  } satisfies ChecklistFeatures,
} as const;
