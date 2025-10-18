import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

import { logError } from "./errorLogger";

const SEARCH_HISTORY_KEY = "@ace_search_history";
const MAX_HISTORY_ITEMS = 5;
const MIN_QUERY_LENGTH = 2;

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsedHistory = JSON.parse(stored) as SearchHistoryItem[];
        setHistory(parsedHistory);
      }
    } catch (error) {
      logError("Failed to load search history", { error });
    } finally {
      setIsLoading(false);
    }
  };

  // CRITICAL: Empty dependency array [] to prevent infinite loops
  const addToHistory = useCallback((query: string) => {
    const trimmedQuery = query.trim();

    // Validation: Only save queries ≥2 characters
    if (trimmedQuery.length < MIN_QUERY_LENGTH) return;

    // Use functional setState pattern
    setHistory((prev) => {
      // Remove duplicates case-insensitively
      const filtered = prev.filter(
        (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
      );

      // Add new item to start, keep only first 5 items
      const newHistory = [
        { query: trimmedQuery, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_HISTORY_ITEMS);

      // Save to AsyncStorage
      AsyncStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(newHistory)
      ).catch((error) => {
        logError("Failed to save search history", {
          error,
          query: trimmedQuery,
        });
      });

      return newHistory;
    });
  }, []); // Empty dependency array

  // CRITICAL: Empty dependency array [] to prevent infinite loops
  const removeFromHistory = useCallback((query: string) => {
    // Use functional setState pattern
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item.query !== query);

      // Save to AsyncStorage
      AsyncStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(newHistory)
      ).catch((error) => {
        logError("Failed to remove from search history", { error, query });
      });

      return newHistory;
    });
  }, []); // Empty dependency array

  // CRITICAL: Empty dependency array [] to prevent infinite loops
  const clearHistory = useCallback(() => {
    // Use functional setState pattern
    setHistory([]);

    // Remove from AsyncStorage
    AsyncStorage.removeItem(SEARCH_HISTORY_KEY).catch((error) => {
      logError("Failed to clear search history", { error });
    });
  }, []); // Empty dependency array

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
