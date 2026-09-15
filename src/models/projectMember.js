import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true, // denormalised — avoids extra lookups when checking access
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: {
        values: ["project_manager", "developer"],
        message: "Project role must be one of: team_lead, associate",
        // note: project_manager and client are NOT here
        // PM has workspace-wide access — no project assignment needed
        // Client gets summary access via workspace role alone
      },
      required: [true, "Role is required"],
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // PM or Team Lead who added them to this project
    },
  },
  {
    timestamps: true, // createdAt = joinedAt
  }
);

// compound unique index — one user has one role per project
projectMemberSchema.index(
  { projectId: 1, userId: 1 },
  { unique: true }
);

// index for fast lookup of all members in a project
projectMemberSchema.index({ projectId: 1 });

// index for fast lookup of all projects a user is part of
projectMemberSchema.index({ userId: 1, workspaceId: 1 });

const ProjectMember = mongoose.model("ProjectMember", projectMemberSchema);
export default ProjectMember;