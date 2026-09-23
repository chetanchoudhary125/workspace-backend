import activityModel from "../models/activity.js";
import projectMemberModel from "../models/projectMember.js";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// shared by both routes below — turns raw query params into safe, bounded values
const parsePagination = (query) => {
  const limit = Math.min(Number(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);

  let beforeDate;
  if (query.before) {
    const parsed = new Date(query.before);
    if (!isNaN(parsed.getTime())) beforeDate = parsed;
  }

  return { limit, beforeDate };
};

export const getWorkspaceActivity = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { limit, beforeDate } = parsePagination(req.query);

    const filter = { workspaceId };

    // Project_Manager and Developer see workspace-wide events plus
    // activity from projects they're actually assigned to — Admin sees everything
    if (req.memberRole === "Project_Manager" || req.memberRole === "Developer") {
      const memberships = await projectMemberModel
        .find({ workspaceId, userId: req.userId })
        .select("projectId")
        .lean();

      const projectIds = memberships.map((m) => m.projectId);
      filter.$or = [{ projectId: null }, { projectId: { $in: projectIds } }];
    }

    if (beforeDate) {
      filter.createdAt = { $lt: beforeDate };
    }

    const activities = await activityModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name")
      .lean();

    return res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("Error fetching workspace activity:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching workspace activity",
      error: error.message,
    });
  }
};

export const getProjectActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit, beforeDate } = parsePagination(req.query);

    const filter = { projectId };
    if (beforeDate) {
      filter.createdAt = { $lt: beforeDate };
    }

    const activities = await activityModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name")
      .lean();

    return res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("Error fetching project activity:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching project activity",
      error: error.message,
    });
  }
};