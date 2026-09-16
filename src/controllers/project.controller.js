import ActivityModel from "../models/activity.js";
import projectModel from "../models/project.js";
import workspaceModel from "../models/workspace.js";
import projectMemberModel from "../models/projectMember.js";
import TaskModel from "../models/task.js";

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

    await ActivityModel.create({
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
      projects = await projectModel.find({ workspaceId }).select("_id name status deadline").lean();
    } else if (memberRole === "Project_Manager" || memberRole === "Developer") {
      const memberships = await projectMemberModel.find({ workspaceId, userId }).populate({
        path: "projectId",
        select: "_id name status deadline",
      }).lean();

      projects = memberships
        .filter(member => member.projectId)
        .map(member => ({
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
  
};

export const deleteProject = async (req, res) => {};

export const addProjectMember = async (req, res) => {};

export const removeProjectMember = async (req, res) => {};
