# 🎨 Unified Theming System

This document describes the comprehensive theming system implemented for the ACE Remodeling app, providing a unified approach to styling, theming, and design consistency.

## 🏗️ **Architecture Overview**

### **Core Components**

- **DesignTokens**: Single source of truth for all design values
- **ThemeMappings**: Light/dark theme color mappings
- **ThemeContext**: React Context for theme state management
- **Themed Components**: Theme-aware UI components

### **File Structure**

```
constants/
├── DesignTokens.ts          # Base design tokens
├── Colors.ts               # Legacy colors (deprecated)
contexts/
├── ThemeContext.tsx        # Theme state management
components/
├── ThemedView.tsx          # Theme-aware View wrapper
├── ThemedText.tsx          # Theme-aware Text wrapper
├── ThemeToggle.tsx         # Theme switching component
├── themed/
│   ├── ThemedButton.tsx    # Theme-aware Button
│   ├── ThemedCard.tsx      # Theme-aware Card
│   ├── ThemedInput.tsx     # Theme-aware Input
│   └── index.ts            # Exports all themed components
utils/
├── styling.ts              # Enhanced styling utilities
```

## 🎯 **Key Features**

### **1. Unified Theme System**

- **Single source of truth** for all design decisions
- **Automatic light/dark mode** support
- **Theme persistence** using AsyncStorage
- **System theme detection** with manual override

### **2. Semantic Color System**

- **Semantic naming** (e.g., `text.primary`, `background.card`)
- **Component-specific colors** (e.g., `components.button.primary`)
- **Status colors** (success, warning, error, info)
- **Interactive states** (hover, pressed, disabled)

### **3. Theme-Aware Components**

- **Automatic theming** without prop overrides
- **Variant-based styling** (primary, secondary, outlined, etc.)
- **Size variants** (sm, md, lg)
- **State-aware styling** (focused, error, disabled)

## 🚀 **Usage Examples**

### **Basic Theme Usage**

```typescript
import { useTheme } from "@/contexts/ThemeContext";

function MyComponent() {
  const { theme, getThemeColor, isDark, toggleTheme } = useTheme();

  return (
    <View style={{ backgroundColor: getThemeColor("background.primary") }}>
      <Text style={{ color: getThemeColor("text.primary") }}>
        Current theme: {isDark ? "Dark" : "Light"}
      </Text>
      <Button onPress={toggleTheme} title="Toggle Theme" />
    </View>
  );
}
```

### **Themed Components**

```typescript
import { ThemedButton, ThemedCard, ThemedText } from "@/components/themed";

function MyScreen() {
  return (
    <ThemedCard variant="elevated" padding="lg">
      <ThemedText variant="title">Welcome</ThemedText>
      <ThemedText variant="body">
        This card automatically adapts to the current theme.
      </ThemedText>
      <ThemedButton variant="primary" size="lg">
        Get Started
      </ThemedButton>
    </ThemedCard>
  );
}
```

### **Custom Styling with Theme**

```typescript
import { useTheme } from "@/contexts/ThemeContext";

function MyCustomComponent() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeColor("background.secondary"),
      padding: spacing(4),
      borderRadius: 8,
    },
    title: {
      fontSize: fontSize("xl"),
      color: themeColor("text.primary"),
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Styled</Text>
    </View>
  );
}
```

## 🔧 **Component Variants**

### **ThemedView Variants**

```typescript
<ThemedView variant="primary" />      // Primary background
<ThemedView variant="secondary" />    // Secondary background
<ThemedView variant="card" />         // Card with border
<ThemedView variant="elevated" />     // Card with shadow
<ThemedView variant="outlined" />     // Transparent with border
<ThemedView variant="ghost" />        // Transparent
```

### **ThemedText Variants**

```typescript
<ThemedText variant="title" />        // Large heading
<ThemedText variant="subtitle" />     // Medium heading
<ThemedText variant="body" />         // Body text
<ThemedText variant="caption" />      // Small text
<ThemedText variant="link" />         // Link styling
<ThemedText variant="error" />        // Error text
<ThemedText variant="success" />      // Success text
```

### **ThemedButton Variants**

```typescript
<ThemedButton variant="primary" size="md" />
<ThemedButton variant="secondary" size="lg" />
<ThemedButton variant="outline" size="sm" />
<ThemedButton variant="ghost" />
<ThemedButton variant="elevated" />
```

### **ThemedCard Variants**

```typescript
<ThemedCard variant="default" padding="md" />
<ThemedCard variant="elevated" padding="lg" />
<ThemedCard variant="outlined" padding="sm" />
<ThemedCard variant="filled" />
```

## 🎨 **Color System**

### **Semantic Color Paths**

```typescript
// Background colors
getThemeColor("background.primary"); // Main background
getThemeColor("background.secondary"); // Secondary background
getThemeColor("background.card"); // Card background
getThemeColor("background.elevated"); // Elevated surface

// Text colors
getThemeColor("text.primary"); // Primary text
getThemeColor("text.secondary"); // Secondary text
getThemeColor("text.tertiary"); // Tertiary text
getThemeColor("text.inverse"); // Inverse text

// Border colors
getThemeColor("border.primary"); // Primary borders
getThemeColor("border.accent"); // Accent borders
getThemeColor("border.error"); // Error borders

// Status colors
getThemeColor("status.success"); // Success state
getThemeColor("status.warning"); // Warning state
getThemeColor("status.error"); // Error state
getThemeColor("status.info"); // Info state
```

