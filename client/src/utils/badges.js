const BADGE_STYLES = {
  role: {
    Admin: { label: "Admin", classes: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    Project_Manager: { label: "Project Manager", classes: "bg-violet-50 text-violet-700 border-violet-200" },
    Developer: { label: "Developer", classes: "bg-sky-50 text-sky-700 border-sky-200" },
    Viewer: { label: "Viewer", classes: "bg-slate-100 text-slate-600 border-slate-200" },
  },
  status: {
    active: { label: "Active", classes: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    on_hold: { label: "On Hold", classes: "bg-amber-100 text-amber-700 border-amber-200" },
    completed: { label: "Completed", classes: "bg-slate-200 text-slate-700 border-slate-300" },
  },
  priority: {
    high: { label: "High", classes: "bg-rose-100 text-rose-700 border-rose-200" },
    medium: { label: "Medium", classes: "bg-amber-100 text-amber-700 border-amber-200" },
    low: { label: "Low", classes: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  },
};

export const getBadge = (type, value) => {
  const entry = BADGE_STYLES[type]?.[value];
  return entry || { label: value || "Unknown", classes: "bg-slate-100 text-slate-600 border-slate-200" };
};