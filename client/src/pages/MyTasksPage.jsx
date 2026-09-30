import { useEffect, useState } from "react";
import { ListTodo, Lock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../API/axiosInstance";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import TaskRow from "../components/task/TaskRow";

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

const MyTasksPage = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

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

  const openTask = (task) => {
    const projectId = task.projectId?._id || task.projectId;
    if (!projectId) return;
    navigate(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`
    );
  };

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
            {tasks.map((task) => (
              <TaskRow
                key={task._id}
                task={task}
                onOpen={() => openTask(task)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;