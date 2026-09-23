import projectModel from "../models/project.js";
import workspaceMemberModel from "../models/workspaceMember.js";
import projectMemberModel from "../models/projectMember.js";

const checkProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    //finding the project
    const project = await projectModel.findById({
      _id: projectId,
    });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found ",
      });
    }

    // check if user is a member of the workspace this project belongs to
    const workspaceMember = await workspaceMemberModel.findOne({
      workspaceId: project.workspaceId,
      userId,
    });

    if (!workspaceMember) {
      return res.status(404).json({
        success: false,
        message: "You are not a member of this workspace",
      });
    }

    req.project = project;
    req.memberRole = workspaceMember.role;
    req.workspaceId = project.workspaceId;

    if (workspaceMember.role === "Admin" || workspaceMember.role === "Viewer") {
      return next();
    }

    //Check for Project_Manager and Developer must be assigned to this project
    const projectMember = await projectMemberModel.findOne({
      projectId,
      userId,
    });
    if (!projectMember) {
      return res.status(400).json({
        success: false,
        message: "You are not member of this project",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export default checkProjectAccess
