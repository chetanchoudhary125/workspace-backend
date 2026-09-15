import mongoose from "mongoose";

const workspaceMemberSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: {
        values: ["Admin", "Project_Manager", "Developer", "Viewer"],
        message: "Role must be one of: Admin, Project_Manager, Developer, Viewer",
      },
      required: [true, "Role is required"],
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
     default: null, // when User create workspace for self it was null and filled when invited by someone 
    },
  },
  {
    timestamps: true, 
  }
);

// compound unique index — one user can only have one role per workspace
workspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true }
);

const WorkspaceMember = mongoose.model("WorkspaceMember", workspaceMemberSchema);
export default WorkspaceMember;