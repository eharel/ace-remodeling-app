import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllProjects,
  createProject,
  CreateProjectInput,
} from "@/services/projectsService";
import {
  CORE_CATEGORIES,
  CORE_CATEGORY_LABELS,
  getCategoryLabel,
} from "@shared/types/ComponentCategory";
import { getStatusDisplayText } from "@shared/types/Status";
import type { Project } from "@shared/types/Project";
import type { ProjectStatus } from "@shared/types/Status";
import type { ComponentCategory } from "@shared/types/ComponentCategory";

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

function getCategoryForRow(project: Project): string {
  const categories = [
    ...new Set(project.components.map((c) => getCategoryLabel(c.category))),
  ];
  return categories.join(", ");
}

// ─── Create Project Modal ─────────────────────────────────────────

function CreateProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (projectId: string) => void;
}) {
  const [form, setForm] = useState({
    number: "",
    name: "",
    category: "bathroom" as ComponentCategory,
    subcategory: "",
    neighborhood: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.number.trim() || !form.name.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const input: CreateProjectInput = {
        number: form.number.trim(),
        name: form.name.trim(),
        category: form.category,
        subcategory: form.subcategory.trim() || undefined,
        neighborhood: form.neighborhood.trim() || undefined,
      };
      const project = await createProject(input);
      onCreated(project.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create project"
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">
          New Project
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Project #
              </label>
              <input
                type="text"
                value={form.number}
                onChange={(e) => setField("number", e.target.value)}
                placeholder="e.g. 188"
                required
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Neighborhood
              </label>
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) => setField("neighborhood", e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Smith Residence Kitchen"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setField("category", e.target.value as ComponentCategory)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              >
                {Object.values(CORE_CATEGORIES).map((value) => (
                  <option key={value} value={value}>
                    {CORE_CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                value={form.subcategory}
                onChange={(e) => setField("subcategory", e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              {isSubmitting ? "Creating…" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Projects Page ────────────────────────────────────────────────

export function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchAllProjects,
  });

  const filtered = projects
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.number.toLowerCase().includes(q) ||
        (p.location?.neighborhood?.toLowerCase().includes(q) ?? false)
      );
    })
    .filter((p) => {
      if (categoryFilter === "all") return true;
      return p.components.some((c) => c.category === categoryFilter);
    })
    .sort((a, b) => Number(b.number) - Number(a.number));

  function handleCreated(projectId: string) {
    setShowCreateModal(false);
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    navigate(`/projects/${projectId}`);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
        >
          + New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by name, number, or neighborhood…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
        >
          <option value="all">All categories</option>
          {Object.values(CORE_CATEGORIES).map((value) => (
            <option key={value} value={value}>
              {CORE_CATEGORY_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Loading projects…
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg">
          Failed to load projects. Check your Firebase connection.
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="text-xs text-gray-400 mb-2">
            {filtered.length} of {projects.length} projects
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-medium w-16">#</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Neighborhood
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-center font-medium w-12">
                    Components
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-gray-400"
                    >
                      No projects match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <td className="px-4 py-3 text-gray-500 font-mono">
                        {project.number}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {project.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {getCategoryForRow(project)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {project.location?.neighborhood ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">
                        {project.components.length}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
