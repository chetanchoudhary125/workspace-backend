import { useState, useEffect } from "react";
// import { Link } from "react-router";
import axiosInstance from "../API/axiosInstance";
// import { useAuth } from "../context/AuthContext";
// import { getRoleBadgeClasses, getRoleLabel } from "../utils/roleBadge";
// import CreateWorkspaceModal from "../components/CreateWorkspaceModal";

// const getGreeting = () => {
//   const hour = new Date().getHours();
//   if (hour < 12) return "Good morning";
//   if (hour < 18) return "Good afternoon";
//   return "Good evening";
// };

const MyWorkspacesPage = () => {
  // const { user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      const { data } = await axiosInstance.get("api/workspaces");
      setWorkspaces(data.workspaces);
      console.log(data)
    } catch {
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // const handleCreated = () => {
  //   setIsModalOpen(false);
  //   fetchWorkspaces();
  // };

  return (
    <div className=" p-2  w-fit rounded-full font-bold ">
      noteflow
      <div>data :{}</div>
    </div>
  );
};

export default MyWorkspacesPage;
