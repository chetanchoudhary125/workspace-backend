import mongoose from "mongoose";
import activityModel from "../models/activity.js";
import commentModel from "../models/comment.js";
import projectModel from "../models/project.js";
import projectMemberModel from "../models/projectMember.js";
import taskModel from "../models/task.js";
import userModel from "../models/user.js";
import workspaceModel from "../models/workspace.js";
import workspaceMemberModel from "../models/workspaceMember.js";

export const createWorkspace = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({
      success: false,
      message: "Name and description is required to create workspace",
    });
  }
  try {
    const alreadyExist = await workspaceModel.findOne({
      name,
      createdBy: req.userId,
    });
    if (alreadyExist) {
      return res.status(400).json({
        success: false,
        message: "You already have Workspace with same name",
      });
    }

    //creating workspace
    const workspace = await workspaceModel.create({
      name,
      description,
      createdBy: req.userId,
    });

    const WorkspaceMember = await workspaceMemberModel.create({
      workspaceId: workspace._id,
      userId: req.userId,
      role: "Admin",
      invitedBy: null, // user createding this by self
    });

    res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return res.status(500).json({
      success: false,
      message: "Error in workspace creation",
      error: error.message,
    });
  }
};

export const getUserWorkspaces = async (req, res) => {
  try {
    const userId = req.userId;

    const memberships = await workspaceMemberModel.find({ userId })
      .populate({
        path: "workspaceId",
        select: "name description createdAt",
      })
      .lean();
    const workspaces = memberships.map((membership) => ({
      _id: membership.workspaceId._id,
      name: membership.workspaceId.name,
      description: membership.workspaceId.description,
      createdAt: membership.workspaceId.createdAt,
      role: membership.role,
    }));

    res.status(200).json({
      success: true,
      workspaces,
    });
  } catch (error) {
    console.error("Error fetching users in workspace:", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching workspace ",
      error: error.message,
    });
  }
};

export const getWorkspace = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.userId;

  try {
    const workspace = await workspaceModel.findOne({ _id: workspaceId }).select(
      ["_id", "name", "description", "createdAt"],
    );

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    const findMembers = await workspaceMemberModel.find({ workspaceId })
      .populate({
        path: "userId",
      })
      .lean();

    const members = findMembers.map((member) => ({
      _id: member.userId._id,
      name: member.userId.name,
      email: member.userId.email,
      role: member.role,
      joinedAt: member.createdAt,
    }));

    return res.status(200).json({
      success: true,
      workspace,
      members,
    });
  } catch (error) {
    console.error("Error fetching workspace details:", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching workspace",
      error: error.message,
    });
  }
};

export const inviteMember = async (req, res) => {
  const { email, role } = req.body;
  const { workspaceId } = req.params;

  if (!email || !role) {
    return res.status(400).json({
      success: false,
      message: "Email and role is required!",
    });
  }
  //check for requested role is allowed or not
  const allowedRoles = ["Developer", "Viewer", "Project_Manager"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Only Developer, Viewer and Project_Manager roles are allowed. "${role}" is not allowed.`,
    });
  }

  //invite permission check
  if (role === "Project_Manager" && req.memberRole !== "Admin") {
    return res.status(400).json({
      success: false,
      message: "Only Admin can invite Project_manager",
    });
  }

  try {
    // find user to invite
    const foundUser = await userModel.findOne({ email });
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }
    // check for invited user was already a member
    const isAlreadyAMember = await workspaceMemberModel.findOne({
      workspaceId,
      userId: foundUser._id,
    });
    if (isAlreadyAMember) {
      return res.status(400).json({
        success: false,
        message: "User already a member of this workspace",
      });
    }

    const newMember = await workspaceMemberModel.create({
      workspaceId,
      userId: foundUser._id,
      role,
      invitedBy: req.userId,
    });

    const newActivity = await activityModel.create({
      workspaceId,
      projectId: null,
      userId: req.userId,
      type: "member_invited",
      payload: {
        memberId: newMember._id,
        inviteeName: foundUser.name,
        inviteeEmail: foundUser.email,
        role,
      },
    });

    res.status(201).json({
      success: true,
      message: `${foundUser.name} is invited as ${role}`,
      newMember,
    });
  } catch (error) {
    console.error("Error in inviteMember:", error);
    return res.status(500).json({
      success: false,
      message: "Error in inviting member in workspace",
      error: error.message,
    });
  }
};

export const changeMemberRole = async (req, res) => {
  const { role } = req.body;
  const { workspaceId, memberId } = req.params;

  //allowed roles to change
  const allowedRoles = ["Developer", "Viewer", "Project_Manager"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Only Developer, Viewer and Project_Manager roles are allowed to change. "${role}" is not allowed.`,
    });
  }

  try {
    // finding user in workspaceMember
    const foundMember = await workspaceMemberModel.findOne({
      _id: memberId,
      workspaceId,
    });

    if (!foundMember) {
      return res.status(404).json({
        success: false,
        message: "workspace member not found",
      });
    }

    // if trying to change self role
    if (foundMember.userId.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot change your own role",
      });
    }

    foundMember.role = role;
    await foundMember.save();

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      member: foundMember,
    });
  } catch (error) {
    console.error("Error in member role change:", error);
    return res.status(500).json({
      success: false,
      message: "Error in changing member role in workspace",
      error: error.message,
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    const foundMember = await workspaceMemberModel.findOne({
      _id: memberId,
      workspaceId,
    }).populate("userId", "name email");

    if (!foundMember) {
      return res.status(404).json({
        success: false,
        message: "Member not found in workspace",
      });
    }

    // Prevent self-removal
    if (foundMember.userId._id.toString() === req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot remove yourself from the workspace",
      });
    }

    await workspaceMemberModel.findByIdAndDelete(memberId);

    await projectMemberModel.deleteMany({ workspaceId, userId: foundMember.userId._id })

    await activityModel.create({
      workspaceId,
      projectId: null,
      userId: req.userId,
      type: "member_removed",
      payload: {
        removedUserId: foundMember.userId._id,
        removedUserName: foundMember.userId.name,
        removedUserEmail: foundMember.userId.email,
        removedUserRole: foundMember.role
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Error in removeMember:", error);
    return res.status(500).json({
      success: false,
      message: "Error in removing member from workspace",
      error: error.message,
    });
  }
};

export const deleteWorkspace = async (req, res) => {
  const session = mongoose.startSession()
  session.startTransection()

  try {
    const { workspaceId } = req.params;

    const workspace = await workspaceModel.findOne({
      _id: workspaceId,
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "No workspace found",
      });
    }

    await commentModel.deleteMany({ workspaceId }).session(session);

    await taskModel.deleteMany({ workspaceId }).session(session);

    await activityModel.deleteMany({ workspaceId }).session(session);

    await projectMemberModel.deleteMany({ workspaceId }).session(session);

    await projectModel.deleteMany({ workspaceId }).session(session);

    await workspaceMemberModel.deleteMany({ workspaceId }).session(session);

    await workspaceModel.findOneAndDelete({ _id: workspaceId }).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction()
    console.error("Error in deleting workspace:", error);
    return res.status(500).json({
      success: false,
      message: "Error in deleting workspace",
      error: error.message,
    });
  } finally {
     session.endSession()
  }
};
