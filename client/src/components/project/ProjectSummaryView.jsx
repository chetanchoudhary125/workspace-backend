import Badge from "../common/Badge";
import { getDeadlineInfo } from "../../utils/dates";

const toneClass = {
  overdue: "text-red-600",
  soon: "text-amber-600",
  normal: "text-slate-500",
  done: "text-slate-400",
  none: "text-slate-400",
};

const ProjectSummaryView = ({ summary }) => {
  const counts = summary.taskCounts || {};
  const total = counts.total || 0;
  const done = counts.done || 0;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const deadline = getDeadlineInfo(
    summary.deadline,
    summary.status === "completed"
  );

  const cells = [
    { label: "Backlog", value: counts.backlog || 0 },
    { label: "In Progress", value: counts.in_progress || 0 },
    { label: "In Review", value: counts.in_review || 0 },
    { label: "Done", value: done },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
          Project summary
        </p>
        <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {summary.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <Badge type="status" value={summary.status} />
          <span className={`text-sm ${toneClass[deadline.tone]}`}>
            {deadline.full ? `Deadline · ${deadline.full}` : "No deadline"}
          </span>
        </div>
      </div>

      <div className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-700">Progress</p>
          <p className="text-sm text-slate-500">
            {done} / {total} done · {percent}%
          </p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cells.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                {c.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {c.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectSummaryView;