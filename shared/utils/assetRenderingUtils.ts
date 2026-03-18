import {
  Document,
  DocumentCategory,
  DOCUMENT_CATEGORIES,
} from "@/shared/types";

/**
 * Configuration for an asset section (group of documents by category)
 */
export interface AssetSection {
  /** Unique key for React rendering */
  key: string;

  /** Display label for the section */
  label: string;

  /** Document category for this section */
  category: DocumentCategory;

  /** Documents in this section */
  documents: Document[];

  /** Display layout hint (grid for images, list for PDFs) */
  layout: "grid" | "list";
}

/**
 * Human-readable labels for document categories
 * Some categories use plural forms for section headers
 */
const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DOCUMENT_CATEGORIES.RENDERING_3D]: "Renderings",
  [DOCUMENT_CATEGORIES.FLOOR_PLAN]: "Floor Plans",
  [DOCUMENT_CATEGORIES.MATERIALS]: "Materials",
  [DOCUMENT_CATEGORIES.PERMIT]: "Permits",
  [DOCUMENT_CATEGORIES.CONTRACT]: "Contracts",
  [DOCUMENT_CATEGORIES.INVOICE]: "Invoices",
  [DOCUMENT_CATEGORIES.OTHER]: "Other",
};

/**
 * Get display label for a document category
 *
 * @param category - The document category to get label for
 * @returns Human-readable label for the category
 */
export function getCategoryLabel(category: DocumentCategory): string {
  return CATEGORY_LABELS[category] || category;
}

/**
 * @deprecated Use getCategoryLabel instead
 */
export const getTypeLabel = getCategoryLabel;

/**
 * Determine appropriate layout for a document category
 *
 * Visual content (renderings, plans, materials) uses grid layout.
 * Text documents (contracts, permits) use list layout.
 *
 * @param category - The document category to determine layout for
 * @returns Layout hint: "grid" for visual content, "list" for text documents
 */
function getLayoutForCategory(category: DocumentCategory): "grid" | "list" {
  const visualCategories: DocumentCategory[] = [
    DOCUMENT_CATEGORIES.RENDERING_3D,
    DOCUMENT_CATEGORIES.FLOOR_PLAN,
    DOCUMENT_CATEGORIES.MATERIALS,
  ];

  return visualCategories.includes(category) ? "grid" : "list";
}

/**
 * Logical display order for document categories
 * Visual content first, then administrative documents
 */
const CATEGORY_ORDER: DocumentCategory[] = [
  DOCUMENT_CATEGORIES.RENDERING_3D,
  DOCUMENT_CATEGORIES.MATERIALS,
  DOCUMENT_CATEGORIES.FLOOR_PLAN,
  DOCUMENT_CATEGORIES.CONTRACT,
  DOCUMENT_CATEGORIES.PERMIT,
  DOCUMENT_CATEGORIES.INVOICE,
  DOCUMENT_CATEGORIES.OTHER,
];

/**
 * Generate asset sections based on available document categories
 *
 * Groups documents by category and creates sections only for categories that exist.
 * Each section includes layout hint (grid vs list) based on content category.
 *
 * LOGIC:
 * - Groups documents by category
 * - Orders sections: visual content first, then administrative
 * - Provides layout hint for each section
 * - Only creates sections for categories with actual documents
 *
 * EXAMPLE:
 * Documents include renderings and contracts →
 * Returns: [
 *   { label: "Renderings", layout: "grid", documents: [...] },
 *   { label: "Contracts", layout: "list", documents: [...] }
 * ]
 *
 * USAGE EXAMPLE:
 *
 * ```typescript
 * function ProjectAssets({ component }: { component: ProjectComponent }) {
 *   const sections = getAssetSections(component.documents);
 *
 *   return (
 *     <View>
 *       {sections.map(section => (
 *         <AssetSection
 *           key={section.key}
 *           title={section.label}
 *           layout={section.layout}
 *         >
 *           {section.layout === 'grid' ? (
 *             <ImageGrid documents={section.documents} />
 *           ) : (
 *             <DocumentList documents={section.documents} />
 *           )}
 *         </AssetSection>
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 *
 * @param documents - Array of documents to organize
 * @returns Array of section configurations
 */
export function getAssetSections(
  documents: Document[] = []
): AssetSection[] {
  // Group documents by category
  const grouped = documents.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = [];
      }
      acc[doc.category].push(doc);
      return acc;
    },
    {} as Record<DocumentCategory, Document[]>
  );

  // Create sections in logical order, only for categories that exist
  const sections: AssetSection[] = [];

  CATEGORY_ORDER.forEach((category) => {
    const docs = grouped[category];
    if (docs && docs.length > 0) {
      sections.push({
        key: category,
        label: getCategoryLabel(category),
        category: category,
        documents: docs,
        layout: getLayoutForCategory(category),
      });
    }
  });

  return sections;
}

