import { useState, useRef, useCallback, useEffect, DragEvent } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProject,
  updateProject,
  addMediaToComponent,
  addDocumentToComponent,
  toggleComponentFeatured,
  removeMediaFromComponent,
  removeDocumentFromComponent,
  addComponentToProject,
  removeComponentFromProject,
  setComponentThumbnail,
  reorderComponents,
  reorderMediaInComponent,
  renameDocument,
  updateProjectTags,
  updateComponentTags,
} from "@/services/projectsService";
import { uploadMediaFile, deleteMediaFile } from "@/services/mediaService";
import { uploadDocumentFile, deleteDocumentFile } from "@/services/documentService";
import {
  getCategoryLabel,
  CORE_CATEGORIES,
  COMMON_SUBCATEGORIES,
} from "@shared/types/ComponentCategory";
import type { ComponentCategory } from "@shared/types/ComponentCategory";
import { PROJECT_STATUSES, getStatusDisplayText } from "@shared/types/Status";
import { DOCUMENT_CATEGORIES } from "@shared/types/Document";
import { MEDIA_STAGES } from "@shared/types/MediaAsset";
import type { Project } from "@shared/types/Project";
import type { ProjectComponent } from "@shared/types/ProjectComponent";
import type { MediaStage } from "@shared/types/MediaAsset";
import type { Document as ProjectDocument, DocumentCategory } from "@shared/types/Document";
import type { ProjectStatus } from "@shared/types/Status";

// ─── Helpers ──────────────────────────────────────────────────────

const STATUS_STYLES: Record<ProjectStatus, string> = {
  completed: "bg-green-100 text-green-800",
  "in-progress": "bg-blue-100 text-blue-800",
  planning: "bg-amber-100 text-amber-800",
  "on-hold": "bg-gray-100 text-gray-600",
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {getStatusDisplayText(status)}
    </span>
  );
}

function Field({
  label,
  value,
  editValue,
  onChange,
  isEditing,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string;
  editValue: string;
  onChange: (v: string) => void;
  isEditing: boolean;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </label>
      {isEditing ? (
        multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          />
        ) : (
          <input
            type={type}
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        )
      ) : (
        <p className="text-sm text-gray-900 min-h-[1.5rem]">
          {value || <span className="text-gray-400">—</span>}
        </p>
      )}
    </div>
  );
}

function SortableMediaTile({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`aspect-square ${isDragging ? "opacity-50 z-10" : ""}`}
    >
      <div {...attributes} {...listeners} className="w-full h-full touch-none">
        {children}
      </div>
    </div>
  );
}

function DragHandle({ listeners, attributes }: { listeners?: Record<string, unknown>; attributes?: Record<string, unknown> }) {
  return (
    <div
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors px-1 touch-none select-none"
      title="Drag to reorder"
    >
      ⠿
    </div>
  );
}

function SortableComponentCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-50" : ""}
    >
      <div className="flex items-stretch gap-2 -ml-6">
        <div className="flex items-center pt-4">
          <DragHandle listeners={listeners as Record<string, unknown>} attributes={attributes as Record<string, unknown>} />
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

// ─── Tag Input ────────────────────────────────────────────────────

function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder = "Add tag…",
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function tryAdd(value: string) {
    const tag = value.trim().toLowerCase().replace(/,/g, "");
    if (!tag || tags.includes(tag)) return;
    onAdd(tag);
    setInput("");
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center p-2 border border-gray-200 rounded-lg bg-gray-50 min-h-[2.25rem]">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-300 rounded-full text-xs text-gray-700"
        >
          {tag}
          <button
            onClick={() => onRemove(tag)}
            className="text-gray-400 hover:text-red-500 leading-none"
            title="Remove tag"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => {
          const v = e.target.value;
          if (v.endsWith(",")) {
            tryAdd(v.slice(0, -1));
          } else {
            setInput(v);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); tryAdd(input); }
          if (e.key === "Backspace" && !input && tags.length > 0) {
            onRemove(tags[tags.length - 1]);
          }
        }}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[100px] bg-transparent text-xs outline-none text-gray-700 placeholder-gray-400"
      />
    </div>
  );
}

