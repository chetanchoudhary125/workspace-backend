import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./layout/ProtectedRoute";
import WorkspaceLayout from "./layout/WorkspaceLayout";
import ProjectLayout from "./layout/ProjectLayout";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import MyWorkspacesPage from "./pages/MyWorkspacesPage";
import MyTasksPage from "./pages/MyTasksPage";
import WorkspaceProjectsTab from "./pages/workspace/WorkspaceProjectsTab";
import WorkspaceMembersTab from "./pages/workspace/WorkspaceMembersTab";
import WorkspaceActivityTab from "./pages/workspace/WorkspaceActivityTab";
import ProjectBoardTab from "./pages/project/ProjectBoardTab";
import ProjectMembersTab from "./pages/project/ProjectMembersTab";
import ProjectActivityTab from "./pages/project/ProjectActivityTab";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/workspaces" replace />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/workspaces"
            element={
              <ProtectedRoute>
                <MyWorkspacesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/workspaces/:workspaceId"
            element={
              <ProtectedRoute>
                <WorkspaceLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<WorkspaceProjectsTab />} />
            <Route path="members" element={<WorkspaceMembersTab />} />
            <Route path="activity" element={<WorkspaceActivityTab />} />
            <Route path="my-tasks" element={<MyTasksPage />} />

            <Route path="projects/:projectId" element={<ProjectLayout />}>
              <Route index element={<ProjectBoardTab />} />
              <Route path="members" element={<ProjectMembersTab />} />
              <Route path="activity" element={<ProjectActivityTab />} />
              <Route path="tasks/:taskId" element={<ProjectBoardTab />} />
            </Route>
          </Route>
        </Routes>

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar
          closeOnClick
          theme="light"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
