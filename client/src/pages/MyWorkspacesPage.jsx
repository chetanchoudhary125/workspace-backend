import { useState, useEffect } from "react";
import { BriefcaseBusiness, FolderKanban, Plus, Sparkles } from "lucide-react";
import axiosInstance from "../API/axiosInstance";
import TopBar from "../components/layout/TopBar";

const roleClasses = {
  Admin: "border border-indigo-200 bg-indigo-50 text-indigo-700",
  "Project Manager": "border border-violet-200 bg-violet-50 text-violet-700",
  Developer: "border border-sky-200 bg-sky-50 text-sky-700",
  Viewer: "border border-slate-200 bg-slate-100 text-slate-700",
  Member: "border border-slate-200 bg-slate-100 text-slate-700",
};

const formatDate = (date) => {
  if (!date) return "Recently";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const MyWorkspacesPage = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspaces = async () => {
    try {
      const { data } = await axiosInstance.get("/api/workspaces");
      setWorkspaces(data.workspaces || []);
    } catch {
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Workspace overview
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              My Workspaces
            </h1>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Create workspace
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="min-h-45 animate-pulse rounded-2xl border border-slate-200 bg-white/70"
              />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="flex min-h-105 items-center justify-center">
            <div className="w-full max-w-xl rounded-[28px] border border-dashed border-slate-300 bg-white/50 px-6 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <BriefcaseBusiness className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-slate-900">No workspaces yet</h2>
              <p className="mt-2 text-sm text-slate-600">
                Create your first workspace to start organizing projects, tasks, and teammates.
              </p>
              <button
                type="button"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                New workspace
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <button
              type="button"
              className="group flex min-h-[190px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 p-6 text-center text-slate-600 shadow-sm transition hover:border-slate-400 hover:bg-white/80"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                <Plus className="h-5 w-5" />
              </div>
              <p className="mt-4 text-base font-medium text-slate-800">Create workspace</p>
              <p className="mt-1 text-sm text-slate-500">Start a new team space</p>
            </button>

            {workspaces.map((workspace) => (
              <article
                key={workspace._id}
                className="group min-h-[190px] rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{workspace.name}</h3>
                    </div>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      roleClasses[workspace.role] || roleClasses.Member
                    }`}
                  >
                    {workspace.role || "Member"}
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                  {workspace.description || "No description available yet."}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
                  <span>{formatDate(workspace.createdAt)}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Open
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyWorkspacesPage;
