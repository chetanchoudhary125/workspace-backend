import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true, // every activity belongs to a workspace
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      // null for workspace-level events like member_invited, member_removed
      // set for project/task level events like task_created, comment_added
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // who performed this action
    },

    type: {
      type: String,
      enum: {
        values: [
          "task_created",
          "task_updated",
          "task_status_changed",
          "task_assigned",
          "task_reassigned",
          "task_priority_changed",
          "task_label_changed",
          "task_deadline_set",
          "task_deleted",
          "comment_added",
          "comment_deleted",
          "member_invited",
          "member_removed",
          "project_created",
          "project_deleted",
          "Role_changed",
          "project_updated",
          "project_member_added",
          "project_member_removed",
          "member_role_changed"

        ],
        message: "Invalid activity type",
      },
      required: true,
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      // flexible object — different shape per event type
    },
  },
  {
    timestamps: true,
  },
);

// index for workspace-level activity feed (most recent first)
activitySchema.index({ workspaceId: 1, createdAt: -1 });

// index for project-level activity feed
activitySchema.index({ projectId: 1, createdAt: -1 });

// index for filtering by user across a workspace
activitySchema.index({ workspaceId: 1, userId: 1, createdAt: -1 });

const activityModel = mongoose.model("Activity", activitySchema);

export default activityModel;

/*
============================================================
PAYLOAD REFERENCE — shape for every activity type
============================================================

task_created:
  { taskId, taskTitle }

task_status_changed:
  { taskId, taskTitle, from: "backlog"|"in_progress"|"in_review"|"done", to: same }

task_assigned:
  { taskId, taskTitle, assigneeName, assigneeId }

task_reassigned:
  { taskId, taskTitle, from: "PreviousPersonName", to: "NewPersonName",
    fromId: ObjectId, toId: ObjectId }

task_priority_changed:
  { taskId, taskTitle, from: "low"|"medium"|"high"|"critical", to: same }

task_deadline_set:
  { taskId, taskTitle, deadline: ISODateString }

task_deleted:
  { taskTitle }
  // no taskId — document no longer exists in DB

comment_added:
  { taskId, taskTitle, commentPreview: String }
  // commentPreview = first 80 chars of comment body

comment_deleted:
  { taskId, taskTitle }

member_invited:
  { inviteeName, inviteeEmail, role: "team_lead"|"associate"|"client" }

member_removed:
  { removedName, removedEmail, role }

project_created:
  { projectId, projectName }

project_deleted:
  { projectName }
  // no projectId — document no longer exists in DB

============================================================
*/
