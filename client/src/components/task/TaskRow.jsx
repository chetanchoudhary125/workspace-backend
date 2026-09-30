import {
  CalendarDays,
  ChevronRight,
  Flag,
  FolderKanban,
} from "lucide-react";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import { getDeadlineInfo } from "../../utils/dates";
import { DEADLINE_TONE_CLASSES } from "../../utils/task";

const TaskRow = ({ task, onOpen }) => {
  const projectName = task.projectId?.name || "Project";
  const deadline = getDeadlineInfo(task.deadline, task.status === "done");

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-50/70 sm:px-5"
      >
        <div className="hidden shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-indigo-50 group-hover:text-indigo-600 sm:flex sm:h-10 sm:w-10">
          <FolderKanban className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-slate-900">
              {task.title}
            </p>
            <Badge type="taskStatus" value={task.status} />
            <Badge type="priority" value={task.priority} icon={Flag} />
            {task.label && <Badge type="label" value={task.label} />}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="truncate">{projectName}</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className={DEADLINE_TONE_CLASSES[deadline.tone]}>
                {deadline.full || "No deadline"}
              </span>
            </span>
          </div>
        </div>

        {task.assigneeId?.name && (
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Avatar name={task.assigneeId.name} size="sm" />
          </div>
        )}

        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
      </button>
    </li>
  );
};

export default TaskRow;