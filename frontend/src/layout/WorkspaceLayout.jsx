import { useCallback, useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import axiosInstance from "../API/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import CreateProjectModal from "../components/project/CreateProjectModal";

const WorkspaceLayout = () => {
  const { workspaceId } = useParams();
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const loadWorkspace = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(
        `/api/workspaces/${workspaceId}`,
      );
      setWorkspace(data.workspace || null);
      const fetchedMembers = data.members || [];
      setMembers(fetchedMembers);

      const me = fetchedMembers.find(
        (m) => m._id?.toString() === user?._id?.toString(),
      );
      setRole(me?.role || null);
    } catch (err) {
      console.error("Failed to load workspace", err);
      setRole(null);
    }
  }, [workspaceId, user?._id]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/api/workspaces/${workspaceId}/projects`,
      );
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to load projects", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkspace();
    loadProjects();
  }, [workspaceId, loadWorkspace, loadProjects]);

  return (
    <div className="min-h-screen bg-transparent">
      <TopBar
        onMenuClick={() => setIsSidebarOpen(true)}
        workspaceName={workspace?.name}
      />

      <div className="mx-auto flex min-w-0">
        <Sidebar
          role={role}
          projects={projects}
          loading={loading}
          workspaceName={workspace?.name}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNewProject={() => setIsCreateProjectOpen(true)}
        />

        <main className="min-h-[calc(100vh-65px)] min-w-0 flex-1 bg-transparent px-4 py-6 sm:px-6 lg:px-8">
          <Outlet
            context={{
              role,
              workspace,
              members,
              projects,
              loading,
              refetchMembers: loadWorkspace,
              refetchProjects: loadProjects,
              openCreateProject: () => setIsCreateProjectOpen(true),
            }}
          />
        </main>
      </div>

      {isCreateProjectOpen && (
        <CreateProjectModal
          workspaceId={workspaceId}
          onClose={() => setIsCreateProjectOpen(false)}
          onCreated={() => {
            setIsCreateProjectOpen(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
};

export default WorkspaceLayout;
