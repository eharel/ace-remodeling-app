import { File, Paths } from "expo-file-system";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Pdf from "react-native-pdf";

import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

interface PdfDisplayProps {
  uri: string;
}

export function PdfDisplay({ uri }: PdfDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const [pdfSource, setPdfSource] = useState<string | null>(null);

  // Generate a cache filename from the URI
  const getCacheFileName = (url: string): string => {
    // Simple hash function to create a unique filename
    const hash = url.split("").reduce((acc, char) => {
      return (acc << 5) - acc + char.charCodeAt(0);
    }, 0);
    return `pdf_${Math.abs(hash)}.pdf`;
  };

  const getCachedFile = (url: string): File => {
    const fileName = getCacheFileName(url);
    return new File(Paths.cache, fileName);
  };

  // Check if file exists in cache
  const checkCache = async (url: string): Promise<string | null> => {
    try {
      const file = getCachedFile(url);

      // Use info() method to check if file exists properly
      const info = file.info();

      if (info.exists && info.size && info.size > 0) {
        console.log("✅ PDF found in cache:", file.uri, "Size:", info.size);
        return file.uri;
      }

      console.log("📥 PDF not in cache, will download");
      return null;
    } catch (error) {
      console.error("Error checking cache:", error);
      return null;
    }
  };

  // Download and cache the PDF
  const downloadAndCache = async (url: string): Promise<string> => {
    const file = getCachedFile(url);

    setDownloading(true);
    setDownloadProgress(0);

    try {
      console.log("📥 Downloading PDF from:", url);

      // Use the File.downloadFileAsync static method to download
      const downloadedFile = await File.downloadFileAsync(url, file, {
        idempotent: true,
      });

      setDownloadProgress(100);
      console.log("✅ PDF downloaded and cached:", downloadedFile.uri);
      setDownloading(false);
      return downloadedFile.uri;
    } catch (error) {
      setDownloading(false);
      console.error("Download error:", error);
      throw error;
    }
  };

  // Load PDF with caching
  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if PDF is already cached
        const cached = await checkCache(uri);

        if (cached && isMounted) {
          setCachedUri(cached);
          setPdfSource(cached);
          setLoading(false);
          return;
        }

        // Download and cache if not found
        try {
          const downloaded = await downloadAndCache(uri);

          if (isMounted) {
            setCachedUri(downloaded);
            setPdfSource(downloaded);
            setLoading(false);
          }
        } catch (downloadError) {
          console.error("Download failed:", downloadError);
          if (isMounted) {
            // Fallback to original URI if download fails
            console.log("⚠️ Download failed, falling back to original URI");
            setPdfSource(uri);
            setLoading(false);
            setError(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading PDF:", err);
          // Final fallback to original URI
          console.log("⚠️ All caching failed, using original URI");
          setPdfSource(uri);
          setLoading(false);
          setError(null);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

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
    setDownloading(false);
    setDownloadProgress(0);
    setError(null);
    setPdfSource(null);
    setCachedUri(null);

    // Clear any potentially corrupted cache file on retry
    const clearCacheAndRetry = async () => {
      try {
        const file = getCachedFile(uri);
        if (file.exists) {
          console.log("🗑️ Clearing corrupted cache file");
          file.delete();
        }
      } catch (err) {
        console.log("Cache clear failed (not critical):", err);
      }

      // Now try loading fresh
      try {
        // Always download fresh on retry to avoid cache issues
        console.log("🔄 Retrying with fresh download");
        const downloaded = await downloadAndCache(uri);
        setCachedUri(downloaded);
        setPdfSource(downloaded);
        setLoading(false);
      } catch (err) {
        console.error("Retry failed:", err);
        // Final fallback to original URI
        setPdfSource(uri);
        setLoading(false);
      }
    };

    clearCacheAndRetry();
  };

  const getLoadingMessage = (): string => {
    if (downloading) {
      return `Downloading PDF... ${downloadProgress}%`;
    }
    if (cachedUri) {
      return "Loading from cache...";
    }
    return "Loading PDF...";
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <LoadingState message={getLoadingMessage()} />
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

      {!error && pdfSource && (
        <Pdf
          source={{ uri: pdfSource }}
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
