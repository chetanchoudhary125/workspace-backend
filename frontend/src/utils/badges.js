const MAPS = {
  role: {
    Admin: {
      label: "Admin",
      classes: "bg-[#f0efff] text-[#4d4aa8] border-[#ddd9ff]",
    },
    Project_Manager: {
      label: "Project Manager",
      classes: "bg-[#f2edff] text-[#5b49d7] border-[#ddd1ff]",
    },
    Developer: {
      label: "Developer",
      classes: "bg-[#eef7ff] text-[#3d6abd] border-[#d8e8ff]",
    },
    Viewer: {
      label: "Viewer",
      classes: "bg-[#f4f5f7] text-[#5b6474] border-[#e7e9ef]",
    },
  },
  status: {
    active: {
      label: "Active",
      classes: "bg-[#eafaf3] text-[#17845d] border-[#cfeadf]",
    },
    on_hold: {
      label: "On Hold",
      classes: "bg-[#fff4db] text-[#b98616] border-[#f7df9a]",
    },
    completed: {
      label: "Completed",
      classes: "bg-[#f1f3f9] text-[#5e6a85] border-[#e2e6f0]",
    },
  },
  taskStatus: {
    backlog: {
      label: "Backlog",
      classes: "bg-[#f4f5f7] text-[#59657d] border-[#e7e9ef]",
      dot: "bg-[#9aa6ba]",
    },
    in_progress: {
      label: "In Progress",
      classes: "bg-[#edf5ff] text-[#3d6abd] border-[#d8e8ff]",
      dot: "bg-[#5d8df4]",
    },
    in_review: {
      label: "In Review",
      classes: "bg-[#f0efff] text-[#4d4aa8] border-[#ddd9ff]",
      dot: "bg-[#928ddd]",
    },
    done: {
      label: "Done",
      classes: "bg-[#eafaf3] text-[#17845d] border-[#cfeadf]",
      dot: "bg-[#34c38f]",
    },
  },
  priority: {
    low: {
      label: "Low",
      classes: "bg-[#f4f5f7] text-[#5b6474] border-[#e7e9ef]",
    },
    medium: {
      label: "Medium",
      classes: "bg-[#fff4db] text-[#b98616] border-[#f7df9a]",
    },
    high: {
      label: "High",
      classes: "bg-[#fff0eb] text-[#ca6b3b] border-[#f8d0bb]",
    },
    critical: {
      label: "Critical",
      classes: "bg-[#ffe9ee] text-[#d4425d] border-[#f4c3cf]",
    },
  },
  label: {
    bug: {
      label: "Bug",
      classes: "bg-[#ffe9ee] text-[#d4425d] border-[#f4c3cf]",
    },
    feature: {
      label: "Feature",
      classes: "bg-[#f0efff] text-[#4d4aa8] border-[#ddd9ff]",
    },
    improvement: {
      label: "Improvement",
      classes: "bg-[#edf5ff] text-[#3d6abd] border-[#d8e8ff]",
    },
    chore: {
      label: "Chore",
      classes: "bg-[#f4f5f7] text-[#5b6474] border-[#e7e9ef]",
    },
  },
};

const FALLBACK = {
  label: "—",
  classes: "bg-slate-100 text-slate-500 border-slate-200",
};

export const getBadge = (type, value) => {
  if (!value) return FALLBACK;
  return MAPS[type]?.[value] || FALLBACK;
};