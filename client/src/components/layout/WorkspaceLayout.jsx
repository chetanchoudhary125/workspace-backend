// src/components/layout/WorkspaceLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const WorkspaceLayout = () => {
  return (
    <div>
      <TopBar />
      <Sidebar />
      <main>
        <Outlet /> 
      </main>
    </div>
  );
};

export default WorkspaceLayout;