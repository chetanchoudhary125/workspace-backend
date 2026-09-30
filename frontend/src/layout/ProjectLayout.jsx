import { useCallback, useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { FolderKanban, Lock, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../API/axiosInstance";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import EditProjectModal from "../components/project/EditProjectModal";
import { getDeadlineInfo } from "../utils/dates";

const TAB_BASE =
  "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition";
const tabClass = ({ isActive }) =>
  isActive
    ? `${TAB_BASE} bg-slate-900 text-white shadow-sm`
    : `${TAB_BASE} text-slate-600 hover:bg-slate-100 hover:text-slate-900`;

const toneClass = {
  overdue: "text-red-600",
  soon: "text-amber-600",
  normal: "text-slate-500",
  done: "text-slate-400",
  none: "text-slate-400",
};

const ProjectLayout = () => {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const parentContext = useOutletContext() || {};

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProject = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/api/projects/${projectId}`);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-full bg-slate-200" />
        <div className="h-10 w-72 animate-pulse rounded-full bg-slate-100" />
        <div className="h-64 animate-pulse rounded-[26px] border border-slate-200 bg-white/70" />
      </div>
    );
  }

  if (error) {
    const status = error.response?.status;

    if (status === 403) {
      return (
        <EmptyState
          icon={Lock}
          title="You're not assigned to this project"
          description="Ask a workspace Admin or Project Manager to add you to this project."
        />
      );
    }

    if (status === 404) {
      return (
        <EmptyState
          icon={FolderKanban}
          title="Project not found"
          description="This project may have been deleted or the link is incorrect."
          action={
            <button
              type="button"
              onClick={() => navigate(`/workspaces/${workspaceId}`)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Back to workspace
            </button>
          }
        />
      );
    }

    return (
      <EmptyState
        icon={FolderKanban}
        title="Couldn't load this project"
        description={error.response?.data?.message || "Something went wrong."}
        action={
          <button
            type="button"
            onClick={loadProject}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Try again
          </button>
        }
      />
    );
  }

  if (data?.summary) {
    const s = data.summary;
    const counts = s.taskCounts || {};
    const total = counts.total || 0;
    const done = counts.done || 0;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    const deadline = getDeadlineInfo(s.deadline, s.status === "completed");

    const cells = [
      { label: "Backlog", value: counts.backlog || 0 },
      { label: "In Progress", value: counts.in_progress || 0 },
      { label: "In Review", value: counts.in_review || 0 },
      { label: "Done", value: done },
    ];

    return (
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
            Project summary
          </p>
          <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {s.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <Badge type="status" value={s.status} />
            <span className={`text-sm ${toneClass[deadline.tone]}`}>
              {deadline.full ? `Deadline · ${deadline.full}` : "No deadline"}
            </span>
          </div>
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">Progress</p>
            <p className="text-sm text-slate-500">
              {done} / {total} done · {percent}%
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cells.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  {c.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {c.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { project, members: projectMembers = [] } = data || {};
  if (!project) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Project not found"
        description="This project may have been deleted or the link is incorrect."
      />
    );
  }

  const role = parentContext.role;
  const canEdit = role === "Admin" || role === "Project_Manager";
  const canDelete = role === "Admin";

  const deadline = getDeadlineInfo(
    project.deadline,
    project.status === "completed",
  );
  const base = `/workspaces/${workspaceId}/projects/${projectId}`;

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete "${project.name}"?\n\nThis will permanently remove the project, its tasks, comments, and memberships. This can't be undone.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/api/projects/${projectId}`);
      toast.success("Project deleted");
      parentContext.refetchProjects?.();
      navigate(`/workspaces/${workspaceId}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Couldn't delete the project.",
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
            Project
          </p>
          <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {project.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Badge type="status" value={project.status} />
            <span className={`text-sm ${toneClass[deadline.tone]}`}>
              {deadline.full ? `Deadline · ${deadline.full}` : "No deadline"}
            </span>
          </div>
          {project.description && (
            <p className="mt-3 max-w-3xl text-sm text-slate-600">
              {project.description}
            </p>
          )}
        </div>

        {(canEdit || canDelete) && (
          <div className="flex shrink-0 items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isDeleting ? "Deleting…" : "Delete"}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <NavLink to={base} end className={tabClass}>
          Board
        </NavLink>
        <NavLink to={`${base}/members`} className={tabClass}>
          Members
        </NavLink>
        <NavLink to={`${base}/activity`} className={tabClass}>
          Activity
        </NavLink>
      </div>

      <Outlet
        context={{
          ...parentContext,
          project,
          projectMembers,
          refetchProject: loadProject,
        }}
      />

      {isEditOpen && (
        <EditProjectModal
          project={project}
          role={role}
          onClose={() => setIsEditOpen(false)}
          onUpdated={() => {
            setIsEditOpen(false);
            loadProject();
          }}
        />
      )}
    </div>
  );
};

export default ProjectLayout;
