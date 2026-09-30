import { NavLink, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  FolderKanban,
  ListTodo,
  Plus,
  Users,
  X,
} from "lucide-react";

const linkBase =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition";
const activeNavClass =
  "bg-[#0F172A] text-white shadow-[0_12px_24px_rgba(15,23,42,0.22)] ring-1 ring-[#dfe7ff]";

const linkClass = ({ isActive }) =>
  isActive
    ? `${linkBase} ${activeNavClass}`
    : `${linkBase} text-[#49577d] hover:bg-[#f3f0ff] hover:text-[#1b2038]`;

const projectLinkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
    isActive
      ? `${activeNavClass} bg-[#0F172A] text-white`
      : "text-[#49577d] hover:bg-[#f3f0ff] hover:text-[#1b2038]"
  }`;

const Sidebar = ({
  role = null,
  projects = [],
  loading = false,
  workspaceName,
  isOpen = false,
  onClose,
  onNewProject,
}) => {
  const { workspaceId } = useParams();
  const base = `/workspaces/${workspaceId}`;

  const isAdmin = role === "Admin";
  const isViewer = role === "Viewer";
  const roleResolved = role !== null;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#191d35]/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80%] shrink-0 transform flex-col backdrop-blur-xl transition-transform duration-200 ease-in-out
          md:static md:z-auto md:w-[250px] md:max-w-none md:translate-x-0 lg:w-[280px]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-[#ece9ff] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6b7290]">
              Workspace
            </p>
            <h2 className="mt-1 truncate text-lg font-semibold text-[#1b2038]">
              {workspaceName || "Loading…"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-[#7c88ac] transition hover:text-[#1b2038] md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavLink
            to="/workspaces"
            className={linkClass}
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
            All workspaces
          </NavLink>

          <div className="space-y-1">
            <NavLink to={base} end className={linkClass} onClick={onClose}>
              <FolderKanban className="h-4 w-4" />
              Projects
            </NavLink>

            {roleResolved && !isViewer && (
              <NavLink
                to={`${base}/my-tasks`}
                className={linkClass}
                onClick={onClose}
              >
                <ListTodo className="h-4 w-4" />
                My Tasks
              </NavLink>
            )}

            <NavLink
              to={`${base}/members`}
              className={linkClass}
              onClick={onClose}
            >
              <Users className="h-4 w-4" />
              Members
            </NavLink>

            {roleResolved && !isViewer && (
              <NavLink
                to={`${base}/activity`}
                className={linkClass}
                onClick={onClose}
              >
                <Activity className="h-4 w-4" />
                Activity
              </NavLink>
            )}
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6b7290]">
                Projects
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={onNewProject}
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-[#e7e4ff] bg-[#f7f5ff] px-2 py-1 text-[11px] font-medium text-[#2b3352] transition hover:border-[#d7d0ff] hover:bg-[#f0edff]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New project
                </button>
              )}
            </div>

            <div className="space-y-1">
              {loading && (
                <div className="space-y-2 px-1">
                  <div className="h-8 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-8 animate-pulse rounded-xl bg-slate-100" />
                </div>
              )}

              {!loading && projects.length === 0 && (
                <p className="px-3 py-2 text-sm text-[#67759b]">
                  No projects yet
                </p>
              )}

              {!loading &&
                projects.map((project) => (
                  <NavLink
                    key={project._id}
                    to={`${base}/projects/${project._id}`}
                    className={projectLinkClass}
                    onClick={onClose}
                  >
                    <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-slate-300" />
                    <span className="truncate">{project.name}</span>
                  </NavLink>
                ))}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
