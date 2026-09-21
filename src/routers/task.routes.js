import express from "express"
import { checkTaskAccess } from "../middlewares/checkTaskAccess.js";
import { createTask, getProjectTasks, getTask, updateTask } from "../controllers/task.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import checkProjectAccess from "../middlewares/checkProjectAccess.js";
import checkRole from "../middlewares/checkRole.js";

const router = express.Router()

router.post("/projects/:projectId/tasks",authenticate, checkProjectAccess, checkRole("Admin", "Project_Manager"), createTask)
router.get("/projects/:projectId/tasks",authenticate, checkProjectAccess, checkRole("Admin", "Project_Manager", "Developer"), getProjectTasks)

router.get("/tasks/:taskId",authenticate, checkTaskAccess, checkRole("Admin", "Project_Manager", "Developer"), getTask)
router.patch("/tasks/:taskId",authenticate, checkTaskAccess, checkRole("Admin", "Project_Manager"), updateTask)


export default router