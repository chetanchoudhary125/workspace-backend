import activityModel from "../models/activity.js";
import commentModel from "../models/comment.js";

export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { body } = req.body;

    if (!body || body.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "body can not be empty",
      });
    }

    const comment = await commentModel.create({
      taskId,
      projectId: req.projectId,
      workspaceId: req.workspaceId,
      userId: req.userId,
      body,
    });

    const activity = await activityModel.create({
      workspaceId: req.workspaceId,
      projectId: req.projectId,
      userId: req.userId,
      type: "comment_added",
      payload: {
        taskId,
        tasktitle: req.task.title,
        commentPrev: body.slice(0, 80),
      },
    });

    await comment.populate("userId", "name");

    console.log(comment);

    return res.status(201).json({
      success: true,
      message: "Comment added",
      comment: {
        _id: comment._id,
        taskId,
        userId: comment.userId,
        body,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating comment task",
      error: error.message,
    });
  }
};

export const getTaskComments = async (req, res) => {};

export const deleteComment = async (req, res) => {};
