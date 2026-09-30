import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

const CreateWorkspaceModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await axiosInstance.post("/api/workspaces", {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Workspace created");
      onCreated();
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't create the workspace."
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
              New team space
            </p>
            <h2 className="mt-1.5 text-xl font-semibold text-slate-900">
              Create a workspace
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
              htmlFor="ws-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Workspace name
            </label>
            <input
              id="ws-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className={inputClass}
              placeholder="e.g. Product Team"
            />
          </div>

          <div>
            <label
              htmlFor="ws-desc"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="ws-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              className={`${inputClass} resize-none`}
              placeholder="What is this workspace for?"
            />
          </div>

          <p className="text-xs text-slate-500">
            You'll be the Admin of this workspace.
          </p>

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
              {isSubmitting ? "Creating…" : "Create workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;