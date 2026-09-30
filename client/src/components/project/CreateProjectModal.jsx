import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

const CreateProjectModal = ({ workspaceId, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await axiosInstance.post(`/api/workspaces/${workspaceId}/projects`, {
        name: name.trim(),
        description: description.trim() || undefined,
        deadline: deadline || undefined,
      });
      toast.success("Project created");
      onCreated();
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't create the project."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[26px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              New project
            </p>
            <h2 className="mt-1.5 text-xl font-semibold text-slate-900">
              Create a project
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="project-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Project name
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className={inputClass}
              placeholder="e.g. Mobile App v2"
            />
          </div>

          <div>
            <label
              htmlFor="project-desc"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              className={`${inputClass} resize-none`}
              placeholder="What is this project about?"
            />
          </div>

          <div>
            <label
              htmlFor="project-deadline"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Deadline{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="project-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating…" : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;