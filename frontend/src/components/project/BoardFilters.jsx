import { Plus, Search } from "lucide-react";
import { TASK_PRIORITIES, TASK_LABELS } from "../../utils/task";

const selectClass =
  "rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

const BoardFilters = ({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  label,
  onLabelChange,
  assigneeId,
  onAssigneeChange,
  onlyMine,
  onToggleOnlyMine,
  onClear,
  anyFilter,
  projectMembers,
  canCreateTask,
  onNewTask,
}) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks…"
          aria-label="Search tasks"
          className="w-full min-w-[200px] rounded-xl border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        aria-label="Filter by priority"
        className={selectClass}
      >
        <option value="">All priorities</option>
        {TASK_PRIORITIES.slice().reverse().map((p) => (
          <option key={p} value={p}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>

      <select
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
        aria-label="Filter by label"
        className={selectClass}
      >
        <option value="">All labels</option>
        {TASK_LABELS.filter((l) => l.value).map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>

      <select
        value={assigneeId}
        onChange={(e) => onAssigneeChange(e.target.value)}
        aria-label="Filter by assignee"
        className={selectClass}
      >
        <option value="">All assignees</option>
        {projectMembers.map((m) => {
          const uid = m.userId?._id || m.userId;
          return (
            <option key={uid} value={uid}>
              {m.userId?.name || "Unknown"}
            </option>
          );
        })}
      </select>

      <button
        type="button"
        onClick={onToggleOnlyMine}
        aria-pressed={onlyMine}
        className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
          onlyMine
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-white"
        }`}
      >
        My tasks
      </button>

      {anyFilter && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-slate-500 transition hover:text-slate-800"
        >
          Clear
        </button>
      )}
    </div>

    {canCreateTask && (
      <button
        type="button"
        onClick={onNewTask}
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New task</span>
      </button>
    )}
  </div>
);

export default BoardFilters;