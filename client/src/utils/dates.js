const UTC = { timeZone: "UTC" };

export const timeAgo = (value) => {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(diff / 60000));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...UTC,
  });
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatDayHeading = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    ...UTC,
  });
};

export const formatDeadline = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...UTC,
  });
};

export const getDeadlineInfo = (deadline, isDone = false) => {
  const full = formatDeadline(deadline);
  if (!full) return { label: "No deadline", tone: "none", full: null };

  if (isDone) return { label: full, tone: "done", full };

  const due = new Date(deadline);
  const now = new Date();
  const dueUTC = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.round((dueUTC - todayUTC) / 86400000);

  if (days < 0) return { label: `Overdue · ${full}`, tone: "overdue", full };
  if (days === 0) return { label: "Due today", tone: "soon", full };
  if (days <= 3) return { label: `Due in ${days}d`, tone: "soon", full };
  return { label: full, tone: "normal", full };
};