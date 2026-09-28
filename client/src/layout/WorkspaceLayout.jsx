import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import axiosInstance from "../API/axiosInstance";
import { useAuth } from "../context/AuthContext";

const WorkspaceLayout = () => {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [role, setRole] = useState("Viewer");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadWorkspaceAndRole = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/api/workspaces/${workspaceId}`);
      if (!isMountedRef.current) return;

      setWorkspace(data.workspace || null);

      const fetchedMembers = data.members || [];
      setMembers(fetchedMembers);

      const currentMember = fetchedMembers.find(
        (member) => member._id?.toString() === user?._id?.toString()
      );
      setRole(currentMember?.role || "Viewer");
    } catch (error) {
      console.error("Failed to load workspace:", error);
      if (isMountedRef.current) setRole("Viewer");
    }
  }, [workspaceId, user?._id]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/api/workspaces/${workspaceId}/projects`);
      if (isMountedRef.current) setProjects(data.projects || []);
    } catch (error) {
      console.error("Failed to load projects:", error);
      if (isMountedRef.current) setProjects([]);
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    loadWorkspaceAndRole();
    loadProjects();
  }, [workspaceId, loadWorkspaceAndRole, loadProjects]);

  return (
    <div className="min-h-screen bg-transparent">
      <TopBar onMenuClick={() => setIsSidebarOpen(true)} workspaceName={workspace?.name} />

      <div className="mx-auto flex max-w-[1600px] gap-0">
        <Sidebar
          role={role}
          projects={projects}
          loading={loading}
          workspaceName={workspace?.name}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="min-h-[calc(100vh-73px)] flex-1 bg-transparent px-4 py-6 sm:px-6 lg:px-8">
          <Outlet
            context={{ projects, loading, role, workspace, members, refetchMembers: loadWorkspaceAndRole }}
          />
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;