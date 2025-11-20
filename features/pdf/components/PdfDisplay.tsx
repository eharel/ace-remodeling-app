import { File, Paths } from "expo-file-system";
import { getDownloadURL, ref } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Pdf from "react-native-pdf";

import { storage } from "@/core/config";
import { ErrorState, LoadingState } from "@/shared/components";

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
        return file.uri;
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  // Download and cache the PDF
  const downloadAndCache = async (url: string): Promise<string> => {
    const file = getCachedFile(url);

    setDownloading(true);
    setDownloadProgress(0);

    try {
      let downloadUrl = url;

      // Check if this is a Firebase Storage URL with storagePath
      // If it's a Firebase URL, try to get a fresh download URL
      if (url.includes("firebasestorage.googleapis.com")) {
        try {
          // Extract the storage path from the URL
          // URL format: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[path]?alt=media&token=[token]
          const urlParts = url.split("/o/");
          if (urlParts.length > 1) {
            const pathPart = urlParts[1].split("?")[0];
            const storagePath = decodeURIComponent(pathPart);

            // Get a fresh download URL from Firebase Storage
            const storageRef = ref(storage, storagePath);
            downloadUrl = await getDownloadURL(storageRef);
          }
        } catch (firebaseError) {
          // Continue with original URL
        }
      }

      // Validate the URL
      const response = await fetch(downloadUrl, { method: "HEAD" });
      if (!response.ok) {
        throw new Error(
          `URL validation failed: ${response.status} ${response.statusText}`
        );
      }

      // Use the File.downloadFileAsync static method to download
      const downloadedFile = await File.downloadFileAsync(downloadUrl, file, {
        idempotent: true,
      });

      setDownloadProgress(100);
      setDownloading(false);
      return downloadedFile.uri;
    } catch (error) {
      setDownloading(false);

      // If it's a 400 error, it's likely an invalid/expired URL
      if (error instanceof Error && error.message.includes("400")) {
        throw new Error(
          "PDF URL is invalid or expired. Please contact support."
        );
      }

      throw error;
    }
  };

  // Fallback to test PDF for development when Firebase fails
  const getFallbackUrl = (originalUrl: string): string => {
    if (originalUrl.includes("firebasestorage.googleapis.com")) {
      return "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    }
    return originalUrl;
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
          if (isMounted) {
            // Check if it's a URL validation error
            if (
              downloadError instanceof Error &&
              downloadError.message.includes("URL validation failed")
            ) {
              // Try fallback URL for development
              const fallbackUrl = getFallbackUrl(uri);
              if (fallbackUrl !== uri) {
                try {
                  const fallbackDownloaded = await downloadAndCache(
                    fallbackUrl
                  );
                  setCachedUri(fallbackDownloaded);
                  setPdfSource(fallbackDownloaded);
                  setLoading(false);
                  return;
                } catch (fallbackError) {
                  // Fallback failed
                }
              }
              setError(
                "PDF URL is invalid or expired. Please contact support."
              );
              setLoading(false);
            } else {
              // Fallback to original URI for other errors
              setPdfSource(uri);
              setLoading(false);
              setError(null);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          // Final fallback to original URI
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
          file.delete();
        }
      } catch (err) {
        // Cache clear failed (not critical)
      }

      // Now try loading fresh
      try {
        // Always download fresh on retry to avoid cache issues
        const downloaded = await downloadAndCache(uri);
        setCachedUri(downloaded);
        setPdfSource(downloaded);
        setLoading(false);
      } catch (err) {
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
