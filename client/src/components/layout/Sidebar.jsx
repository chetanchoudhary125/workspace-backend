import { NavLink, useParams } from "react-router-dom";
import { Activity, FolderKanban, ListTodo, Plus, Users } from "lucide-react";

function Sidebar({ role = "Admin", projects = [], loading = false }) {
  const { workspaceId } = useParams();

  const isViewer = role === "Viewer";
  const isAdmin = role === "Admin";
  const base = `/workspaces/${workspaceId}`;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
      isActive
        ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const projectLinkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all ${
      isActive
        ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <aside className="flex w-full max-w-[290px] flex-col border-r border-slate-200 bg-white/75 backdrop-blur-xl shadow-[inset_-1px_0_0_rgba(148,163,184,0.18)]">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
          Workspace
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-white shadow-sm shadow-indigo-200">
            <FolderKanban className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Product Team</h2>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <NavLink to={base} end className={linkClass}>
            <FolderKanban className="h-4 w-4" />
            Projects
          </NavLink>

          {!isViewer && (
            <NavLink to={`${base}/my-tasks`} className={linkClass}>
              <ListTodo className="h-4 w-4" />
              My Tasks
            </NavLink>
          )}

          <NavLink to={`${base}/members`} className={linkClass}>
            <Users className="h-4 w-4" />
            Members
          </NavLink>

          {!isViewer && (
            <NavLink to={`${base}/activity`} className={linkClass}>
              <Activity className="h-4 w-4" />
              Activity
            </NavLink>
          )}
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between px-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Projects
            </p>

            {isAdmin && (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <Plus className="h-3.5 w-3.5" />
                New Project
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {loading && (
              <div className="space-y-2 px-2">
                <div className="h-9 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-9 animate-pulse rounded-xl bg-slate-200" />
              </div>
            )}

            {!loading && projects.length === 0 && (
              <p className="px-2 text-sm text-slate-500">No projects yet</p>
            )}

            {!loading &&
              projects.map((project) => (
                <NavLink
                  key={project._id}
                  to={`${base}/projects/${project._id}`}
                  className={projectLinkClass}
                >
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500" />
                  <span className="truncate">{project.name}</span>
                </NavLink>
              ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;