### **Component Colors**

```typescript
// Button colors
getComponentColor("button", "primary"); // Primary button
getComponentColor("button", "primaryHover"); // Primary hover
getComponentColor("button", "outlineBorder"); // Outline border

// Card colors
getComponentColor("card", "background"); // Card background
getComponentColor("card", "border"); // Card border
getComponentColor("card", "shadow"); // Card shadow

// Input colors
getComponentColor("input", "background"); // Input background
getComponentColor("input", "borderFocus"); // Focus border
getComponentColor("input", "placeholder"); // Placeholder text
```

## 🔄 **Theme Switching**

### **Available Theme Modes**

- **`auto`**: Follows system preference (default)
- **`light`**: Always light theme
- **`dark`**: Always dark theme

### **Theme Toggle Component**

```typescript
import { ThemeToggle } from "@/components/ThemeToggle";

// Automatically handles theme switching
<ThemeToggle />;
```

### **Programmatic Theme Control**

```typescript
import { useTheme } from "@/contexts/ThemeContext";

function MyComponent() {
  const { setThemeMode, toggleTheme } = useTheme();

  const handleLightMode = () => setThemeMode("light");
  const handleDarkMode = () => setThemeMode("dark");
  const handleAutoMode = () => setThemeMode("auto");
  const handleToggle = () => toggleTheme();

  return (
    <View>
      <Button onPress={handleLightMode} title="Light Mode" />
      <Button onPress={handleDarkMode} title="Dark Mode" />
      <Button onPress={handleAutoMode} title="Auto Mode" />
      <Button onPress={handleToggle} title="Toggle" />
    </View>
  );
}
```

## 📱 **Migration Guide**

### **From Old ThemedText**

```typescript
// OLD (deprecated)
<ThemedText type="title" lightColor="#000" darkColor="#fff">
  Title
</ThemedText>

// NEW
<ThemedText variant="title">
  Title
</ThemedText>
```

### **From Old ThemedView**

```typescript
// OLD (deprecated)
<ThemedView lightColor="#f0f0f0" darkColor="#333">
  Content
</ThemedView>

// NEW
<ThemedView variant="secondary">
  Content
</ThemedView>
```

### **From Hardcoded Colors**

```typescript
// OLD
const styles = StyleSheet.create({
  text: {
    color: "#333",
    backgroundColor: "#fff",
  },
});

// NEW
const styles = StyleSheet.create({
  text: {
    color: getThemeColor("text.primary"),
    backgroundColor: getThemeColor("background.primary"),
  },
});
```

### **From Legacy Colors.ts**

```typescript
// OLD
import { Colors } from "@/constants/Colors";
const color = Colors.light.text;

// NEW
import { useTheme } from "@/contexts/ThemeContext";
const { getThemeColor } = useTheme();
const color = getThemeColor("text.primary");
```

## 🎯 **Best Practices**

### **1. Use Semantic Colors**

```typescript
// ✅ Good
getThemeColor("text.primary");
getThemeColor("background.card");

// ❌ Avoid
getThemeColor("colors.0f172a");
getThemeColor("backgrounds.ffffff");
```

### **2. Leverage Component Variants**

```typescript
// ✅ Good
<ThemedButton variant="primary" size="lg" />
<ThemedCard variant="elevated" padding="lg" />

// ❌ Avoid
<Button style={{ backgroundColor: getThemeColor('components.button.primary') }} />
```

### **3. Use Theme-Aware Utilities**

```typescript
// ✅ Good
const { theme } = useTheme();

// ❌ Avoid
const { color } = styling; // Legacy approach
```

### **4. Handle Theme Changes Gracefully**

```typescript
// ✅ Good
const { currentTheme, isDark } = useTheme();
const backgroundColor = isDark ? "#1a1a1a" : "#ffffff";

// ❌ Avoid
const backgroundColor = "#ffffff"; // Hardcoded
```

## 🚨 **Common Issues & Solutions**

### **Theme Not Updating**

- Ensure component is wrapped in `ThemeProvider`
- Check that `useTheme()` hook is used correctly
- Verify theme context is properly initialized

### **Colors Not Applying**

- Use `getThemeColor()` instead of direct color access
- Check color path syntax (e.g., `'text.primary'`)
- Ensure component supports the desired theme property

### **Performance Issues**

- Use `useMemo` for expensive theme calculations
- Avoid creating styles in render functions
- Leverage predefined variants when possible

## 🔮 **Future Enhancements**

### **Planned Features**

- **Custom theme creation** (brand-specific themes)
- **Theme animation** (smooth transitions)
- **Theme presets** (professional, casual, etc.)
- **Accessibility themes** (high contrast, colorblind-friendly)

### **Extensibility**

- **Plugin system** for custom themes
- **Theme marketplace** for community themes
- **Dynamic theme loading** from remote sources
- **Theme inheritance** and composition

## 📚 **Additional Resources**

- **Design System Documentation**: `DESIGN_SYSTEM.md`
- **Component Examples**: `components/themed/`
- **Theme Context**: `contexts/ThemeContext.tsx`
- **Design Tokens**: `constants/DesignTokens.ts`

---

**Need Help?** Check the component examples or create an issue for specific problems.
