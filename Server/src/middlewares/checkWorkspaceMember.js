import WorkspaceMemberModel from "../models/workspaceMember.js";

const checkWorkspaceMember = async (req, res, next) => {
  const { workspaceId } = req.params;
  const userId = req.userId;

  if (!workspaceId) {
    return res.status(400).json({
      success: false,
      message: "Workspace ID is required",
    });
  }

  try {
    const member = await WorkspaceMemberModel.findOne({
      workspaceId,
      userId,
    });
    // look up this user's membership in this workspace
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this workspace",
      });
    }

    req.memberRole = member.role;
    req.workspaceMember = member;

    next();
  } catch (err) {
     res.status(500).json({ message: "Server error", error: err.message });
  }
};

export default checkWorkspaceMember