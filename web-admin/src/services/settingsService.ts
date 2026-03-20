import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AppSettings {
  minimumBuildNumber: number;
  pin: string;
}

export async function fetchAppSettings(): Promise<AppSettings> {
  const [versionSnap, editModeSnap] = await Promise.all([
    getDoc(doc(db, "config", "appVersion")),
    getDoc(doc(db, "config", "editMode")),
  ]);

  return {
    minimumBuildNumber: versionSnap.exists()
      ? (versionSnap.data().minimumBuildNumber ?? 0)
      : 0,
    pin: editModeSnap.exists() ? (editModeSnap.data().pin ?? "") : "",
  };
}

export async function updateMinimumBuildNumber(value: number): Promise<void> {
  await setDoc(
    doc(db, "config", "appVersion"),
    { minimumBuildNumber: value },
    { merge: true }
  );
}

export async function updatePin(pin: string): Promise<void> {
  await setDoc(
    doc(db, "config", "editMode"),
    { pin },
    { merge: true }
  );
}
