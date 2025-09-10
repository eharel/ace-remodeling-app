# Styling Conventions & Guidelines

This document outlines the standardized styling approach for the React Native project, ensuring consistency, performance, and maintainability.

## 🎯 **Core Principles**

1. **Direct Design Token Access**: Use `DesignTokens` directly instead of wrapper utilities
2. **Performance First**: Optimize StyleSheet usage for React Native performance
3. **Type Safety**: Leverage TypeScript for compile-time styling validation
4. **Consistency**: Single source of truth for all design values

## 📐 **Design Token Usage**

### **Spacing**

```typescript
// ✅ CORRECT - Direct access
padding: DesignTokens.spacing[4],        // 16px
margin: DesignTokens.spacing[8],         // 32px
gap: DesignTokens.spacing[2],            // 8px

// ❌ AVOID - Wrapper functions
padding: styling.spacing(4),
```

### **Typography**

```typescript
// ✅ CORRECT - Direct access
fontSize: DesignTokens.typography.fontSize.lg,           // 18px
fontSize: DesignTokens.typography.fontSize["2xl"],       // 24px (numeric keys)
fontWeight: DesignTokens.typography.fontWeight.semibold, // "600"
lineHeight: DesignTokens.typography.lineHeight.relaxed,  // 1.6
fontFamily: DesignTokens.typography.fontFamily.regular,  // "Inter-Regular"

// ❌ AVOID - Wrapper functions
fontSize: styling.fontSize("lg"),
```

### **Layout & Visual**

```typescript
// ✅ CORRECT - Direct access
borderRadius: DesignTokens.borderRadius.lg,    // 12px
borderRadius: DesignTokens.borderRadius.md,    // 8px
...DesignTokens.shadows.sm,                    // Shadow object
...DesignTokens.shadows.base,                  // Shadow object
```

### **Interactions**

```typescript
// ✅ CORRECT - Direct access
activeOpacity: DesignTokens.interactions.activeOpacity,  // 0.7
opacity: DesignTokens.interactions.disabledOpacity,      // 0.5
```

## 🎨 **Theme Colors**

### **Direct Theme Access**

```typescript
// ✅ CORRECT - Direct theme object access
backgroundColor: theme.colors.background.primary,
color: theme.colors.text.secondary,
borderColor: theme.colors.border.primary,

// Component-specific colors
backgroundColor: theme.colors.components.card.background,
color: theme.colors.components.input.placeholder,
```

### **Status Colors**

```typescript
// ✅ CORRECT - Status colors
color: theme.colors.status.success,
backgroundColor: theme.colors.status.errorLight,
borderColor: theme.colors.status.warning,
```

## ⚡ **StyleSheet Performance Patterns**

### **Static Styles (Outside Component)**

```typescript
// ✅ CORRECT - Static styles outside component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: DesignTokens.spacing[4],
  },
  text: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});

export function MyComponent() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <Text style={[styles.text, { color: theme.colors.text.primary }]}>
        Content
      </Text>
    </View>
  );
}
```

### **Theme-Dependent Styles (Memoized)**

```typescript
// ✅ CORRECT - Memoized theme-dependent styles
export function MyComponent() {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: theme.colors.background.card,
          borderColor: theme.colors.border.primary,
          borderRadius: DesignTokens.borderRadius.lg,
          padding: DesignTokens.spacing[4],
        },
        text: {
          color: theme.colors.text.primary,
          fontSize: DesignTokens.typography.fontSize.lg,
        },
      }),
    [theme]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Content</Text>
    </View>
  );
}
```

### **Mixed Approach (Recommended)**

```typescript
// ✅ CORRECT - Static + dynamic combination
const staticStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
  },
  text: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});

export function MyComponent() {
  const { theme } = useTheme();

  return (
    <View
      style={[
        staticStyles.container,
        { backgroundColor: theme.colors.background.card },
      ]}
    >
      <Text style={[staticStyles.text, { color: theme.colors.text.primary }]}>
        Content
      </Text>
    </View>
  );
}
```

## 🚫 **Anti-Patterns to Avoid**

### **StyleSheet.create() Inside Component (Unmemoized)**

```typescript
// ❌ AVOID - Creates new styles on every render
export function MyComponent() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    // ❌ Performance issue
    container: {
      backgroundColor: theme.colors.background.primary,
    },
  });

  return <View style={styles.container} />;
}
```

### **String-Based Theme Access**

```typescript
// ❌ AVOID - Deprecated string-based access
const color = getThemeColor("background.primary");
const componentColor = getComponentColor("card", "background");
```

### **Wrapper Utilities**

```typescript
// ❌ AVOID - Unnecessary wrapper functions
padding: styling.spacing(4),
fontSize: styling.fontSize("lg"),
borderRadius: styling.borderRadius("md"),
```

## 📋 **Component Styling Checklist**

When creating or updating components:

- [ ] **Import DesignTokens**: `import { DesignTokens } from "@/themes"`
- [ ] **Use Direct Access**: `DesignTokens.spacing[4]` not `styling.spacing(4)`
- [ ] **Optimize StyleSheet**: Move static styles outside component or memoize theme-dependent styles
- [ ] **Theme Colors**: Use `theme.colors.*` for all color values
- [ ] **Type Safety**: Ensure all style properties are properly typed
- [ ] **Performance**: Avoid creating styles on every render

## 🔧 **Migration Guide**

### **From Old Styling System**

```typescript
// OLD
import { styling } from "@/utils/styling";

const styles = StyleSheet.create({
  container: {
    padding: styling.spacing(4),
    fontSize: styling.fontSize("lg"),
    backgroundColor: getThemeColor("background.primary"),
  },
});

// NEW
import { DesignTokens } from "@/themes";

const styles = StyleSheet.create({
  container: {
    padding: DesignTokens.spacing[4],
    fontSize: DesignTokens.typography.fontSize.lg,
    // backgroundColor moved to inline style
  },
});

// In component
<View
  style={[
    styles.container,
    { backgroundColor: theme.colors.background.primary },
  ]}
/>;
```

## 🎯 **Best Practices Summary**

1. **Always use `DesignTokens` directly** - no wrapper utilities
2. **Move static styles outside components** - better performance
3. **Memoize theme-dependent styles** - use `useMemo` with `[theme]` dependency
4. **Use direct theme object access** - `theme.colors.*` for all colors
5. **Combine static + dynamic** - static styles + inline theme colors
6. **Type everything** - leverage TypeScript for compile-time validation
7. **Test performance** - ensure no unnecessary re-renders or style recreations

## 📚 **Related Files**

- `themes/base/tokens.ts` - Design token definitions
- `themes/light.ts`, `themes/dark.ts`, `themes/blue.ts` - Theme color definitions
- `contexts/ThemeContext.tsx` - Theme provider and hooks
- `components/themed/` - Themed component examples

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Status**: ✅ Production Ready
