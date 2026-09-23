import express from "express"
import { addProjectMember, createProject, deleteProject, getProject, getWorkspaceProjects, removeProjectMember, updateProject } from "../controllers/project.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import checkWorkspaceMember from "../middlewares/checkWorkspaceMember.js";
import checkRole from "../middlewares/checkRole.js";
import checkProjectAccess from "../middlewares/checkProjectAccess.js";

const router = express.Router()

router.post("/workspaces/:workspaceId/projects",authenticate, checkWorkspaceMember, checkRole("Admin"), createProject )
router.get("/workspaces/:workspaceId/projects",authenticate, checkWorkspaceMember, getWorkspaceProjects )


router.get("/projects/:projectId",authenticate, checkProjectAccess, getProject )
router.patch("/projects/:projectId",authenticate, checkProjectAccess, checkRole("Admin", "Project_Manager"), updateProject )
router.delete("/projects/:projectId",authenticate, checkProjectAccess, checkRole("Admin"), deleteProject )


router.post("/projects/:projectId/members",authenticate, checkProjectAccess, checkRole("Admin", "Project_Manager"), addProjectMember )
router.delete("/projects/:projectId/members/:memberId",authenticate, checkProjectAccess, checkRole("Admin", "Project_Manager"), removeProjectMember )

export default router