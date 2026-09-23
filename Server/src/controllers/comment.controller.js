import commentModel from "../models/comment.js";
import activityModel from "../models/activity.js";

const MAX_COMMENT_LENGTH = 2000;

export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const trimmedBody = body.trim();
    if (trimmedBody.length > MAX_COMMENT_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`,
      });
    }

    const task = req.task; // already fetched by checkTaskAccess

    const comment = await commentModel.create({
      taskId,
      projectId: req.projectId,
      workspaceId: req.workspaceId,
      userId: req.userId,
      body: trimmedBody,
    });

    await activityModel.create({
      workspaceId: req.workspaceId,
      projectId: req.projectId,
      userId: req.userId,
      type: "comment_added",
      payload: {
        taskId: task._id,
        taskTitle: task.title,
        commentPreview: trimmedBody.slice(0, 80),
      },
    });

    await comment.populate("userId", "name");

    return res.status(201).json({
      success: true,
      message: "Comment added",
      comment: {
        _id: comment._id,
        taskId: comment.taskId,
        userId: comment.userId,
        body: comment.body,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message,
    });
  }
};

export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await commentModel
      .find({ taskId })
      .sort({ createdAt: 1 })
      .populate("userId", "name")
      .lean();

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    const comment = await commentModel.findOne({ _id: commentId, taskId });
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const isAuthor = comment.userId.toString() === req.userId.toString();
    const isAdmin = req.memberRole === "Admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    await commentModel.findByIdAndDelete(commentId);

    await activityModel.create({
      workspaceId: req.workspaceId,
      projectId: req.projectId,
      userId: req.userId,
      type: "comment_deleted",
      payload: {
        taskId: req.task._id,
        taskTitle: req.task.title,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    });
  }
};
