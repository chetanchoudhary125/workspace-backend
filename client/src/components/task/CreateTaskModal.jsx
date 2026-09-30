import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

const PRIORITIES = ["low", "medium", "high", "critical"];
const LABELS = [
  { value: "", label: "None" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "improvement", label: "Improvement" },
  { value: "chore", label: "Chore" },
];

const labelFor = (v) =>
  v === "Project_Manager" ? "Project Manager" : v.charAt(0).toUpperCase() + v.slice(1);

const CreateTaskModal = ({ projectId, projectMembers = [], onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [label, setLabel] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await axiosInstance.post(`/api/projects/${projectId}/tasks`, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        label: label || undefined,
        assigneeId: assigneeId || undefined,
        deadline: deadline || undefined,
      });
      toast.success("Task created");
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create the task.");
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
        className="w-full max-w-lg overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              New task
            </p>
            <h2 className="mt-1.5 text-xl font-semibold text-slate-900">
              Create a task
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

          <div>
            <label
              htmlFor="task-title"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={200}
              className={inputClass}
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label
              htmlFor="task-desc"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={5000}
              className={`${inputClass} resize-none`}
              placeholder="Add details, acceptance criteria, links…"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-priority"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputClass}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-label"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Label
              </label>
              <select
                id="task-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className={inputClass}
              >
                {LABELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-assignee"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Assignee{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={inputClass}
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => (
                  <option key={m._id} value={m.userId?._id || m.userId}>
                    {m.userId?.name || "Unknown"} · {labelFor(m.role)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-deadline"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Deadline{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <p className="text-xs text-slate-500">
            New tasks start in Backlog.
          </p>
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
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating…" : "Create task"}
          </button>
        </div>
        </form>

        
      </div>
    </div>
  );
};

export default CreateTaskModal;