import { Link, useOutletContext, useParams } from "react-router-dom";
import { CalendarDays, Flag, FolderKanban, Plus } from "lucide-react";
import Badge from "../../components/common/Badge";
import PageHeader from "../../components/common/PageHeader";
import EmptyState from "../../components/common/EmptyState";
import { getDeadlineInfo } from "../../utils/dates";

const STATUS_ACCENT = {
  active: "from-emerald-400 to-emerald-500",
  on_hold: "from-amber-400 to-amber-500",
  completed: "from-slate-300 to-slate-400",
};

const toneClass = {
  overdue: "text-red-600",
  soon: "text-amber-600",
  normal: "text-slate-500",
  done: "text-slate-400",
  none: "text-slate-400",
};

const WorkspaceProjectsTab = () => {
  const { workspaceId } = useParams();
  const {
    projects = [],
    loading = false,
    role,
    openCreateProject,
  } = useOutletContext() || {};

  const isAdmin = role === "Admin";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="This workspace"
        title="Projects"
        description="All projects you have access to in this workspace."
      >
        {isAdmin && (
          <button
            type="button"
            onClick={openCreateProject}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New project</span>
          </button>
        )}
      </PageHeader>

      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[200px] animate-pulse rounded-2xl border border-slate-200 bg-white/70"
            />
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            isAdmin
              ? "Create the first project to start tracking work."
              : "You haven't been assigned to any project in this workspace yet."
          }
          action={
            isAdmin ? (
              <button
                type="button"
                onClick={openCreateProject}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                New project
              </button>
            ) : null
          }
        />
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const deadline = getDeadlineInfo(
              project.deadline,
              project.status === "completed"
            );
            const accent =
              STATUS_ACCENT[project.status] || "from-slate-300 to-slate-400";

            return (
              <Link
                key={project._id}
                to={`/workspaces/${workspaceId}/projects/${project._id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]"
              >

                <div className="flex flex-1 flex-col p-5">
                  {/* Header: icon + name + status */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-indigo-50 group-hover:text-indigo-600">
                      <FolderKanban className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">
                        {project.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Project
                      </p>
                    </div>

                    <Badge type="status" value={project.status} />
                  </div>

                  {/* Description */}
                  <p className="mt-4 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-slate-600">
                    {project.description || "No description yet."}
                  </p>

                  {/* Footer: priority + deadline */}
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
                    <Badge
                      type="priority"
                      value={project.priority || "medium"}
                      icon={Flag}
                    />

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${toneClass[deadline.tone]}`}
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                      {deadline.full || "No deadline"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkspaceProjectsTab;