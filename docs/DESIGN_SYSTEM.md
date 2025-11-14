# ACE Remodeling App - Design System Overview

> **📖 Documentation Hub**: This is a high-level overview of the design system. For detailed implementation guidance, see:
>
> - **[THEMING_SYSTEM.md](./THEMING_SYSTEM.md)** - Complete theming architecture and usage
> - **[STYLING_CONVENTIONS.md](./STYLING_CONVENTIONS.md)** - Best practices and patterns

## Overview

The ACE Remodeling app implements a comprehensive design system built on modern principles to ensure consistency, maintainability, and scalability. The system includes design tokens, a flexible theming architecture, and reusable component patterns.

## Core Architecture

### 🎨 Design Tokens

**Location**: `core/themes/base/tokens.ts`

Single source of truth for all design values:

- **Spacing**: 8px base unit scale (4, 8, 12, 16, 20, 24, 32, 48, 64, 128...)
- **Typography**: Font sizes, weights, line heights, and families (Inter, SpaceMono)
- **Layout**: Border radius, shadows, z-index, component dimensions
- **Interactions**: Opacity values, animation durations, touch targets
- **Reference Colors**: Base color palettes for themes to use

### 🌓 Theme System

**Locations**: `core/themes/`, `shared/contexts/ThemeContext.tsx`

Flexible theming with full light/dark mode support:

- **Multiple Themes**: Light, dark, and custom theme variants
- **Theme Context**: React Context for theme state management
- **Automatic Switching**: System theme detection with manual override
- **Theme Persistence**: Saves user preference using AsyncStorage
- **Semantic Colors**: Background, text, border, interactive, status colors
- **Component-Specific Colors**: Pre-defined color schemes for buttons, cards, inputs, etc.

### 🧩 Component Library

**Locations**: `shared/components/`, `features/*/components/`

Theme-aware, reusable components:

- **Themed Components**: `ThemedView`, `ThemedText`, `ThemedInput`
- **Feature Components**: `ProjectCard`, `ProjectGallery`, `PageHeader`
- **State Components**: `LoadingState`, `ErrorState`, `EmptyState`
- **UI Components**: Buttons, modals, inputs with consistent styling

## Design Principles

### 1. Consistency

- All spacing uses the 8px base unit
- Unified color palette with semantic naming
- Standardized typography scale
- Consistent shadows and borders across components

### 2. Accessibility

- High contrast color combinations for readability
- Proper text sizing and line heights
- Semantic color usage for status indicators
- Touch-friendly spacing (minimum 44px touch targets)

### 3. Theming

- Automatic light/dark mode support
- Theme-aware components that adapt automatically
- No hardcoded colors in components
- Flexible theme creation and extension

### 4. Responsiveness

- Adaptive layouts based on screen size
- Flexible grid systems
- Consistent spacing across all devices

## Quick Start Guide

### Using Design Tokens

```typescript
import { DesignTokens } from "@/core/themes";

const styles = StyleSheet.create({
  container: {
    padding: DesignTokens.spacing[4], // 16px
    borderRadius: DesignTokens.borderRadius.lg, // 16px
    gap: DesignTokens.spacing[2], // 8px
  },
  title: {
    fontSize: DesignTokens.typography.fontSize["2xl"], // 24px
    fontWeight: DesignTokens.typography.fontWeight.bold,
    lineHeight: DesignTokens.typography.lineHeight.tight,
  },
});
```

### Using the Theme System

```typescript
import { useTheme } from "@/shared/contexts/ThemeContext";

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.background.card,
          borderColor: theme.colors.border.primary,
          padding: DesignTokens.spacing[4],
        },
        text: {
          color: theme.colors.text.primary,
        },
      }),
    [theme]
  );

  return <View style={styles.container}>...</View>;
}
```

### Using Themed Components

