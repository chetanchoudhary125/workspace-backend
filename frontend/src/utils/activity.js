const labelize = (value) =>
  !value
    ? ""
    : String(value).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const getActivityAction = (activity = {}) => {
  const p = activity.payload || {};

  switch (activity.type) {
    case "task_created":
      return `created task "${p.taskTitle || "Untitled"}"`;
    case "task_status_changed":
      return `moved "${p.taskTitle || "a task"}" to ${labelize(p.to) || "a new status"}`;
    case "task_assigned":
      return `assigned "${p.taskTitle || "a task"}" to ${p.assigneeName || "someone"}`;
    case "task_reassigned":
      return `reassigned "${p.taskTitle || "a task"}" from ${p.from || "previous"} to ${p.to || "someone"}`;
    case "task_priority_changed":
      return `changed priority of "${p.taskTitle || "a task"}" to ${labelize(p.to) || "new"}`;
    case "task_deadline_set":
      return p.deadline
        ? `set a deadline for "${p.taskTitle || "a task"}"`
        : `removed the deadline from "${p.taskTitle || "a task"}"`;
    case "task_updated":
      return `updated "${p.taskTitle || "a task"}"`;
    case "task_deleted":
      return `deleted task "${p.taskTitle || "Untitled"}"`;
    case "comment_added":
      return `commented on "${p.taskTitle || "a task"}"`;
    case "comment_deleted":
      return `removed a comment from "${p.taskTitle || "a task"}"`;
    case "member_invited":
      return `invited ${p.inviteeName || p.inviteeEmail || "a teammate"} as ${labelize(p.role) || "a member"}`;
    case "member_removed":
      return `removed ${p.removedUserName || "a teammate"} from the workspace`;
    case "member_role_changed":
      return "updated a member role";
    case "project_created":
      return `created project "${p.projectName || "Untitled"}"`;
    case "project_updated":
      return `updated project "${p.projectName || "a project"}"`;
    case "project_deleted":
      return `deleted project "${p.projectName || "Untitled"}"`;
    case "project_member_added":
      return `added ${p.addedUserName || "a teammate"} to "${p.projectName || "the project"}"`;
    case "project_member_removed":
      return `removed ${p.removedUserName || "a teammate"} from "${p.projectName || "the project"}"`;
    default:
      return "made a change";
  }
};