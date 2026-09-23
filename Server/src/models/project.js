import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [2, "Project name must be at least 2 characters"],
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // the PM who created this project
    },

    status: {
      type: String,
      enum: {
        values: ["active", "on_hold", "completed"],
        message: "Status must be one of: active, on_hold, completed",
      },
      default: "active",
    },

    deadline: {
      type: Date,
      default: null, // optional — overall project deadline
    },
  },
  {
    timestamps: true,
  }
);

// index for fast lookup of all projects in a workspace
projectSchema.index({ workspaceId: 1 });

const projectModel = mongoose.model("Project", projectSchema);

export default projectModel;