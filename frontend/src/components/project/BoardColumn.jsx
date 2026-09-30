import TaskCard from "../task/TaskCard";

const DOT = {
  backlog: "bg-slate-400",
  in_progress: "bg-sky-500",
  in_review: "bg-violet-500",
  done: "bg-emerald-500",
};

const BoardColumn = ({
  status,
  label,
  tasks,
  canMove,
  onOpenTask,
  onStatusChange,
}) => (
  <div className="w-[82%] shrink-0 snap-start rounded-2xl border border-slate-200 bg-slate-50/60 md:w-auto md:shrink">
    <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5">
      <span className={`h-2 w-2 rounded-full ${DOT[status]}`} />
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="rounded-full bg-slate-200 px-1.5 text-[10px] font-medium text-slate-600">
        {tasks.length}
      </span>
    </div>

    <div className="space-y-2 p-2.5">
      {tasks.length === 0 && (
        <p className="px-1 py-6 text-center text-xs text-slate-400">
          No tasks
        </p>
      )}

      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          canMove={canMove(task)}
          onOpen={() => onOpenTask(task._id)}
          onStatusChange={(next) => onStatusChange(task, next)}
        />
      ))}
    </div>
  </div>
);

export default BoardColumn;