import activityModel from "../models/activity.js";
import projectMemberModel from "../models/projectMember.js";
import taskModel from "../models/task.js";

export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, label, assigneeId, deadline } =
      req.body;

    // 1. Validate title
    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // 2. Validate priority (if provided)
    const allowedPriorities = ["low", "medium", "high", "critical"];
    if (priority !== undefined && !allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority must be one of: ${allowedPriorities.join(", ")}`,
      });
    }

    // 3. Validate label (if provided)
    const allowedLabels = ["bug", "feature", "improvement", "chore"];
    if (label !== undefined && !allowedLabels.includes(label)) {
      return res.status(400).json({
        success: false,
        message: `Label must be one of: ${allowedLabels.join(", ")}`,
      });
    }

    // 4. Validate deadline (if provided)
    let parsedDeadline = undefined;
    if (deadline !== undefined && deadline !== null) {
      parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Deadline must be a valid date",
        });
      }
    }

    // 5. Validate assignee belongs to this project (if provided)
    if (assigneeId) {
      const projectMember = await projectMemberModel.findOne({
        userId: assigneeId,
        projectId,
      });

      if (!projectMember) {
        return res.status(400).json({
          success: false,
          message: "Assignee does not belong to this project",
        });
      }
    }

    // 6. Create the task
    const task = await taskModel.create({
      title: title.trim(),
      description: description?.trim() || "",
      projectId,
      workspaceId: req.workspaceId,
      priority: priority || undefined,   // let schema default apply if not sent
      label: label || undefined,
      assigneeId: assigneeId || undefined,
      createdBy: req.userId,
      deadline: parsedDeadline ?? null,
    });

    // 7. Create activity log
    await activityModel.create({
      workspaceId: req.workspaceId,
      projectId,
      userId: req.userId,
      type: "task_created",
      payload: {
        taskId: task._id,
        taskTitle: task.title,
        priority: task.priority,
        label: task.label,
        assigneeId: task.assigneeId || null,
        deadline: task.deadline || null,
        createdBy: req.user?.name || "System",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({
      success: false,
      message: "Error in creating task",
      error: error.message,
    });
  }
};

export const getProjectTasks = async (req, res) => {
    
};

export const getTask = async (req, res) => {};

export const updateTask = async (req, res) => {};

export const updateTaskStatus = async (req, res) => {};

export const deleteTask = async (req, res) => {};

export const getMyTasks = async (req, res) => {};
