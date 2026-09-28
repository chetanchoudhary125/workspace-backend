import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import axiosInstance from "../../API/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const WorkspaceLayout = () => {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [role, setRole] = useState("Admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    let isMounted = true;

    const loadWorkspaceData = async () => {
      setLoading(true);

      try {
        const [workspaceRes, projectsRes] = await Promise.all([
          axiosInstance.get(`/api/workspaces/${workspaceId}`),
          axiosInstance.get(`/api/workspaces/${workspaceId}/projects`),
        ]);

        if (!isMounted) return;

        const members = workspaceRes.data.members || [];
        const currentMember = members.find(
          (member) => member._id?.toString() === user?._id?.toString()
        );

        setRole(currentMember?.role || "Viewer");
        setProjects(projectsRes.data.projects || []);
      } catch (error) {
        if (isMounted) {
          setRole("Viewer");
          setProjects([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWorkspaceData();

    return () => {
      isMounted = false;
    };
  }, [workspaceId, user?._id]);

  return (
    <div className="min-h-screen bg-transparent">
      <TopBar />

      <div className="mx-auto flex max-w-[1600px] gap-0">
        <Sidebar role={role} projects={projects} loading={loading} />

        <main className="min-h-[calc(100vh-73px)] flex-1 bg-transparent px-5 py-6 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-slate-200/80 bg-white/60 p-2 shadow-[0_14px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:p-4">
            <Outlet context={{ projects, loading, role }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;