```typescript
import { ThemedView, ThemedText } from "@/shared/components";

function MyScreen() {
  return (
    <ThemedView variant="elevated">
      <ThemedText variant="title">Welcome</ThemedText>
      <ThemedText variant="body">
        This view automatically adapts to the current theme.
      </ThemedText>
    </ThemedView>
  );
}
```

## Key Design Values

### Typography Scale

- **xs**: 12px | **sm**: 14px | **base**: 16px | **lg**: 18px | **xl**: 20px
- **2xl**: 24px | **3xl**: 28px | **4xl**: 32px | **5xl**: 36px

### Spacing Scale (8px base unit)

- **1**: 4px | **2**: 8px | **3**: 12px | **4**: 16px | **5**: 20px
- **6**: 24px | **8**: 32px | **10**: 40px | **12**: 48px | **16**: 64px

### Font Weights

- **Normal**: 400 | **Medium**: 500 | **Semibold**: 600 | **Bold**: 700

### Shadow Levels

- **sm**: Subtle elevation | **base**: Standard elevation
- **md**: Medium elevation | **lg**: High elevation

## Theme Color Categories

### Background Colors

`background.primary`, `background.secondary`, `background.card`, `background.elevated`

### Text Colors

`text.primary`, `text.secondary`, `text.tertiary`, `text.inverse`, `text.accent`

### Border Colors

`border.primary`, `border.secondary`, `border.accent`, `border.error`, `border.success`

### Interactive Colors

`interactive.primary`, `interactive.primaryHover`, `interactive.disabled`

### Status Colors

`status.success`, `status.warning`, `status.error`, `status.info` (with `*Light` variants)

## Best Practices

### ✅ Do This

```typescript
// Use DesignTokens for dimensions
padding: DesignTokens.spacing[4]

// Use theme for colors
backgroundColor: theme.colors.background.card

// Use themed components when possible
<ThemedText variant="title">Hello</ThemedText>

// Memoize theme-dependent styles
const styles = useMemo(() => StyleSheet.create({...}), [theme]);
```

### ❌ Avoid This

```typescript
// Don't hardcode values
padding: 16  // Use DesignTokens.spacing[4] instead

// Don't hardcode colors
backgroundColor: "#ffffff"  // Use theme.colors instead

// Don't create styles on every render (without useMemo)
const styles = StyleSheet.create({...})  // Inside component body
```

## File Structure

```
core/themes/
├── base/
│   ├── tokens.ts          # Design tokens (dimensions, spacing, typography)
│   ├── types.ts           # TypeScript types for themes
│   └── utils.ts           # Theme utility functions
├── light.ts               # Light theme color definitions
├── dark.ts                # Dark theme color definitions
├── main.ts                # Main theme variant
└── index.ts               # Theme exports

shared/
├── components/
│   ├── themed/            # Theme-aware components
│   └── ui/                # Reusable UI components
├── contexts/
│   └── ThemeContext.tsx   # Theme state management
└── utils/
    └── styling.ts         # Styling utilities (legacy support)
```

## Current Features

✅ **Implemented**:

- Full light/dark theme support
- Theme switching with persistence
- System theme detection
- Theme-aware component library
- Semantic color system
- Responsive layouts
- Design token system
- TypeScript type safety

🚧 **Future Enhancements**:

- Additional theme presets (high contrast, colorblind-friendly)
- Theme animation transitions
- Custom theme creation interface
- Reduced motion preferences
- Extended component variant library

## Detailed Documentation

For comprehensive implementation details, code examples, and migration guides:

- **[THEMING_SYSTEM.md](./THEMING_SYSTEM.md)** - Complete theming system documentation

  - Theme architecture and context usage
  - Component variants and examples
  - Theme switching and persistence
  - Migration guides and breaking changes

- **[STYLING_CONVENTIONS.md](./STYLING_CONVENTIONS.md)** - Best practices and patterns
  - Performance optimization techniques
  - StyleSheet usage patterns
  - Common anti-patterns to avoid
  - Migration from legacy systems

---

**Last Updated**: November 2024  
**Status**: ✅ Active - See linked documentation for complete details
