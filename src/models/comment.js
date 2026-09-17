import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      // denormalised — used in permission check middleware
      // lets us verify the commenter is a member of this project
      // without an extra Task lookup
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      // denormalised — for workspace-level queries
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // who wrote this comment
    },

    body: {
      type: String,
      required: [true, "Comment body cannot be empty"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// index for loading all comments on a task (in order)
commentSchema.index({ taskId: 1, createdAt: 1 });

const commentModel = mongoose.model("Comment", commentSchema);

export default commentModel;