import React, { useMemo } from "react";

import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";

interface Testimonial {
  text: string;
  author: string;
}

export interface TestimonialSectionProps {
  testimonial: Testimonial | undefined;
}

/**
 * TestimonialSection - Displays client testimonial quote
 *
 * Shows a styled blockquote with the testimonial text and author attribution.
 * Only renders if testimonial data is provided.
 */
export const TestimonialSection: React.FC<TestimonialSectionProps> = ({
  testimonial,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () => ({
      section: {
        paddingHorizontal: DesignTokens.spacing[6],
        marginTop: DesignTokens.spacing[8],
      },
      sectionTitle: {
        fontSize: DesignTokens.typography.fontSize.lg,
        fontWeight: DesignTokens.typography.fontWeight.semibold,
        marginBottom: DesignTokens.spacing[4],
      },
      quoteContainer: {
        backgroundColor: theme.colors.background.secondary,
        padding: DesignTokens.spacing[6],
        borderRadius: DesignTokens.borderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.text.accent,
      },
      quoteText: {
        fontSize: DesignTokens.typography.fontSize.base,
        lineHeight: DesignTokens.typography.lineHeight.relaxed,
        color: theme.colors.text.secondary,
        fontStyle: "italic" as const,
      },
      authorText: {
        fontSize: DesignTokens.typography.fontSize.sm,
        fontWeight: DesignTokens.typography.fontWeight.medium,
        marginTop: DesignTokens.spacing[4],
        textAlign: "right" as const,
      },
    }),
    [theme]
  );

  if (!testimonial) {
    return null;
  }

  return (
    <ThemedView style={styles.section}>
      <ThemedText
        style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
      >
        Client Testimonial
      </ThemedText>
      <ThemedView style={styles.quoteContainer}>
        <ThemedText style={styles.quoteText}>
          &ldquo;{testimonial.text}&rdquo;
        </ThemedText>
        <ThemedText style={styles.authorText}>
          — {testimonial.author}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};
