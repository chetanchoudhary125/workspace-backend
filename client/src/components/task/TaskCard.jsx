import { CalendarDays, Flag } from "lucide-react";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import TaskStatusMenu from "./TaskStatusMenu";
import { getDeadlineInfo } from "../../utils/dates";
import { DEADLINE_TONE_CLASSES } from "../../utils/task";

const firstName = (name) => (name ? name.split(" ")[0] : "");

const TaskCard = ({ task, canMove, onOpen, onStatusChange }) => {
  const deadline = getDeadlineInfo(task.deadline, task.status === "done");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:shadow-[0_6px_14px_rgba(15,23,42,0.06)]"
    >
      <div className="flex items-center gap-1.5">
        <Badge type="priority" value={task.priority} icon={Flag} />
        {task.label && <Badge type="label" value={task.label} />}
      </div>

      <p className="mt-2 line-clamp-3 text-sm font-medium leading-snug text-slate-900">
        {task.title}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        {task.assigneeId?.name ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar name={task.assigneeId.name} size="sm" />
            <span className="truncate text-xs text-slate-600">
              {firstName(task.assigneeId.name)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Unassigned</span>
        )}

        {deadline.full && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 text-[11px] font-medium ${DEADLINE_TONE_CLASSES[deadline.tone]}`}
          >
            <CalendarDays className="h-3 w-3" />
            {deadline.tone === "overdue"
              ? "Overdue"
              : deadline.tone === "soon"
                ? "Due soon"
                : deadline.full}
          </span>
        )}
      </div>

      {canMove && (
        <div className="mt-3 flex justify-end">
          <TaskStatusMenu value={task.status} onChange={onStatusChange} />
        </div>
      )}
    </div>
  );
};

export default TaskCard;