import express from "express"
import { checkTaskAccess } from "../middlewares/checkTaskAccess.js";
import { createTask, deleteTask, getMyTasks, getProjectTasks, getTask, updateTask, updateTaskStatus } from "../controllers/task.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import checkProjectAccess from "../middlewares/checkProjectAccess.js";
import checkRole from "../middlewares/checkRole.js";
import checkWorkspaceMember from "../middlewares/checkWorkspaceMember.js";
import { addComment, deleteComment, getTaskComments } from "../controllers/comment.controller.js";

const router = express.Router()

router.post("/projects/:projectId/tasks",authenticate, checkProjectAccess, checkRole("Admin", "Project_Manager"), createTask)
router.get("/projects/:projectId/tasks",authenticate, checkProjectAccess, checkRole("Admin", "Project_Manager", "Developer"), getProjectTasks)

router.get("/tasks/:taskId",authenticate, checkTaskAccess, checkRole("Admin", "Project_Manager", "Developer"), getTask)
router.patch("/tasks/:taskId",authenticate, checkTaskAccess, checkRole("Admin", "Project_Manager"), updateTask)
router.patch("/tasks/:taskId/status",authenticate, checkTaskAccess, checkRole("Admin", "Project_Manager","Developer"), updateTaskStatus)
router.delete("/tasks/:taskId",authenticate, checkTaskAccess, checkRole("Admin", "Project_Manager","Developer"), deleteTask)

// workspace-scoped dashboard
router.get("/workspaces/:workspaceId/my-tasks", authenticate, checkWorkspaceMember, checkRole("Admin", "Project_Manager", "Developer"), getMyTasks);

//Comment routes 
router.post("/tasks/:taskId/comments", authenticate, checkTaskAccess, checkRole("Admin", "Project_Manager", "Developer"), addComment);
router.get("/tasks/:taskId/comments", authenticate, checkTaskAccess, checkRole("Admin", "Project_Manager", "Developer"), getTaskComments);
router.delete("/tasks/:taskId/comments/:commentId", authenticate, checkTaskAccess, checkRole("Admin", "Project_Manager", "Developer"), deleteComment);



export default router