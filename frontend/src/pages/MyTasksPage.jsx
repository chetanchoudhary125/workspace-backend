import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Flag,
  FolderKanban,
  ListTodo,
  Lock,
} from "lucide-react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import axiosInstance from "../API/axiosInstance";
import Avatar from "../components/common/Avatar";
import Badge from "../components/common/Badge";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import { getDeadlineInfo } from "../utils/dates";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const selectClass =
  "rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

const toneClass = {
  overdue: "text-red-600",
  soon: "text-amber-600",
  normal: "text-slate-500",
  done: "text-slate-400",
  none: "text-slate-400",
};

const MyTasksPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { role } = useOutletContext() || {};

  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        if (priority) params.set("priority", priority);
        const qs = params.toString();

        const { data } = await axiosInstance.get(
          `/api/workspaces/${workspaceId}/my-tasks${qs ? `?${qs}` : ""}`
        );
        if (!cancelled) setTasks(data.tasks || []);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, status, priority]);

  if (error?.response?.status === 403) {
    return (
      <EmptyState
        icon={Lock}
        title="Access restricted"
        description="My Tasks is only available to Admins, Project Managers, and Developers."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Personal queue"
        title="My Tasks"
        description="Everything assigned to you across this workspace."
      >
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className={selectClass}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Filter by priority"
            className={selectClass}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </PageHeader>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white/70"
            />
          ))}
        </div>
      )}

      {!isLoading && error && error.response?.status !== 403 && (
        <EmptyState
          icon={ListTodo}
          title="Couldn't load your tasks"
          description={
            error.response?.data?.message ||
            "Something went wrong while fetching your tasks."
          }
          action={
            <button
              type="button"
              onClick={() => setStatus((s) => s)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Try again
            </button>
          }
        />
      )}

      {!isLoading && !error && tasks.length === 0 && (
        <EmptyState
          icon={ListTodo}
          title="Nothing assigned to you"
          description={
            status || priority
              ? "No tasks match these filters. Try clearing them."
              : "Tasks assigned to you will appear here, sorted by priority and deadline."
          }
        />
      )}

      {!isLoading && !error && tasks.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <ul className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const projectId = task.projectId?._id || task.projectId;
              const projectName = task.projectId?.name || "Project";
              const deadline = getDeadlineInfo(
                task.deadline,
                task.status === "done"
              );

              return (
                <li key={task._id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (projectId) {
                        navigate(
                          `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`
                        );
                      }
                    }}
                    className="group flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-50/70 sm:px-5"
                  >
                    <div className="hidden shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-indigo-50 group-hover:text-indigo-600 sm:flex sm:h-10 sm:w-10">
                      <FolderKanban className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {task.title}
                        </p>
                        <Badge type="taskStatus" value={task.status} />
                        <Badge
                          type="priority"
                          value={task.priority}
                          icon={Flag}
                        />
                        {task.label && (
                          <Badge type="label" value={task.label} />
                        )}
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="truncate">{projectName}</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <span className={toneClass[deadline.tone]}>
                            {deadline.full || "No deadline"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {task.assigneeId?.name && (
                      <div className="hidden shrink-0 items-center gap-2 sm:flex">
                        <Avatar name={task.assigneeId.name} size="sm" />
                      </div>
                    )}

                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;