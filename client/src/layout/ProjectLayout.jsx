import { useCallback, useEffect, useState } from "react";
import {
  Outlet,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { FolderKanban, Lock } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../API/axiosInstance";
import EmptyState from "../components/common/EmptyState";
import EditProjectModal from "../components/project/EditProjectModal";
import ProjectHeader from "../components/project/ProjectHeader";
import ProjectSummaryView from "../components/project/ProjectSummaryView";

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
        description={
          error.response?.data?.message || "Something went wrong."
        }
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

  // Viewer branch — API returns { role, summary } instead of { project, members }
  if (data?.summary) {
    return <ProjectSummaryView summary={data.summary} />;
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
  const base = `/workspaces/${workspaceId}/projects/${projectId}`;

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete "${project.name}"?\n\nThis will permanently remove the project, its tasks, comments, and memberships. This can't be undone.`
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
        err.response?.data?.message || "Couldn't delete the project."
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        base={base}
        canEdit={canEdit}
        canDelete={canDelete}
        isDeleting={isDeleting}
        onEdit={() => setIsEditOpen(true)}
        onDelete={handleDelete}
      />

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