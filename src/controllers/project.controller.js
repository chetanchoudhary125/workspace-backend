import activityModel from "../models/activity.js";
import projectModel from "../models/project.js";
import workspaceModel from "../models/workspace.js";
import projectMemberModel from "../models/projectMember.js";
import taskModel from "../models/task.js";
import commentModel from "../models/comment.js";
import workspaceMemberModel from "../models/workspaceMember.js";
import mongoose from "mongoose";
import userModel from "../models/user.js";

export const createProject = async (req, res) => {
  try {
    const { name, description = "" } = req.body;
    const { workspaceId } = req.params;
    const userId = req.userId;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const workspace = await workspaceModel.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    const newProject = await projectModel.create({
      name: name.trim(),
      description,
      workspaceId,
      createdBy: userId,
      deadline: null,
    });

    await activityModel.create({
      workspaceId,
      projectId: newProject._id,
      userId,
      type: "project_created",
      payload: {
        projectName: newProject.name,
        createdBy: req.user?.name || "System",
        workspaceName: workspace.name,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({
      success: false,
      message: "Error in creating project",
      error: error.message,
    });
  }
};

export const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.userId;
    const memberRole = req.memberRole;

    let projects;

    if (memberRole === "Admin" || memberRole === "Viewer") {
      projects = await projectModel
        .find({ workspaceId })
        .select("_id name status deadline")
        .lean();
    } else if (memberRole === "Project_Manager" || memberRole === "Developer") {
      const memberships = await projectMemberModel
        .find({ workspaceId, userId })
        .populate({
          path: "projectId",
          select: "_id name status deadline",
        })
        .lean();

      projects = memberships
        .filter((member) => member.projectId)
        .map((member) => ({
          _id: m.projectId._id,
          name: m.projectId.name,
          status: m.projectId.status,
          deadline: m.projectId.deadline,
        }));
    } else {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view projects",
      });
    }

    return res.status(200).json({ success: true, projects });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching projects",
      error: error.message,
    });
  }
};

