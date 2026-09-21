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
      priority: priority || undefined, // let schema default apply if not sent
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
  try {
    const { projectId } = req.params;
    const { status, priority, label, assigneeId } = req.query;

    const filter = { projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (label) filter.label = label;
    if (assigneeId) filter.assigneeId = assigneeId;

    const tasks = await taskModel
      .find(filter)
      .populate("assigneeId", "name")
      .lean();

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = req.task;
    await task.populate([
      { path: "assigneeId", select: "_id name email" },
      { path: "createdBy", select: "_id name email" },
    ]);
    console.log(task);
    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching task",
      error: error.message,
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, label, assigneeId, deadline } = req.body;

    // step 1 — at least one field required
    if (
      title === undefined &&
      description === undefined &&
      priority === undefined &&
      label === undefined &&
      assigneeId === undefined &&
      deadline === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    // step 2 — validate title isn't being cleared to something invalid
    if (title !== undefined && title.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Task title must be at least 2 characters",
      });
    }

    // step 3 — validate priority enum
    const allowedPriority = ["low", "medium", "high", "critical"];
    if (priority !== undefined && !allowedPriority.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority must be one of: ${allowedPriority.join(", ")}`,
      });
    }

    // step 4 — validate label enum (null is allowed — it means "no label")
    const allowedLabel = ["bug", "feature", "improvement", "chore"];
    if (label !== undefined && label !== null && !allowedLabel.includes(label)) {
      return res.status(400).json({
        success: false,
        message: `Label must be one of: ${allowedLabel.join(", ")}`,
      });
    }

    // step 5 — validate deadline (undefined = not sent, null = clear it, string = new date)
    let parsedDeadline;
    if (deadline !== undefined) {
      if (deadline === null) {
        parsedDeadline = null;
      } else {
        parsedDeadline = new Date(deadline);
        if (isNaN(parsedDeadline.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Deadline must be a valid date",
          });
        }
      }
    }

    const task = req.task; // already fetched by checkTaskAccess

    // step 6 — if assigning to a real person, confirm they're on this project
    let newAssigneeMember = null;
    if (assigneeId !== undefined && assigneeId !== null) {
      newAssigneeMember = await projectMemberModel
        .findOne({ projectId: task.projectId, userId: assigneeId })
        .populate("userId", "name");

      if (!newAssigneeMember) {
        return res.status(400).json({
          success: false,
          message: "Assignee must be a member of this project",
        });
      }
    }

    // step 7 — compare each field, apply what changed, collect activities to log
    const changes = {};     // title / description / label → one task_updated event
    const activities = [];  // everything else gets its own dedicated event

    if (title !== undefined && title !== task.title) {
      changes.title = { from: task.title, to: title };
      task.title = title;
    }

    if (description !== undefined && description !== task.description) {
      changes.description = { from: task.description, to: description };
      task.description = description;
    }

    if (label !== undefined && label !== task.label) {
      changes.label = { from: task.label, to: label };
      task.label = label;
    }

    if (priority !== undefined && priority !== task.priority) {
      activities.push({
        workspaceId: req.workspaceId,
        projectId: task.projectId,
        userId: req.userId,
        type: "task_priority_changed",
        payload: { taskId: task._id, taskTitle: task.title, from: task.priority, to: priority },
      });
      task.priority = priority;
    }

    if (deadline !== undefined) {
      const currentTime = task.deadline ? task.deadline.getTime() : null;
      const newTime = parsedDeadline ? parsedDeadline.getTime() : null;
      if (currentTime !== newTime) {
        activities.push({
          workspaceId: req.workspaceId,
          projectId: task.projectId,
          userId: req.userId,
          type: "task_deadline_set",
          payload: { taskId: task._id, taskTitle: task.title, deadline: parsedDeadline },
        });
        task.deadline = parsedDeadline;
      }
    }

    if (assigneeId !== undefined) {
      const currentAssigneeId = task.assigneeId ? task.assigneeId.toString() : null;

      if (currentAssigneeId !== assigneeId) {
        if (currentAssigneeId === null) {
          // unassigned → assigned for the first time
          activities.push({
            workspaceId: req.workspaceId,
            projectId: task.projectId,
            userId: req.userId,
            type: "task_assigned",
            payload: {
              taskId: task._id,
              taskTitle: task.title,
              assigneeName: newAssigneeMember.userId.name,
              assigneeId: newAssigneeMember.userId._id,
            },
          });
        } else {
          // already assigned → moving to someone else, or clearing it
          const previousUser = await userModel.findById(task.assigneeId).select("name");

          activities.push({
            workspaceId: req.workspaceId,
            projectId: task.projectId,
            userId: req.userId,
            type: "task_reassigned",
            payload: {
              taskId: task._id,
              taskTitle: task.title,
              from: previousUser ? previousUser.name : "Unassigned",
              to: newAssigneeMember ? newAssigneeMember.userId.name : "Unassigned",
              fromId: task.assigneeId,
              toId: newAssigneeMember ? newAssigneeMember.userId._id : null,
            },
          });
        }

        task.assigneeId = assigneeId;
      }
    }

    // one task_updated event covers title, description, and label together
    if (Object.keys(changes).length > 0) {
      activities.push({
        workspaceId: req.workspaceId,
        projectId: task.projectId,
        userId: req.userId,
        type: "task_updated",
        payload: { taskId: task._id, taskTitle: task.title, changes },
      });
    }

    // nothing actually different from what's already saved
    if (!task.isModified()) {
      return res.status(200).json({
        success: true,
        message: "No changes made",
        task,
      });
    }

    // step 8 — save, then log everything this request produced
    await task.save();

    if (activities.length > 0) {
      await activityModel.create(activities);
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error.message,
    });
  }
};

export const updateTaskStatus = async (req, res) => {};

export const deleteTask = async (req, res) => {};

export const getMyTasks = async (req, res) => {};
