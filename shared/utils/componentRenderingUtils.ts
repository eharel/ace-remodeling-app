import {
  CORE_CATEGORIES,
  ComponentCategory,
  Project,
  getCategoryLabel,
  isCoreCategory,
} from "@/core/types";

/**
 * Configuration for a component tab in project detail view
 */
export interface ComponentTab {
  /** Unique key for React rendering */
  key: string;

  /** Component ID to display when tab is active */
  componentId: string;

  /** Display label for the tab */
  label: string;

  /** Category for filtering/grouping if needed */
  category: ComponentCategory;

  /** Whether this is a core category */
  isCoreCategory: boolean;
}

/**
 * Generate tabs for all components in a project
 *
 * Dynamically creates tab configuration based on project's actual components.
 * Handles both core categories (bathroom, kitchen) and custom categories
 * (home-theater, living-room).
 *
 * SORTING:
 * - Core categories appear first in CORE_CATEGORIES order
 * - Custom categories appear after, alphabetically
 *
 * USAGE EXAMPLE:
 *
 * ```typescript
 * function ProjectDetailScreen({ project }: { project: Project }) {
 *   const tabs = getComponentTabs(project);
 *   const [activeTab, setActiveTab] = useState(tabs[0]?.componentId);
 *
 *   const activeComponent = project.components.find(c => c.id === activeTab);
 *
 *   return (
 *     <View>
 *       <Tabs>
 *         {tabs.map(tab => (
 *           <Tab
 *             key={tab.key}
 *             active={activeTab === tab.componentId}
 *             onPress={() => setActiveTab(tab.componentId)}
 *           >
 *             {tab.label}
 *           </Tab>
 *         ))}
 *       </Tabs>
 *
 *       <ComponentContent component={activeComponent} />
 *     </View>
 *   );
 * }
 * ```
 *
 * @param project - Project containing components
 * @returns Array of tab configurations
 */
export function getComponentTabs(project: Project): ComponentTab[] {
  return project.components
    .map((component) => ({
      key: component.id,
      componentId: component.id,
      label: component.name || getCategoryLabel(component.category),
      category: component.category,
      isCoreCategory: isCoreCategory(component.category),
    }))
    .sort((a, b) => {
      const coreValues = Object.values(CORE_CATEGORIES);

      // Core categories first
      if (a.isCoreCategory && !b.isCoreCategory) return -1;
      if (!a.isCoreCategory && b.isCoreCategory) return 1;

      // Within core, maintain CORE_CATEGORIES order
      if (a.isCoreCategory && b.isCoreCategory) {
        return (
          coreValues.indexOf(a.category as (typeof coreValues)[number]) -
          coreValues.indexOf(b.category as (typeof coreValues)[number])
        );
      }

      // Custom categories alphabetically
      return a.label.localeCompare(b.label);
    });
}
