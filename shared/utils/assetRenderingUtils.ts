import {
  Document,
  DocumentType,
  DOCUMENT_TYPES,
} from "@/core/types";

/**
 * Configuration for an asset section (group of documents by type)
 */
export interface AssetSection {
  /** Unique key for React rendering */
  key: string;

  /** Display label for the section */
  label: string;

  /** Document type for this section */
  type: DocumentType;

  /** Documents in this section */
  documents: Document[];

  /** Display layout hint (grid for images, list for PDFs) */
  layout: "grid" | "list";
}

/**
 * Human-readable labels for document types
 * Some types use plural forms for section headers
 */
const TYPE_LABELS: Record<DocumentType, string> = {
  [DOCUMENT_TYPES.RENDERING_3D]: "Renderings",
  [DOCUMENT_TYPES.FLOOR_PLAN]: "Floor Plans",
  [DOCUMENT_TYPES.MATERIALS]: "Materials",
  [DOCUMENT_TYPES.PERMIT]: "Permits",
  [DOCUMENT_TYPES.CONTRACT]: "Contracts",
  [DOCUMENT_TYPES.INVOICE]: "Invoices",
  [DOCUMENT_TYPES.OTHER]: "Other",
};

/**
 * Get display label for a document type
 *
 * @param type - The document type to get label for
 * @returns Human-readable label for the type
 */
export function getTypeLabel(type: DocumentType): string {
  return TYPE_LABELS[type] || type;
}

/**
 * Determine appropriate layout for a document type
 *
 * Visual content (renderings, plans, materials) uses grid layout.
 * Text documents (contracts, permits) use list layout.
 *
 * @param type - The document type to determine layout for
 * @returns Layout hint: "grid" for visual content, "list" for text documents
 */
function getLayoutForType(type: DocumentType): "grid" | "list" {
  const visualTypes: DocumentType[] = [
    DOCUMENT_TYPES.RENDERING_3D,
    DOCUMENT_TYPES.FLOOR_PLAN,
    DOCUMENT_TYPES.MATERIALS,
  ];

  return visualTypes.includes(type) ? "grid" : "list";
}

/**
 * Logical display order for document types
 * Visual content first, then administrative documents
 */
const TYPE_ORDER: DocumentType[] = [
  DOCUMENT_TYPES.RENDERING_3D,
  DOCUMENT_TYPES.MATERIALS,
  DOCUMENT_TYPES.FLOOR_PLAN,
  DOCUMENT_TYPES.CONTRACT,
  DOCUMENT_TYPES.PERMIT,
  DOCUMENT_TYPES.INVOICE,
  DOCUMENT_TYPES.OTHER,
];

/**
 * Generate asset sections based on available document types
 *
 * Groups documents by type and creates sections only for types that exist.
 * Each section includes layout hint (grid vs list) based on content type.
 *
 * LOGIC:
 * - Groups documents by type
 * - Orders sections: visual content first, then administrative
 * - Provides layout hint for each section
 * - Only creates sections for types with actual documents
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
  // Group documents by type
  const grouped = documents.reduce(
    (acc, doc) => {
      if (!acc[doc.type]) {
        acc[doc.type] = [];
      }
      acc[doc.type].push(doc);
      return acc;
    },
    {} as Record<DocumentType, Document[]>
  );

  // Create sections in logical order, only for types that exist
  const sections: AssetSection[] = [];

  TYPE_ORDER.forEach((type) => {
    const docs = grouped[type];
    if (docs && docs.length > 0) {
      sections.push({
        key: type,
        label: getTypeLabel(type),
        type: type,
        documents: docs,
        layout: getLayoutForType(type),
      });
    }
  });

  return sections;
}

