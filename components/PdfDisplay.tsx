import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Pdf from "react-native-pdf";

import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

interface PdfDisplayProps {
  uri: string;
}

export function PdfDisplay({ uri }: PdfDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoadComplete = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = (error: any) => {
    setLoading(false);
    setError(error?.message || "Failed to load PDF");
    console.error("PDF Load Error:", error);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <LoadingState message="Loading PDF..." />
        </View>
      )}

      {error && (
        <ErrorState
          title="PDF Load Error"
          message={error}
          onRetry={handleRetry}
          icon="picture-as-pdf"
        />
      )}

      {!error && (
        <Pdf
          source={{ uri }}
          style={styles.pdf}
          onLoadComplete={handleLoadComplete}
          onError={handleError}
          trustAllCerts={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    backgroundColor: "transparent",
  },
  pdf: {
    flex: 1,
  },
});
