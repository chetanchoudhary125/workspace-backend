import projectMemberModel from "../models/projectMember.js";
import taskModel from "../models/task.js";
import workspaceMemberModel from "../models/workspaceMember.js";

export const checkTaskAccess = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    // 1. Find the Task
    const task = await taskModel.findById(taskId).select("-updatedAt -__v");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // 2. Get workspaceId & projectId directly from the task (denormalized fields)
    const workspaceId = task.workspaceId;
    const projectId = task.projectId;

    // 3. Check if user is a member of the workspace
    const workspaceMember = await workspaceMemberModel.findOne({
      workspaceId,
      userId,
    });

    if (!workspaceMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this workspace",
      });
    }

    // 4. Attach useful data to req
    req.task = task;
    req.memberRole = workspaceMember.role;
    req.workspaceId = workspaceId;
    req.projectId = projectId;

    // 5. Admin or Viewer → allow through
    if (workspaceMember.role === "Admin" || workspaceMember.role === "Viewer") {
      return next();
    }

    // 6. Project_Manager or Developer → must be a ProjectMember of this project
    if (
      workspaceMember.role === "Project_Manager" ||
      workspaceMember.role === "Developer"
    ) {
      const projectMember = await projectMemberModel.findOne({
        projectId,
        userId,
      });

      if (!projectMember) {
        return res.status(403).json({
          success: false,
          message: "You are not assigned to this project",
        });
      }

      return next();
    }

    // Fallback for any unexpected role
    return res.status(403).json({
      success: false,
      message: "You do not have access to this task",
    });
  } catch (error) {
    console.error("Error in checkTaskAccess:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking task access",
      error: error.message,
    });
  }
};