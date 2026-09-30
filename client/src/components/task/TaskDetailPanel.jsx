// src/components/TaskDetailPanel.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import {
  CalendarDays,
  Check,
  Flag,
  Loader2,
  Lock,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance.js";
import Avatar from "../common/Avatar.jsx";

import Badge from "../common/Badge.jsx";
import EmptyState from "../common/EmptyState.jsx";
import CommentsSection from "./CommentsSection.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatDateTime, getDeadlineInfo, timeAgo } from "../../utils/dates.js";
import {
  DEADLINE_TONE_CLASSES,
  FIELD_INPUT_CLASS,
  TASK_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "../../utils/task.js";

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
      setDraft({
        title: data.task.title || "",
        description: data.task.description || "",
        priority: data.task.priority || "medium",
        label: data.task.label || "",
        assigneeId: data.task.assigneeId?._id || "",
        deadline: data.task.deadline
          ? new Date(data.task.deadline).toISOString().slice(0, 10)
          : "",
      });
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
      await axiosInstance.patch(`/api/tasks/${taskId}/status`, { status: next });
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
    setDraft({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      label: task.label || "",
      assigneeId: task.assigneeId?._id || "",
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().slice(0, 10)
        : "",
    });
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
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
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
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
                {canEditStatus ? (
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    aria-label="Task status"
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                ) : (
                  <Badge type="taskStatus" value={task.status} />
                )}
                <Badge type="priority" value={task.priority} icon={Flag} />
                {task.label && <Badge type="label" value={task.label} />}
              </div>

              {/* Description */}
              <section className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Description
                </h3>
                {isEditing ? (
                  <textarea
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
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
                  <p className="text-sm text-slate-400">No description yet.</p>
                )}
              </section>

              {/* Details grid */}
              <section className="grid grid-cols-1 gap-4 border-b border-slate-200 px-5 py-5 sm:grid-cols-2 sm:px-6">
                {/* Assignee */}
                <div>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                    Assignee
                  </h3>
                  {isEditing ? (
                    <select
                      value={draft.assigneeId}
                      onChange={(e) => setDraft({ ...draft, assigneeId: e.target.value })}
                      className={FIELD_INPUT_CLASS}
                    >
                      <option value="">Unassigned</option>
                      {projectMembers.map((m) => {
                        const uid = m.userId?._id || m.userId;
                        return (
                          <option key={uid} value={uid}>
                            {m.userId?.name || "Unknown"}
                          </option>
                        );
                      })}
                    </select>
                  ) : task.assigneeId?.name ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={task.assigneeId.name} size="sm" />
                      <span className="text-sm font-medium text-slate-800">
                        {task.assigneeId.name}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Unassigned</p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                    Priority
                  </h3>
                  {isEditing ? (
                    <select
                      value={draft.priority}
                      onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
                      className={FIELD_INPUT_CLASS}
                    >
                      {TASK_PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge type="priority" value={task.priority} icon={Flag} />
                  )}
                </div>

                {/* Label */}
                <div>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                    Label
                  </h3>
                  {isEditing ? (
                    <select
                      value={draft.label}
                      onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                      className={FIELD_INPUT_CLASS}
                    >
                      {TASK_LABELS.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  ) : task.label ? (
                    <Badge type="label" value={task.label} />
                  ) : (
                    <p className="text-sm text-slate-400">None</p>
                  )}
                </div>

                {/* Deadline */}
                <div>
                  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                    Deadline
                  </h3>
                  {isEditing ? (
                    <input
                      type="date"
                      value={draft.deadline}
                      onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                      className={FIELD_INPUT_CLASS}
                    />
                  ) : (() => {
                    const info = getDeadlineInfo(task.deadline, task.status === "done");
                    return (
                      <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${DEADLINE_TONE_CLASSES[info.tone]}`}>
                        <CalendarDays className="h-4 w-4" />
                        {info.full || "No deadline"}
                      </span>
                    );
                  })()}
                </div>
              </section>

              {/* Meta footer */}
              <section className="border-b border-slate-200 px-5 py-3 text-xs text-slate-500 sm:px-6">
                Created {formatDateTime(task.createdAt)}
                {task.updatedAt !== task.createdAt &&
                  ` · Updated ${timeAgo(task.updatedAt)}`}
              </section>

              {/* Comments */}
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