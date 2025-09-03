# ACE Remodeling App - Design System

## Overview

This document outlines the comprehensive design system implemented for the ACE Remodeling app. The system follows modern design principles and engineering best practices to ensure consistency, maintainability, and scalability.

## Architecture

### 1. Design Tokens (`constants/DesignTokens.ts`)

**Single source of truth** for all design values including:

- **Colors**: Primary, secondary, neutral, semantic, and status colors
- **Typography**: Font sizes, weights, line heights, and families
- **Spacing**: 8px base unit scale (4, 8, 12, 16, 20, 24, 32, 48, 64, 80, 96, 128)
- **Shadows**: Consistent elevation system with proper opacity values
- **Border Radius**: Standardized corner radius values
- **Transitions**: Animation duration constants
- **Z-Index**: Layering system for components

### 2. Styling Utilities (`utils/styling.ts`)

**Helper functions** for consistent styling:

- **Dynamic access** to design tokens
- **Predefined style combinations** for common patterns
- **Status-specific styles** for project states
- **Type-safe** styling utilities

### 3. Component Library

**Enhanced components** using the design system:

- **ProjectCard**: Professional card design with improved shadows and spacing
- **ProjectGallery**: Responsive grid with consistent spacing
- **Home Screen**: Enhanced typography and visual hierarchy

## Design Principles

### 1. **Consistency**

- All spacing uses the 8px base unit
- Consistent color palette throughout the app
- Unified typography scale
- Standardized shadows and borders

### 2. **Accessibility**

- High contrast color combinations
- Proper text sizing and line heights
- Semantic color usage for status indicators
- Touch-friendly spacing and sizing

### 3. **Modern Aesthetics**

- Subtle shadows for depth
- Rounded corners for friendliness
- Professional color palette
- Clean, uncluttered layouts

### 4. **Responsiveness**

- Adaptive spacing based on screen size
- Flexible grid systems
- Consistent margins and padding across devices

## Usage Examples

### Basic Styling

```typescript
import { styling } from "@/utils/styling";

const styles = StyleSheet.create({
  container: {
    padding: styling.spacing(5), // 20px
    backgroundColor: styling.color("background.primary"),
    borderRadius: styling.borderRadius("lg"), // 16px
    ...styling.shadow("base"), // Consistent shadow
  },
  title: {
    fontSize: styling.fontSize("2xl"), // 24px
    color: styling.color("text.primary"),
    fontWeight: styling.fontWeight("bold"),
  },
});
```

### Status Styles

```typescript
import { statusStyles } from "@/utils/styling";

// Automatic status-based styling
<View style={[styles.badge, statusStyles[project.status]]}>
  {project.status}
</View>;
```

### Common Patterns

```typescript
import { commonStyles } from '@/utils/styling';

// Predefined card style
<View style={commonStyles.card}>
  {/* Card content */}
</View>

// Predefined text styles
<Text style={commonStyles.text.heading}>Title</Text>
<Text style={commonStyles.text.body}>Body text</Text>
```

## Color System

### Primary Colors

- **Primary 500**: Main brand color (#3b82f6)
- **Primary 100-400**: Lighter shades for backgrounds and accents
- **Primary 600-900**: Darker shades for text and emphasis

### Semantic Colors

- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Yellow)
- **Error**: #ef4444 (Red)
- **Info**: #3b82f6 (Blue)

### Status Colors

- **Completed**: Green with 20% opacity background
- **In Progress**: Yellow with 20% opacity background
- **Planning**: Blue with 20% opacity background
- **On Hold**: Red with 20% opacity background

## Typography Scale

### Font Sizes

- **xs**: 12px (Captions, labels)
- **sm**: 14px (Small text)
- **base**: 16px (Body text)
- **lg**: 18px (Large body)
- **xl**: 20px (Subheadings)
- **2xl**: 24px (Section titles)
- **3xl**: 28px (Page titles)
- **4xl**: 32px (Hero titles)
- **5xl**: 36px (Large displays)

### Font Weights

- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700
- **extrabold**: 800

## Spacing System

### Base Unit: 8px

- **1**: 4px (Tiny spacing)
- **2**: 8px (Small spacing)
- **3**: 12px (Medium spacing)
- **4**: 16px (Standard spacing)
- **5**: 20px (Large spacing)
- **6**: 24px (Section spacing)
- **8**: 32px (Major spacing)
- **10**: 40px (Page spacing)
- **16**: 128px (Hero spacing)

## Shadow System

### Elevation Levels

- **sm**: Subtle elevation (1px)
- **base**: Standard elevation (2px)
- **md**: Medium elevation (4px)
- **lg**: High elevation (8px)

## Best Practices

### 1. **Always use design tokens**

- Never hardcode colors, spacing, or typography values
- Use the styling utilities for consistency

### 2. **Maintain the spacing scale**

- Stick to the 8px base unit
- Use predefined spacing values from the system

### 3. **Leverage common styles**

- Use predefined patterns for cards, buttons, and text
- Extend common styles rather than creating new ones

### 4. **Think in systems**

- Consider how changes affect the overall design
- Maintain consistency across similar components

### 5. **Test on multiple devices**

- Ensure spacing and typography work across screen sizes
- Verify touch targets meet accessibility guidelines

## Future Enhancements

### 1. **Dark Mode Support**

- Add dark theme color variants
- Implement theme switching

### 2. **Animation System**

- Define standard animation curves
- Create reusable transition components

### 3. **Component Variants**

- Add more predefined component styles
- Create configurable component themes

### 4. **Accessibility Improvements**

- Add high contrast mode
- Implement reduced motion preferences

## Maintenance

### 1. **Adding New Tokens**

- Add to `DesignTokens.ts`
- Update types if necessary
- Document in this file

### 2. **Modifying Existing Tokens**

- Consider impact on all components
- Update related utilities
- Test across the app

### 3. **Component Updates**

- Use the design system consistently
- Maintain backward compatibility
- Update documentation

---

_This design system ensures the ACE Remodeling app maintains a professional, consistent appearance while being easy to maintain and extend._
