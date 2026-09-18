import express from "express"
import { checkTaskAccess } from "../middlewares/checkTaskAccess.js";
import { createTask } from "../controllers/task.controller.js";
import authenticate from "../middlewares/auth.middleware.js";
import checkProjectAccess from "../middlewares/checkProjectAccess.js";
import checkRole from "../middlewares/checkRole.js";

const router = express.Router()

router.post("/projects/:projectId/tasks",authenticate, checkProjectAccess, checkRole("Admin", "Project_Manager"), createTask)


export default router