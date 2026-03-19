import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SESSION_KEY = "ace-admin-authed";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (pin: string) => Promise<boolean>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [configPin, setConfigPin] = useState<string | null>(null);

  useEffect(() => {
    // Restore session first so the UI doesn't flash the login screen on refresh.
    const storedSession = sessionStorage.getItem(SESSION_KEY);
    if (storedSession === "true") {
      setIsAuthenticated(true);
    }

    // Fetch the PIN from Firestore regardless — we need it for future sign-ins.
    getDoc(doc(db, "config", "editMode"))
      .then((snap) => {
        if (snap.exists()) {
          const pin = snap.data()?.pin as string | undefined;
          if (pin) setConfigPin(pin);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch editMode config:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const signIn = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!configPin) return false;
      const success = pin === configPin;
      if (success) {
        sessionStorage.setItem(SESSION_KEY, "true");
        setIsAuthenticated(true);
      }
      return success;
    },
    [configPin],
  );

  const signOut = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
