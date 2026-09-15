import express from "express"
import { changeMemberRole, createWorkspace, deleteWorkspace, getUserWorkspaces, getWorkspace, inviteMember, removeMember } from "../controllers/workspace.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import checkWorkspaceMember from "../middlewares/checkWorkspaceMember.js";
import checkRole from "../middlewares/checkRole.js";

const router = express.Router()


router.post("/workspaces",authenticate, createWorkspace)

router.get("/workspaces", authenticate, getUserWorkspaces)

router.get("/workspaces/:workspaceId", authenticate, checkWorkspaceMember, getWorkspace)

router.post("/workspaces/:workspaceId/invite", authenticate, checkWorkspaceMember, checkRole( "Admin", "Project_Manager"),  inviteMember)

router.patch("/workspaces/:workspaceId/members/:memberId/role", authenticate, checkWorkspaceMember, checkRole( "Admin"),  changeMemberRole)

router.delete("/workspaces/:workspaceId/members/:memberId", authenticate, checkWorkspaceMember, checkRole( "Admin"),  removeMember)

router.delete("/workspaces/:workspaceId", authenticate, checkWorkspaceMember, checkRole( "Admin"),  deleteWorkspace)



export default router