import { useState } from "react";
import { BriefcaseBusiness, Plus } from "lucide-react";

import TopBar from "../layout/TopBar";
import PageHeader from "../components/common/PageHeader";
import EmptyState from "../components/common/EmptyState";
import WorkspaceCard from "../components/workspace/WorkspaceCard";
import CreateWorkspaceModal from "../components/workspace/CreateWorkspaceModal";
import { useFetch } from "../hooks/useFetch";

const MyWorkspacesPage = () => {
  const { data, isLoading, error, refetch } = useFetch("/api/workspaces");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const workspaces = data?.workspaces || [];

  const handleCreated = () => {
    setIsCreateOpen(false);
    refetch();
  };

  return (
    <div className="min-h-screen bg-transparent">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Workspace overview"
          title="My Workspaces"
          description="Pick a workspace to continue, or create a new one."
        >
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create workspace</span>
          </button>
        </PageHeader>

        <div className="mt-7">
          {isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-[26px] border border-slate-200 bg-white/70"
                />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <EmptyState
              icon={BriefcaseBusiness}
              title="Couldn't load your workspaces"
              description={
                error.response?.data?.message ||
                "Something went wrong while fetching your workspaces."
              }
              action={
                <button
                  type="button"
                  onClick={refetch}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Try again
                </button>
              }
            />
          )}

          {!isLoading && !error && workspaces.length === 0 && (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No workspaces yet"
              description="Create your first workspace to start organizing projects, tasks, and teammates."
              action={
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  New workspace
                </button>
              }
            />
          )}

          {!isLoading && !error && workspaces.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {workspaces.map((ws) => (
                <WorkspaceCard key={ws._id} workspace={ws} />
              ))}

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="group flex min-h-[190px] flex-col items-center justify-center rounded-[26px] border border-dashed border-slate-300 bg-white/70 p-6 text-center transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-slate-900 group-hover:text-white">
                  <Plus className="h-5 w-5" />
                </div>
                <p className="mt-4 text-base font-medium text-slate-900">
                  Create workspace
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Start a new team space
                </p>
              </button>
            </div>
          )}
        </div>
      </main>

      {isCreateOpen && (
        <CreateWorkspaceModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default MyWorkspacesPage;