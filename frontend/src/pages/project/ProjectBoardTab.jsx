import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { ListTodo, Lock, Plus } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";
import BoardColumn from "../../components/project/BoardColumn";
import BoardFilters from "../../components/project/BoardFilters";
import EmptyState from "../../components/common/EmptyState";
import CreateTaskModal from "../../components/task/CreateTaskModal";
import TaskDetailPanel from "../../components/task/TaskDetailPanel";
import { useAuth } from "../../context/AuthContext";
import { TASK_STATUSES } from "../../utils/task";

const ProjectBoardTab = () => {
  const { workspaceId, projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projectMembers = [], role, refetchProject } =
    useOutletContext() || {};

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [labelFilter, setLabelFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(
        `/api/projects/${projectId}/tasks`
      );
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const canCreateTask = role === "Admin" || role === "Project_Manager";

  const canMove = useCallback(
    (task) => {
      if (role === "Admin" || role === "Project_Manager") return true;
      if (role === "Developer" && task.assigneeId?._id === user?._id) {
        return true;
      }
      return false;
    },
    [role, user?._id]
  );

  const handleStatusChange = async (task, next) => {
    const previous = task.status;
    if (previous === next) return;

    setTasks((curr) =>
      curr.map((t) => (t._id === task._id ? { ...t, status: next } : t))
    );

    try {
      await axiosInstance.patch(`/api/tasks/${task._id}/status`, {
        status: next,
      });
      const label = TASK_STATUSES.find((s) => s.value === next)?.label;
      toast.success(`Moved to ${label}`);
    } catch (err) {
      setTasks((curr) =>
        curr.map((t) => (t._id === task._id ? { ...t, status: previous } : t))
      );
      toast.error(err.response?.data?.message || "Couldn't move the task.");
    }
  };

  const openTask = (id) =>
    navigate(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${id}`);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (labelFilter && t.label !== labelFilter) return false;
      if (assigneeFilter && t.assigneeId?._id !== assigneeFilter) return false;
      if (onlyMine && t.assigneeId?._id !== user?._id) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.title?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [
    tasks,
    priorityFilter,
    labelFilter,
    assigneeFilter,
    onlyMine,
    search,
    user?._id,
  ]);

  const grouped = useMemo(() => {
    const map = { backlog: [], in_progress: [], in_review: [], done: [] };
    for (const t of filtered) {
      if (map[t.status]) map[t.status].push(t);
    }
    return map;
  }, [filtered]);

  const anyFilter = Boolean(
    search || priorityFilter || labelFilter || assigneeFilter || onlyMine
  );

  const clearFilters = () => {
    setSearch("");
    setPriorityFilter("");
    setLabelFilter("");
    setAssigneeFilter("");
    setOnlyMine(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TASK_STATUSES.map((s) => (
          <div
            key={s.value}
            className="min-h-[280px] animate-pulse rounded-2xl border border-slate-200 bg-white/60"
          />
        ))}
      </div>
    );
  }

  if (error) {
    const is403 = error.response?.status === 403;
    return (
      <EmptyState
        icon={is403 ? Lock : ListTodo}
        title={
          is403
            ? "You don't have access to this board"
            : "Couldn't load tasks"
        }
        description={
          is403
            ? "This board isn't available to your role in this project."
            : error.response?.data?.message ||
              "Something went wrong while loading the board."
        }
        action={
          !is403 ? (
            <button
              type="button"
              onClick={loadTasks}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Try again
            </button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <BoardFilters
        search={search}
        onSearchChange={setSearch}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        label={labelFilter}
        onLabelChange={setLabelFilter}
        assigneeId={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        onlyMine={onlyMine}
        onToggleOnlyMine={() => setOnlyMine((v) => !v)}
        onClear={clearFilters}
        anyFilter={anyFilter}
        projectMembers={projectMembers}
        canCreateTask={canCreateTask}
        onNewTask={() => setIsCreateOpen(true)}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title={anyFilter ? "No matching tasks" : "No tasks yet"}
          description={
            anyFilter
              ? "Try clearing your filters."
              : canCreateTask
                ? "Create the first task to start tracking work."
                : "Tasks assigned to this project will appear here."
          }
          action={
            !anyFilter && canCreateTask ? (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                New task
              </button>
            ) : null
          }
        />
      ) : (
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-4">
          {TASK_STATUSES.map((col) => (
            <BoardColumn
              key={col.value}
              status={col.value}
              label={col.label}
              tasks={grouped[col.value] || []}
              canMove={canMove}
              onOpenTask={openTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {isCreateOpen && (
        <CreateTaskModal
          projectId={projectId}
          projectMembers={projectMembers}
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            setIsCreateOpen(false);
            loadTasks();
            refetchProject?.();
          }}
        />
      )}

      {taskId && (
        <TaskDetailPanel
          taskId={taskId}
          onClose={() =>
            navigate(`/workspaces/${workspaceId}/projects/${projectId}`)
          }
          onChanged={loadTasks}
        />
      )}
    </div>
  );
};

export default ProjectBoardTab;