import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const EditProjectModal = ({ project, role, onClose, onUpdated }) => {
  const canEditAll = role === "Admin";

  const [name, setName] = useState(project.name || "");
  const [description, setDescription] = useState(project.description || "");
  const [status, setStatus] = useState(project.status || "active");
  const [deadline, setDeadline] = useState(toDateInput(project.deadline));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = { status };
    if (deadline !== toDateInput(project.deadline)) {
      payload.deadline = deadline || null;
    }
    if (canEditAll) {
      payload.name = name.trim();
      payload.description = description.trim();
    }

    try {
      await axiosInstance.patch(`/api/projects/${project._id}`, payload);
      toast.success("Project updated");
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update the project.");
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
        className="w-full max-w-md overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Edit project
            </p>
            <h2 className="mt-1.5 text-xl font-semibold text-slate-900">
              {project.name}
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

        <form
          onSubmit={handleSubmit}
          className="max-h-[70vh] space-y-4 overflow-y-auto p-5 sm:p-6"
        >
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {canEditAll ? (
            <>
              <div>
                <label
                  htmlFor="edit-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="edit-desc"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Description{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="edit-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Project Managers can only update status and deadline.
            </p>
          )}

          <div>
            <label
              htmlFor="edit-status"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Status
            </label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-deadline"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Deadline{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="edit-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className={inputClass}
            />
            {project.deadline && (
              <button
                type="button"
                onClick={() => setDeadline("")}
                className="mt-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-800"
              >
                Clear deadline
              </button>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
