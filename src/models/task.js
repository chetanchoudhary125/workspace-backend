import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
      default: "", // supports markdown on the frontend
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      // denormalised — needed for associate's home dashboard query
      // Task.find({ assigneeId: userId, workspaceId: wsId })
      // avoids joining through Project every time
    },

    status: {
      type: String,
      enum: {
        values: ["backlog", "in_progress", "in_review", "done"],
        message: "Status must be one of: backlog, in_progress, in_review, done",
      },
      default: "backlog",
    },

    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "critical"],
        message: "Priority must be one of: low, medium, high, critical",
      },
      default: "medium",
    },

    label: {
      type: String,
      enum: {
        values: ["bug", "feature", "improvement", "chore"],
        message: "Label must be one of: bug, feature, improvement, chore",
      },
      default: null,
    },

    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // nullable — task can exist without being assigned
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deadline: {
      type: Date,
      default: null, // optional
    },
  },
  {
    timestamps: true,
  }
);

// index for Kanban board — all tasks in a project
taskSchema.index({ projectId: 1, status: 1 });

// index for associate home dashboard — all tasks assigned to me
taskSchema.index({ assigneeId: 1, workspaceId: 1 });

// index for PM dashboard — all tasks across a workspace
taskSchema.index({ workspaceId: 1 });

const taskModel = mongoose.model("Task", taskSchema);

export default taskModel;