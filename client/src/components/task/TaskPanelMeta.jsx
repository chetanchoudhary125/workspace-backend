import { Flag } from "lucide-react";
import Badge from "../common/Badge";
import { TASK_STATUSES } from "../../utils/task";

const TaskPanelMeta = ({ task, canEditStatus, onStatusChange }) => (
  <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
    {canEditStatus ? (
      <select
        value={task.status}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label="Task status"
        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      >
        {TASK_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    ) : (
      <Badge type="taskStatus" value={task.status} />
    )}

    <Badge type="priority" value={task.priority} icon={Flag} />

    {task.label && <Badge type="label" value={task.label} />}
  </div>
);

export default TaskPanelMeta;