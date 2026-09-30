import { NavLink } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import Badge from "../common/Badge";
import { getDeadlineInfo } from "../../utils/dates";

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

const ProjectHeader = ({
  project,
  base,
  canEdit,
  canDelete,
  isDeleting,
  onEdit,
  onDelete,
}) => {
  const deadline = getDeadlineInfo(
    project.deadline,
    project.status === "completed"
  );

  return (
    <>
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
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={onDelete}
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
    </>
  );
};

export default ProjectHeader;