// ─── Add Component Form ───────────────────────────────────────────

function AddComponentForm({
  project,
  onDone,
}: {
  project: Project;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>(CORE_CATEGORIES.BATHROOM);
  const [customCategory, setCustomCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coreCategories = Object.values(CORE_CATEGORIES);
  const isCustom = category === "__custom__";
  const effectiveCategory: ComponentCategory = isCustom
    ? customCategory
    : category;

  const commonSubs = !isCustom
    ? (COMMON_SUBCATEGORIES as Record<string, { value: string; label: string }[]>)[category] ?? []
    : [];

  async function handleAdd() {
    if (!effectiveCategory) return;
    setIsSaving(true);
    setError(null);
    try {
      await addComponentToProject(project, {
        category: effectiveCategory,
        subcategory: subcategory || undefined,
        description: description || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add component");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="border border-dashed border-gray-300 rounded-xl p-5 space-y-4">
      <h4 className="text-sm font-semibold text-gray-700">New Component</h4>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubcategory("");
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
        >
          {coreCategories.map((cat) => (
            <option key={cat} value={cat}>
              {getCategoryLabel(cat)}
            </option>
          ))}
          <option value="__custom__">Custom…</option>
        </select>
        {isCustom && (
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="e.g. home-theater"
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        )}
      </div>

      {/* Subcategory */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Subcategory{" "}
          <span className="text-gray-400 normal-case font-normal">
            (optional)
          </span>
        </label>
        {commonSubs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {commonSubs.map((sub: { value: string; label: string }) => (
              <button
                key={sub.value}
                onClick={() =>
                  setSubcategory(sub.value === subcategory ? "" : sub.value)
                }
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  subcategory === sub.value
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
        <input
          type="text"
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          placeholder="Custom subcategory"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Description{" "}
          <span className="text-gray-400 normal-case font-normal">
            (optional)
          </span>
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={isSaving || (isCustom && !customCategory)}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {isSaving ? "Adding…" : "Add Component"}
        </button>
        <button
          onClick={onDone}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Component card ───────────────────────────────────────────────

function ComponentCard({
  component,
  project,
  onRemoved,
}: {
  component: ProjectComponent;
  project: Project;
  onRemoved: () => void;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Photo upload state
  const [showPhotoUploader, setShowPhotoUploader] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadStage, setUploadStage] = useState<MediaStage | "">("");
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Document upload state
  const [showDocUploader, setShowDocUploader] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState<DocumentCategory>("Other");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  // Featured toggle
  const [isTogglingFeatured, setIsTogglingFeatured] = useState(false);

  // Media tab + expansion
  const [activeMediaTab, setActiveMediaTab] = useState<MediaStage | "all">("all");
  const [showAllMedia, setShowAllMedia] = useState(false);

  // Thumbnail state
  const [settingThumbnailId, setSettingThumbnailId] = useState<string | null>(null);

  const mediaSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Carousel lightbox — scoped to the active tab (filteredMedia, computed below)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  // prev/next are called from keyboard handler; length injected via closure at event time
  const lightboxPrevWithLen = useCallback((len: number) =>
    setLightboxIndex((i) => (i !== null ? (i - 1 + len) % len : null)), []);
  const lightboxNextWithLen = useCallback((len: number) =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % len : null)), []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const len = (component.media ?? []).length;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") lightboxPrevWithLen(len);
      else if (e.key === "ArrowRight") lightboxNextWithLen(len);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, closeLightbox, lightboxPrevWithLen, lightboxNextWithLen, component.media]);

  // Rename document state
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isSavingRename, setIsSavingRename] = useState(false);

  // Delete state
  const [confirmDeleteAssetId, setConfirmDeleteAssetId] = useState<string | null>(null);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [confirmDeleteDocId, setConfirmDeleteDocId] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  // Remove component confirmation
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const addPhotoFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    setPendingFiles((prev) => [...prev, ...valid]);
  }, []);

  async function handlePhotoUpload() {
    if (pendingFiles.length === 0 || uploadStage === "") return;
    setIsUploadingPhotos(true);
    setPhotoError(null);
    try {
      const assets = [];
      for (const file of pendingFiles) {
        const result = await uploadMediaFile(file, {
          projectId: project.id,
          componentCategory: component.category,
          subcategory: component.subcategory,
          stage: uploadStage,
          caption: captions[file.name] || undefined,
        });
        if (!result.success || !result.asset) {
          setPhotoError(result.error ?? "Upload failed");
          return;
        }
        assets.push(result.asset);
      }
      await addMediaToComponent(project, component.id, assets);
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      setPendingFiles([]);
      setCaptions({});
      setShowPhotoUploader(false);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingPhotos(false);
    }
  }

  async function handleDocUpload() {
    if (!docFile) return;
    setIsUploadingDoc(true);
    setDocError(null);
    try {
      const result = await uploadDocumentFile(docFile, {
        projectId: project.id,
        category: docCategory,
        name: docName || docFile.name,
      });
      if (!result.success || !result.document) {
        setDocError(result.error ?? "Upload failed");
        return;
      }
      await addDocumentToComponent(project, component.id, result.document);
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      setDocFile(null);
      setDocName("");
      setShowDocUploader(false);
    } catch (err) {
      setDocError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingDoc(false);
    }
  }

  async function handleToggleFeatured() {
    setIsTogglingFeatured(true);
    try {
      await toggleComponentFeatured(
        project,
        component.id,
        !component.isFeatured
      );
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
    } finally {
      setIsTogglingFeatured(false);
    }
  }

  async function handleSetThumbnail(assetId: string, url: string) {
    const isAlreadyThumbnail = component.thumbnail === url;
    setSettingThumbnailId(assetId);
    try {
      await setComponentThumbnail(project, component.id, isAlreadyThumbnail ? undefined : url);
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
    } finally {
      setSettingThumbnailId(null);
    }
  }

  async function handleDeleteMedia(assetId: string, storagePath: string) {
    setConfirmDeleteAssetId(null);
    setDeletingAssetId(assetId);
    try {
      await deleteMediaFile(storagePath);
      await removeMediaFromComponent(project, component.id, assetId);
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
    } finally {
      setDeletingAssetId(null);
    }
  }

  async function handleDeleteDocument(docId: string, storagePath: string) {
    setConfirmDeleteDocId(null);
    setDeletingDocId(docId);
    try {
      await deleteDocumentFile(storagePath);
      await removeDocumentFromComponent(project, component.id, docId);
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
    } finally {
      setDeletingDocId(null);
    }
  }

  async function handleRenameDocument(docId: string) {
    if (!renameValue.trim()) return;
    setIsSavingRename(true);
    try {
      await renameDocument(project, component.id, docId, renameValue.trim());
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      setRenamingDocId(null);
    } finally {
      setIsSavingRename(false);
    }
  }

  async function handleMediaReorder(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = filteredMedia.findIndex((a) => a.id === active.id);
    const newIndex = filteredMedia.findIndex((a) => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    // Rebuild full media array with the reordered filtered segment spliced back in
    const reorderedFiltered = arrayMove(filteredMedia, oldIndex, newIndex);
    const filteredIds = new Set(filteredMedia.map((a) => a.id));
    const untouched = media.filter((a) => !filteredIds.has(a.id));
    const newMedia = [...reorderedFiltered, ...untouched];
    await reorderMediaInComponent(project, component.id, newMedia);
    queryClient.invalidateQueries({ queryKey: ["project", project.id] });
  }

  async function handleRemoveComponent() {
    setIsRemoving(true);
    try {
      await removeComponentFromProject(project, component.id);
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      onRemoved();
    } finally {
      setIsRemoving(false);
      setConfirmRemove(false);
    }
  }

  const media = component.media ?? [];
  const documents = component.documents ?? [];
  const categoryLabel = getCategoryLabel(component.category);
  const subcategoryLabel = component.subcategory
    ? component.subcategory
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : null;

  // Build tabs: only stages that actually have media
  const STAGE_LABELS: Record<MediaStage, string> = {
    before: "Before",
    after: "After",
    "in-progress": "In Progress",
    renderings: "Renderings",
    other: "Other",
  };
  const allStages = Object.keys(STAGE_LABELS) as MediaStage[];
  const showTabs = true;
  const filteredMedia =
    activeMediaTab === "all" ? media : media.filter((a) => a.stage === activeMediaTab);

  const GRID_CAP = 6;
  const visibleMedia = showAllMedia ? filteredMedia : filteredMedia.slice(0, GRID_CAP);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {component.thumbnail ? (
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <img
                src={component.thumbnail}
                alt="hero"
                className="w-12 h-12 rounded-lg object-cover ring-2 ring-amber-400"
              />
              <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Hero</span>
            </div>
          ) : null}
          <div>
            <span className="font-semibold text-gray-900">{categoryLabel}</span>
            {subcategoryLabel && (
              <span className="ml-2 text-sm text-gray-500">
                · {subcategoryLabel}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFeatured}
            disabled={isTogglingFeatured}
            title={
              component.isFeatured ? "Remove from featured" : "Mark as featured"
            }
            className={`text-sm px-3 py-1 rounded-full border transition-colors ${
              component.isFeatured
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-100"
            }`}
          >
            {component.isFeatured ? "★ Featured" : "☆ Feature"}
          </button>

          {/* Remove component */}
          {confirmRemove ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Remove component?</span>
              <button
                onClick={handleRemoveComponent}
                disabled={isRemoving}
                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-40 transition-colors"
              >
                {isRemoving ? "…" : "Yes"}
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              title="Remove component"
              className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Tags
          </label>
          <TagInput
            tags={component.tags ?? []}
            onAdd={async (tag) => {
              const newTags = [...(component.tags ?? []), tag];
              await updateComponentTags(project, component.id, newTags);
              queryClient.invalidateQueries({ queryKey: ["project", project.id] });
            }}
            onRemove={async (tag) => {
              const newTags = (component.tags ?? []).filter((t) => t !== tag);
              await updateComponentTags(project, component.id, newTags);
              queryClient.invalidateQueries({ queryKey: ["project", project.id] });
            }}
            placeholder="Add tag (e.g. marble, white oak)…"
          />
        </div>

        {/* Photos section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Photos & Videos <span className="text-gray-400 font-normal">({media.length})</span>
            </h4>
            <button
              onClick={() => {
                setShowPhotoUploader((s) => !s);
                if (showPhotoUploader) {
                  setPendingFiles([]);
                  setCaptions({});
                  setUploadStage("");
                }
              }}
              className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors text-gray-700"
            >
              {showPhotoUploader ? "Cancel" : "+ Add Photos"}
            </button>
          </div>

          {/* Existing media grid */}
          {media.length > 0 && (
            <div className="space-y-2">
              {/* Stage tabs */}
              {showTabs && (
                <div className="flex gap-1 border-b border-gray-200 mb-3">
                  <button
                    onClick={() => { setActiveMediaTab("all"); setShowAllMedia(false); }}
                    className={`px-3 py-1.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
                      activeMediaTab === "all"
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All ({media.length})
                  </button>
                  {allStages.map((stage) => {
                    const count = media.filter((a) => a.stage === stage).length;
                    return (
                      <button
                        key={stage}
                        onClick={() => { setActiveMediaTab(stage); setShowAllMedia(false); }}
                        className={`px-3 py-1.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
                          activeMediaTab === stage
                            ? "border-gray-900 text-gray-900"
                            : count === 0
                            ? "border-transparent text-gray-300 hover:text-gray-400"
                            : "border-transparent text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        {STAGE_LABELS[stage]} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
              <DndContext
                sensors={mediaSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleMediaReorder}
              >
              <SortableContext items={visibleMedia.map((a) => a.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-6 gap-2">
                {visibleMedia.map((asset) => {
                  const isThumbnail = component.thumbnail === asset.url;
                  return (
                    <SortableMediaTile key={asset.id} id={asset.id}>
                    <div
                      className="relative aspect-square rounded overflow-hidden bg-gray-100 group w-full h-full"
                    >
                      {asset.mediaType === "image" ? (
                        <button
                          onClick={() => setLightboxIndex(filteredMedia.indexOf(asset))}
                          className="w-full h-full"
                        >
                          <img
                            src={asset.url}
                            alt={asset.caption ?? asset.filename}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : asset.thumbnailUrl ? (
                        <button
                          onClick={() => setLightboxIndex(filteredMedia.indexOf(asset))}
                          className="relative w-full h-full"
                        >
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.caption ?? asset.filename}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-white text-lg drop-shadow pointer-events-none">
                            ▶
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setLightboxIndex(filteredMedia.indexOf(asset))}
                          className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400 text-xs hover:text-gray-200 transition-colors"
                        >
                          ▶ Video
                        </button>
                      )}

                      {/* Thumbnail star badge (always visible if set) */}
                      {isThumbnail && confirmDeleteAssetId !== asset.id && (
                        <span className="absolute top-1 left-1 text-amber-400 text-sm leading-none drop-shadow pointer-events-none">
                          ★
                        </span>
                      )}

                      {/* Delete confirmation overlay */}
                      {confirmDeleteAssetId === asset.id ? (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1.5 p-1">
                          <span className="text-white text-xs font-medium text-center leading-tight">Delete?</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDeleteMedia(asset.id, asset.storagePath)}
                              disabled={deletingAssetId === asset.id}
                              className="px-2 py-0.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-40"
                            >
                              {deletingAssetId === asset.id ? "…" : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteAssetId(null)}
                              className="px-2 py-0.5 bg-white/20 text-white text-xs rounded hover:bg-white/30"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Hover action buttons */
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="absolute inset-0 bg-black/30" />
                          {/* Star (thumbnail) button — top left */}
                          {asset.mediaType === "image" && (
                            <button
                              onClick={() => handleSetThumbnail(asset.id, asset.url)}
                              disabled={settingThumbnailId === asset.id}
                              title={isThumbnail ? "Clear thumbnail" : "Set as thumbnail"}
                              className="absolute top-1 left-1 text-base leading-none drop-shadow disabled:opacity-40 pointer-events-auto"
                            >
                              {settingThumbnailId === asset.id ? (
                                <span className="text-white text-xs">…</span>
                              ) : (
                                <span className={isThumbnail ? "text-amber-400" : "text-white/70 hover:text-amber-300"}>
                                  ★
                                </span>
                              )}
                            </button>
                          )}
                          {/* Delete button — top right */}
                          <button
                            onClick={() => setConfirmDeleteAssetId(asset.id)}
                            disabled={deletingAssetId === asset.id}
                            title="Delete"
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-sm leading-none hover:bg-red-700 disabled:opacity-40 pointer-events-auto"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    </SortableMediaTile>
                  );
                })}
                {/* Show more / less toggle tile */}
                {!showAllMedia && filteredMedia.length > GRID_CAP && (
                  <button
                    onClick={() => setShowAllMedia(true)}
                    className="aspect-square rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    +{filteredMedia.length - GRID_CAP}
                  </button>
                )}
              </div>
              </SortableContext>
              </DndContext>
              {showAllMedia && filteredMedia.length > GRID_CAP && (
                <button
                  onClick={() => setShowAllMedia(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Show less
                </button>
              )}
            </div>
          )}

          {/* Photo uploader */}
          {showPhotoUploader && (
            <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3 mt-3">
              {/* Drop zone */}
              <div
                onDragOver={(e: DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e: DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e: DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  setIsDragging(false);
                  addPhotoFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <p className="text-sm text-gray-500">
                  Drop photos/videos here, or{" "}
                  <span className="text-blue-600 font-medium">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, MP4, MOV
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => addPhotoFiles(e.target.files)}
              />

              {/* Stage selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-gray-600 shrink-0">
                  Stage:
                </label>
                <select
                  value={uploadStage}
                  onChange={(e) =>
                    setUploadStage(e.target.value as MediaStage | "")
                  }
                  className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                    uploadStage === ""
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-gray-300"
                  }`}
                >
                  <option value="" disabled>
                    — Select a stage —
                  </option>
                  {Object.values(MEDIA_STAGES).map((value) => (
                    <option key={value} value={value}>
                      {value.charAt(0).toUpperCase() +
                        value.slice(1).replace(/-/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              {uploadStage === "" && pendingFiles.length > 0 && (
                <p className="text-xs text-amber-700">
                  Select a stage before uploading.
                </p>
              )}

              {/* Pending files preview */}
              {pendingFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">
                    {pendingFiles.length} file
                    {pendingFiles.length !== 1 ? "s" : ""} selected
                  </p>
                  {pendingFiles.map((file) => (
                    <div key={file.name} className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0">
                        {file.type.startsWith("image/") && (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {file.type.startsWith("video/") && (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            ▶
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder={`Caption (optional)`}
                        value={captions[file.name] ?? ""}
                        onChange={(e) =>
                          setCaptions((prev) => ({
                            ...prev,
                            [file.name]: e.target.value,
                          }))
                        }
                        className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                      />
                      <button
                        onClick={() =>
                          setPendingFiles((prev) =>
                            prev.filter((f) => f !== file)
                          )
                        }
                        className="text-gray-400 hover:text-red-500 text-sm shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photoError && (
                <p className="text-xs text-red-600">{photoError}</p>
              )}

              <button
                onClick={handlePhotoUpload}
                disabled={pendingFiles.length === 0 || isUploadingPhotos || uploadStage === ""}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                {isUploadingPhotos
                  ? "Uploading…"
                  : `Upload ${pendingFiles.length > 0 ? pendingFiles.length + " " : ""}Photo${pendingFiles.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          )}
        </div>

        {/* Documents section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Documents <span className="text-gray-400 font-normal">({documents.length})</span>
            </h4>
            <button
              onClick={() => {
                setShowDocUploader((s) => !s);
                if (showDocUploader) {
                  setDocFile(null);
                  setDocName("");
                }
              }}
              className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors text-gray-700"
            >
              {showDocUploader ? "Cancel" : "+ Add Document"}
            </button>
          </div>

          {/* Existing documents */}
          {documents.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {documents.map((d: ProjectDocument) => (
                <div key={d.id} className="flex items-center gap-2 text-sm group">
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono shrink-0">
                    {d.fileType}
                  </span>

                  {renamingDocId === d.id ? (
                    /* Inline rename */
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameDocument(d.id);
                            if (e.key === "Escape") setRenamingDocId(null);
                          }}
                          placeholder="Display name"
                          className="flex-1 px-2 py-0.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 min-w-0"
                        />
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono shrink-0">
                          {d.fileType}
                        </span>
                        <button
                          onClick={() => handleRenameDocument(d.id)}
                          disabled={isSavingRename || !renameValue.trim()}
                          className="text-xs px-2 py-0.5 bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-40 shrink-0"
                        >
                          {isSavingRename ? "…" : "Save"}
                        </button>
                        <button
                          onClick={() => setRenamingDocId(null)}
                          className="text-xs px-2 py-0.5 border border-gray-300 rounded hover:bg-gray-100 shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">Display name only — the file itself is not affected.</p>
                    </div>
                  ) : (
                    <>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 hover:text-blue-600 hover:underline flex-1 truncate"
                      >
                        {d.name}
                      </a>
                      <span className="text-xs text-gray-400 shrink-0">({d.category})</span>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setRenamingDocId(d.id); setRenameValue(d.name.replace(/\.[^/.]+$/, "")); setConfirmDeleteDocId(null); }}
                          title="Rename"
                          className="text-gray-400 hover:text-gray-600 text-xs leading-none"
                        >
                          ✎
                        </button>
                        {confirmDeleteDocId === d.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Delete?</span>
                            <button
                              onClick={() => handleDeleteDocument(d.id, d.storagePath)}
                              disabled={deletingDocId === d.id}
                              className="text-xs px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-40"
                            >
                              {deletingDocId === d.id ? "…" : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteDocId(null)}
                              className="text-xs px-1.5 py-0.5 border border-gray-300 rounded hover:bg-gray-100"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteDocId(d.id)}
                            disabled={deletingDocId === d.id}
                            title="Delete"
                            className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Document uploader */}
          {showDocUploader && (
            <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  File
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => docInputRef.current?.click()}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    Choose file
                  </button>
                  <span className="text-xs text-gray-500">
                    {docFile ? docFile.name : "No file chosen"}
                  </span>
                </div>
                <input
                  ref={docInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setDocFile(f);
                    if (f && !docName)
                      setDocName(f.name.replace(/\.[^/.]+$/, ""));
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Document name"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) =>
                    setDocCategory(e.target.value as DocumentCategory)
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                >
                  {Object.values(DOCUMENT_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {docError && (
                <p className="text-xs text-red-600">{docError}</p>
              )}

              <button
                onClick={handleDocUpload}
                disabled={!docFile || isUploadingDoc}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
              >
                {isUploadingDoc ? "Uploading…" : "Upload Document"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Carousel lightbox */}
      {lightboxIndex !== null && filteredMedia[lightboxIndex] && (() => {
        const asset = filteredMedia[lightboxIndex];
        return (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300 z-10"
            >
              ×
            </button>

            {/* Counter + caption */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10">
              <span className="text-white/60 text-sm">
                {lightboxIndex + 1} / {filteredMedia.length}
              </span>
              {asset.caption && (
                <span className="text-white text-sm">{asset.caption}</span>
              )}
            </div>

            {/* Prev */}
            {filteredMedia.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrevWithLen(filteredMedia.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl leading-none hover:text-gray-300 z-10 px-2"
              >
                ‹
              </button>
            )}

            {/* Media */}
            <div onClick={(e) => e.stopPropagation()} className="max-w-5xl max-h-[85vh] flex items-center justify-center">
              {asset.mediaType === "image" ? (
                <img
                  key={asset.id}
                  src={asset.url}
                  alt={asset.caption ?? asset.filename}
                  className="max-w-full max-h-[85vh] rounded-lg object-contain"
                />
              ) : (
                <video
                  key={asset.id}
                  src={asset.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-lg"
                />
              )}
            </div>

            {/* Next */}
            {filteredMedia.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNextWithLen(filteredMedia.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl leading-none hover:text-gray-300 z-10 px-2"
              >
                ›
              </button>
            )}

            {/* Stage badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <span className="text-white/50 text-xs uppercase tracking-wide">
                {STAGE_LABELS[asset.stage]}
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────

type MetadataDraft = {
  name: string;
  number: string;
  status: ProjectStatus;
  summary: string;
  description: string;
  neighborhood: string;
  timelineStart: string;
  timelineEnd: string;
};

function draftFromProject(project: Project): MetadataDraft {
  return {
    name: project.name,
    number: project.number,
    status: project.status,
    summary: project.summary,
    description: project.description,
    neighborhood: project.location?.neighborhood ?? "",
    timelineStart: project.timeline?.start ?? "",
    timelineEnd: project.timeline?.end ?? "",
  };
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { data: project, isLoading, error, refetch } = useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id!),
    enabled: !!id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const addComponentRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<MetadataDraft>({
    name: "",
    number: "",
    status: "completed",
    summary: "",
    description: "",
    neighborhood: "",
    timelineStart: "",
    timelineEnd: "",
  });

  function startEdit() {
    if (!project) return;
    setDraft(draftFromProject(project));
    setIsEditing(true);
    setSaveError(null);
  }

  function cancelEdit() {
    setIsEditing(false);
    setSaveError(null);
  }

  async function saveEdit() {
    if (!project) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateProject(project.id, {
        name: draft.name,
        number: draft.number,
        status: draft.status,
        summary: draft.summary,
        description: draft.description,
        location: {
          ...project.location,
          neighborhood: draft.neighborhood || undefined,
        },
        timeline: {
          ...project.timeline,
          start: draft.timelineStart || undefined,
          end: draft.timelineEnd || undefined,
        },
      });
      await refetch();
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  function setField<K extends keyof MetadataDraft>(key: K, value: MetadataDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading project…
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <p className="text-red-600 text-sm">Failed to load project.</p>
        <Link
          to="/projects"
          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
        >
          ← Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/projects"
            className="text-xs font-medium text-gray-400 hover:text-gray-600 mb-2 inline-flex items-center gap-1 uppercase tracking-wide"
          >
            ← Projects
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">
              #{project.number} — {project.name}
            </h1>
            <StatusBadge status={project.status} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1 shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={isSaving}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors shadow-sm"
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium text-gray-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {saveError}
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">
          Project Info
        </h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field
            label="Name"
            value={project.name}
            editValue={draft.name}
            onChange={(v) => setField("name", v)}
            isEditing={isEditing}
          />
          <Field
            label="Number"
            value={project.number}
            editValue={draft.number}
            onChange={(v) => setField("number", v)}
            isEditing={isEditing}
          />

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Status
            </label>
            {isEditing ? (
              <select
                value={draft.status}
                onChange={(e) =>
                  setField("status", e.target.value as ProjectStatus)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              >
                {Object.values(PROJECT_STATUSES).map((s) => (
                  <option key={s} value={s}>
                    {getStatusDisplayText(s)}
                  </option>
                ))}
              </select>
            ) : (
              <StatusBadge status={project.status} />
            )}
          </div>

          <Field
            label="Neighborhood"
            value={project.location?.neighborhood ?? ""}
            editValue={draft.neighborhood}
            onChange={(v) => setField("neighborhood", v)}
            isEditing={isEditing}
          />
          <Field
            label="Timeline Start"
            value={project.timeline?.start ?? ""}
            editValue={draft.timelineStart}
            onChange={(v) => setField("timelineStart", v)}
            isEditing={isEditing}
            type="date"
          />
          <Field
            label="Timeline End"
            value={project.timeline?.end ?? ""}
            editValue={draft.timelineEnd}
            onChange={(v) => setField("timelineEnd", v)}
            isEditing={isEditing}
            type="date"
          />
        </div>
        <Field
          label="Summary"
          value={project.summary}
          editValue={draft.summary}
          onChange={(v) => setField("summary", v)}
          isEditing={isEditing}
          multiline
        />
        <Field
          label="Description"
          value={project.description}
          editValue={draft.description}
          onChange={(v) => setField("description", v)}
          isEditing={isEditing}
          multiline
        />
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Project Tags
          </label>
          <TagInput
            tags={project.tags ?? []}
            onAdd={async (tag) => {
              const newTags = [...(project.tags ?? []), tag];
              await updateProjectTags(project.id, newTags);
              queryClient.invalidateQueries({ queryKey: ["project", project.id] });
            }}
            onRemove={async (tag) => {
              const newTags = (project.tags ?? []).filter((t) => t !== tag);
              await updateProjectTags(project.id, newTags);
              queryClient.invalidateQueries({ queryKey: ["project", project.id] });
            }}
            placeholder="Add project-level tag (e.g. luxury, historic)…"
          />
        </div>
      </div>

      {/* Components */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">
            Components <span className="text-gray-400 font-normal">({project.components.length})</span>
          </h2>
          {!showAddComponent && (
            <button
              onClick={() => {
                setShowAddComponent(true);
                setTimeout(() => addComponentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
              }}
              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors text-gray-700"
            >
              + Add Component
            </button>
          )}
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={async (event) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;
            const oldIndex = project.components.findIndex((c) => c.id === active.id);
            const newIndex = project.components.findIndex((c) => c.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return;
            await reorderComponents(project, arrayMove(project.components, oldIndex, newIndex));
            queryClient.invalidateQueries({ queryKey: ["project", project.id] });
          }}
        >
          <SortableContext items={project.components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
          {project.components.map((component) => (
            <SortableComponentCard key={component.id} id={component.id}>
              <ComponentCard
                component={component}
                project={project}
                onRemoved={() => {}}
              />
            </SortableComponentCard>
          ))}
          {showAddComponent && (
            <div ref={addComponentRef}>
            <AddComponentForm
              project={project}
              onDone={() => setShowAddComponent(false)}
            />
            </div>
          )}
          </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
