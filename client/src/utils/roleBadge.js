const ROLE_STYLES = {
  Admin: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Project_Manager: "bg-blue-50 text-blue-700 border-blue-200",
  Developer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Viewer: "bg-slate-100 text-slate-600 border-slate-200",
};

const ROLE_LABELS = {
  Admin: "Admin",
  Project_Manager: "Project Manager",
  Developer: "Developer",
  Viewer: "Viewer",
};

export const getRoleBadgeClasses = (role) => ROLE_STYLES[role] || ROLE_STYLES.Viewer;
export const getRoleLabel = (role) => ROLE_LABELS[role] || role;