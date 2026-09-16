import express from "express"
import { createProject, getProject, getWorkspaceProjects } from "../controllers/project.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import checkWorkspaceMember from "../middlewares/checkWorkspaceMember.js";
import checkRole from "../middlewares/checkRole.js";
import checkProjectAccess from "../middlewares/checkProjectAccess.js";

const router = express.Router()

router.post("/workspaces/:workspaceId/projects",authenticate, checkWorkspaceMember, checkRole("Admin"), createProject )

router.get("/workspaces/:workspaceId/projects",authenticate, checkWorkspaceMember, getWorkspaceProjects )

router.get("/projects/:projectId",authenticate, checkProjectAccess, getProject )



export default router