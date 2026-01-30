import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

type GridVariant = "photos" | "projects" | "featured";

export function useResponsiveGrid(variant: GridVariant) {
  const { width } = useWindowDimensions();

  const columns = useMemo(() => {
    switch (variant) {
      case "photos":
        if (width >= 1024) return 6;
        if (width >= 768) return 4;
        return 3;
      case "projects":
        if (width >= 1024) return 3;
        if (width >= 768) return 2;
        return 1;
      case "featured":
        return width >= 1024 ? 2 : 1;
      default:
        return 1;
    }
  }, [width, variant]);

    const itemSize = useMemo(() => width / columns, [width, columns]);

  // Just return the numbers. Let the components decide
  // how to use them with StyleSheet.
  return { columns, screenWidth: width, itemSize };
}