export const getProject = async (req, res) => {
  try {
    const project = req.project;

    if (req.memberRole === "Viewer") {
      // Count tasks by status
      const taskCounts = await TaskModel.aggregate([
        { $match: { projectId: project._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Convert array to object for easier use
      const counts = {
        total: 0,
        backlog: 0,
        in_progress: 0,
        in_review: 0,
        done: 0,
      };

      taskCounts.forEach((item) => {
        counts.total += item.count;
        if (item._id in counts) counts[item._id] = item.count;
      });

      return res.status(200).json({
        success: true,
        role: "Viewer",
        summary: {
          _id: project._id,
          name: project.name,
          status: project.status,
          deadline: project.deadline,
          taskCounts: counts,
        },
      });
    }

    const members = await projectMemberModel
      .find({ projectId: project._id })
      .populate("userId", "name email")
      .lean();

    const projectDetails = {
      _id: project._id,
      name: project.name,
      description: project.description,
      status: project.status,
      deadline: project.deadline,
    };

    return res.status(200).json({
      success: true,
      project: projectDetails,
      members,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching project",
      error: error.message,
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, status, deadline } = req.body;

    // step 1 — at least one field must be present
    if (!name && !description && !status && !deadline) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    // step 2 — Project_Manager cannot touch name or description
    if (req.memberRole === "Project_Manager" && (name || description)) {
      return res.status(403).json({
        success: false,
        message: "Project Managers can only update status and deadline",
      });
    }

    // step 3 — validate status if present
    const allowedStatus = ["active", "on_hold", "completed"];
    if (status !== undefined && !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatus.join(", ")}`,
      });
    }

    // step 4 — validate deadline if present
    let parsedDeadline;
    if (deadline) {
      parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Deadline must be a valid date",
        });
      }
    }

    // step 5 — project already fetched by checkProjectAccess, no need to query again
    const project = req.project;

    // step 6 — only apply fields that actually changed, track them for the activity log
    const changes = {};

    if (name !== undefined && name !== project.name) {
      changes.name = { from: project.name, to: name };
      project.name = name;
    }

    if (description !== undefined && description !== project.description) {
      changes.description = { from: project.description, to: description };
      project.description = description;
    }

    if (status !== undefined && status !== project.status) {
      changes.status = { from: project.status, to: status };
      project.status = status;
    }

    if (
      deadline !== undefined &&
      (!project.deadline ||
        project.deadline.getTime() !== parsedDeadline.getTime())
    ) {
      changes.deadline = { from: project.deadline, to: parsedDeadline };
      project.deadline = parsedDeadline;
    }

    // nothing actually different from what's already saved
    if (Object.keys(changes).length === 0) {
      return res.status(200).json({
        success: true,
        message: "No changes made",
        project,
      });
    }

    await project.save();

    // step 7 — log activity
    await activityModel.create({
      workspaceId: req.workspaceId,
      projectId: null,
      userId: req.userId,
      type: "project_updated",
      payload: {
        projectName: project.name,
        changes,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Error in updateProject:", error);
    return res.status(500).json({
      success: false,
      message: "Error in updating project",
      error: error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { projectId } = req.params;
    const project = req.project;

    await commentModel.deleteMany({ projectId }).session(session);
    await taskModel.deleteMany({ projectId }).session(session);
    await projectMemberModel.deleteMany({ projectId }).session(session);
    await projectModel.findByIdAndDelete(projectId).session(session);

    await activityModel.create(
      [
        {
          workspaceId: project.workspaceId,
          projectId: null, // project no longer exists
          userId: req.userId,
          type: "project_deleted",
          payload: {
            projectId,
            projectName: project.name,
          },
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error deleting project:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting project",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    // step 1 — validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // step 2 — find the user being added
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // step 3 — confirm they are a member of this project's workspace
    const workspaceMember = await workspaceMemberModel.findOne({
      userId: user._id,
      workspaceId: req.workspaceId,
    });
    if (!workspaceMember) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this workspace",
      });
    }

    // step 4 — only Developer and Project_Manager roles can be added to a project
    if (workspaceMember.role === "Admin" || workspaceMember.role === "Viewer") {
      return res.status(400).json({
        success: false,
        message:
          "Only Developer and Project_Manager roles can be added to a project",
      });
    }

    // step 5 — permission check (see explanation above — this one line covers both rules)
    if (req.memberRole === workspaceMember.role) {
      return res.status(403).json({
        success: false,
        message: "Project Managers can only add Developers to a project",
      });
    }

    // step 6 — check they aren't already on this project
    const alreadyMember = await projectMemberModel.findOne({
      projectId,
      userId: user._id,
    });
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project",
      });
    }

    // step 7 — add them
    const newProjectMember = await projectMemberModel.create({
      projectId,
      workspaceId: req.workspaceId,
      userId: user._id,
      role: workspaceMember.role,
      assignedBy: req.userId,
    });

    // step 8 — log it
    await activityModel.create({
      workspaceId: req.workspaceId,
      projectId,
      userId: req.userId,
      type: "project_member_added",
      payload: {
        memberId: newProjectMember._id,
        addedUserName: user.name,
        addedUserEmail: user.email,
        role: workspaceMember.role,
      },
    });

    return res.status(201).json({
      success: true,
      message: `${user.name} added to project as ${workspaceMember.role}`,
      member: {
        _id: newProjectMember._id,
        projectId: newProjectMember.projectId,
        userId: newProjectMember.userId,
        role: newProjectMember.role,
        assignedBy: newProjectMember.assignedBy,
      },
    });
  } catch (error) {
    console.error("Error adding member to project:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding new member to project",
      error: error.message,
    });
  }
};

export const removeProjectMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

  // Finding the project member
    const projectMember = await projectMemberModel.findOne({
      _id: memberId,
      projectId,
    }).populate("userId", "name email");

    if (!projectMember) {
      return res.status(404).json({
        success: false,
        message: "Project member not found",
      });
    }

    // Prevent it from self-removal
    if (projectMember.userId._id.toString() === req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot remove yourself from the project",
      });
    }

    if (
      req.memberRole === "Project_Manager" &&
      projectMember.role === "Project_Manager"
    ) {
      return res.status(403).json({
        success: false,
        message: "Project Managers cannot remove other Project Managers",
      });
    }

    await projectMemberModel.deleteOne({
      _id: memberId,
      projectId,
    });

    await activityModel.create({
      workspaceId: req.workspaceId,
      projectId,
      userId: req.userId,
      type: "project_member_removed",
      payload: {
        removedUserId: projectMember.userId._id,
        removedUserName: projectMember.userId.name,
        removedUserEmail: projectMember.userId.email,
        removedRole: projectMember.role,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project member removed successfully",
    });
  } catch (error) {
    console.error("Error removing member from project:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing member from project",
      error: error.message,
    });
  }
};
