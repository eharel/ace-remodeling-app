# SegmentedControl Component

Unified selection component with multiple visual variants (pills, tabs).

## Stage 1 Implementation

This is Stage 1 of the refactoring, which includes:
- Core `SegmentedControl` component with shared logic
- `PillOption` variant component
- TypeScript type definitions
- Utility functions

## Usage Example

```tsx
import { useState } from 'react';
import { SegmentedControl } from '@/shared/components/ui/SegmentedControl';
import { ThemedView, ThemedText } from '@/shared/components';

export default function TestScreen() {
  const [selected, setSelected] = useState<'option1' | 'option2' | 'option3'>('option1');
  
  const counts = {
    option1: 5,
    option2: 10,
    option3: 3,
  };

  return (
    <ThemedView style={{ padding: 20 }}>
      <SegmentedControl
        variant="pills"
        options={['option1', 'option2', 'option3'] as const}
        selected={selected}
        onSelect={setSelected}
        showCounts={true}
        getCounts={(opt) => counts[opt]}
        ariaLabel="Select an option"
      />
      
      <ThemedText style={{ marginTop: 20 }}>
        Selected: {selected}
      </ThemedText>
    </ThemedView>
  );
}
```

## API

### SegmentedControlProps<T>

- `options: readonly T[]` - Array of option values
- `selected: T` - Currently selected value
- `onSelect: (option: T) => void` - Selection callback
- `variant?: 'pills' | 'tabs'` - Visual style (defaults to 'tabs')
- `showCounts?: boolean` - Whether to display counts
- `getCounts?: (option: T) => number` - Function to get count for option
- `getLabel?: (option: T) => string` - Custom label formatter
- `ariaLabel?: string` - Accessibility label
- `testID?: string` - Test identifier

## Next Steps (Stage 2)

- Create `TabOption.tsx` variant component
- Update `SegmentedControl` to render tabs when `variant="tabs"`
- Refactor existing pill usage to use new component
- Refactor existing tab usage to use new component

