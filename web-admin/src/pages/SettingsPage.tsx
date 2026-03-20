import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAppSettings,
  updateMinimumBuildNumber,
  updatePin,
} from "@/services/settingsService";

// ─── Shared section wrapper ───────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

// ─── Build number section ─────────────────────────────────────────

function BuildNumberSection({ current }: { current: number }) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(String(current));
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = parseInt(value, 10);
  const isValid = !isNaN(parsed) && parsed >= 0;
  const isDirty = parsed !== current;

  async function handleSave() {
    if (!isValid || !isDirty) return;
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateMinimumBuildNumber(parsed);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Section
      title="Minimum Build Number"
      description="Users running a build older than this number will see an 'Update Now' banner in the app. Set this to the latest production build number after each release."
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setSaved(false);
            }}
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={!isValid || !isDirty || isSaving}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
        {saved && (
          <span className="text-xs text-green-600 font-medium">Saved</span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-gray-400">
        Current value in DB: <span className="font-mono font-medium text-gray-600">{current}</span>
      </p>
    </Section>
  );
}

// ─── PIN section ──────────────────────────────────────────────────

function PinSection({ current }: { current: string }) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(current);
  const [showPin, setShowPin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = value !== current;
  const isValid = value.trim().length >= 4;

  async function handleSave() {
    if (!isValid || !isDirty) return;
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updatePin(value.trim());
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Section
      title="Access PIN"
      description="Shared PIN used to log in to this admin panel and to enable edit mode in the mobile app. Changing this takes effect immediately — anyone currently logged in will need to re-enter it next session."
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type={showPin ? "text" : "password"}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setSaved(false);
            }}
            className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPin((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            title={showPin ? "Hide" : "Show"}
          >
            {showPin ? "Hide" : "Show"}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!isValid || !isDirty || isSaving}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
        {saved && (
          <span className="text-xs text-green-600 font-medium">Saved</span>
        )}
      </div>
      {!isValid && isDirty && (
        <p className="text-xs text-amber-600">PIN must be at least 4 characters.</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </Section>
  );
}

// ─── Main page ────────────────────────────────────────────────────

export function SettingsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchAppSettings,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading settings…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-red-600 text-sm">Failed to load settings.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      <BuildNumberSection current={data.minimumBuildNumber} />
      <PinSection current={data.pin} />
    </div>
  );
}
