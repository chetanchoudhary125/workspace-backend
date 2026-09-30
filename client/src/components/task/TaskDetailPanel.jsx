import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import {
  Check,
  Loader2,
  Lock,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";
import EmptyState from "../common/EmptyState";
import CommentsSection from "./CommentsSection";
import TaskPanelMeta from "./TaskPanelMeta";
import TaskPanelFields from "./TaskPanelFields";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime, timeAgo } from "../../utils/dates";
import { FIELD_INPUT_CLASS, TASK_STATUSES } from "../../utils/task";

const emptyDraft = (task) => ({
  title: task.title || "",
  description: task.description || "",
  priority: task.priority || "medium",
  label: task.label || "",
  assigneeId: task.assigneeId?._id || "",
  deadline: task.deadline
    ? new Date(task.deadline).toISOString().slice(0, 10)
    : "",
});

const TaskDetailPanel = ({ taskId, onClose, onChanged }) => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const { projectMembers = [], role } = useOutletContext() || {};

  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(`/api/tasks/${taskId}`);
      setTask(data.task);
      setDraft(emptyDraft(data.task));
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !isEditing) onCloseRef.current?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isEditing]);

  const canEditAll = role === "Admin" || role === "Project_Manager";
  const canEditStatus =
    role === "Admin" ||
    role === "Project_Manager" ||
    (role === "Developer" && task?.assigneeId?._id === user?._id);
  const canDelete = role === "Admin" || role === "Project_Manager";

  const handleStatusChange = async (next) => {
    if (!task || task.status === next) return;
    const previous = task.status;
    setTask({ ...task, status: next });
    try {
      await axiosInstance.patch(`/api/tasks/${taskId}/status`, {
        status: next,
      });
      const label = TASK_STATUSES.find((s) => s.value === next)?.label;
      toast.success(`Moved to ${label}`);
      onChanged?.();
    } catch (err) {
      setTask({ ...task, status: previous });
      toast.error(err.response?.data?.message || "Couldn't move the task.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.patch(`/api/tasks/${taskId}`, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        priority: draft.priority,
        label: draft.label || null,
        assigneeId: draft.assigneeId || null,
        deadline: draft.deadline || null,
      });
      toast.success("Task updated");
      setIsEditing(false);
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save the task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraft(emptyDraft(task));
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}`);
      toast.success("Task deleted");
      onChanged?.();
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete the task.");
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-900/40"
      onClick={() => !isEditing && onClose?.()}
    >
      <aside
        className="flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Task
            </p>
            {isEditing ? (
              <input
                type="text"
                value={draft.title}
                onChange={(e) =>
                  setDraft({ ...draft, title: e.target.value })
                }
                maxLength={200}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-lg font-semibold text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            ) : (
              <h2 className="mt-1.5 line-clamp-2 text-lg font-semibold leading-snug text-slate-900">
                {isLoading ? "Loading…" : task?.title || "Task"}
              </h2>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {canEditAll && !isEditing && !isLoading && task && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="space-y-4 p-5 sm:p-6">
              <div className="h-8 w-32 animate-pulse rounded-full bg-slate-100" />
              <div className="h-24 animate-pulse rounded-xl bg-slate-50" />
              <div className="h-20 animate-pulse rounded-xl bg-slate-50" />
            </div>
          )}

          {!isLoading && error && (
            <div className="p-5 sm:p-6">
              <EmptyState
                icon={error.response?.status === 403 ? Lock : MessageSquare}
                title={
                  error.response?.status === 403
                    ? "You don't have access to this task"
                    : "Couldn't load the task"
                }
                description={
                  error.response?.data?.message ||
                  "Something went wrong while loading this task."
                }
                action={
                  error.response?.status !== 403 ? (
                    <button
                      type="button"
                      onClick={load}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Try again
                    </button>
                  ) : null
                }
              />
            </div>
          )}

          {!isLoading && !error && task && (
            <>
              <TaskPanelMeta
                task={task}
                canEditStatus={canEditStatus}
                onStatusChange={handleStatusChange}
              />

              {/* Description */}
              <section className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Description
                </h3>
                {isEditing ? (
                  <textarea
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                    rows={5}
                    maxLength={5000}
                    className={`${FIELD_INPUT_CLASS} resize-none`}
                    placeholder="Add details…"
                  />
                ) : task.description ? (
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">
                    No description yet.
                  </p>
                )}
              </section>

              <TaskPanelFields
                task={task}
                isEditing={isEditing}
                draft={draft}
                setDraft={setDraft}
                projectMembers={projectMembers}
              />

              {/* Meta footer */}
              <section className="border-b border-slate-200 px-5 py-3 text-xs text-slate-500 sm:px-6">
                Created {formatDateTime(task.createdAt)}
                {task.updatedAt !== task.createdAt &&
                  ` · Updated ${timeAgo(task.updatedAt)}`}
              </section>

              <CommentsSection
                taskId={taskId}
                user={user}
                isAdmin={role === "Admin"}
                currentUserId={user?._id}
              />
            </>
          )}
        </div>

        {/* Footer */}
        {(isEditing || canDelete) && !isLoading && !error && task && (
          <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3.5 sm:px-6">
            {canDelete && !isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? "Deleting…" : "Delete task"}
              </button>
            ) : (
              <span />
            )}

            {isEditing && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !draft.title.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {isSaving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};

export default TaskDetailPanel;