export const TASK_STATUSES = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

export const TASK_PRIORITIES = ["low", "medium", "high", "critical"];

export const TASK_LABELS = [
  { value: "", label: "None" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "improvement", label: "Improvement" },
  { value: "chore", label: "Chore" },
];

export const DEADLINE_TONE_CLASSES = {
  overdue: "text-red-600",
  soon: "text-amber-600",
  normal: "text-slate-500",
  done: "text-slate-400",
  none: "text-slate-400",
};

export const FIELD_INPUT_CLASS =
  "w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";