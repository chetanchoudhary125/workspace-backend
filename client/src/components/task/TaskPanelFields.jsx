import { CalendarDays, Flag } from "lucide-react";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import { getDeadlineInfo } from "../../utils/dates";
import {
  DEADLINE_TONE_CLASSES,
  FIELD_INPUT_CLASS,
  TASK_LABELS,
  TASK_PRIORITIES,
} from "../../utils/task";

const FieldLabel = ({ children }) => (
  <h3 className="mb-1.5 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
    {children}
  </h3>
);

const TaskPanelFields = ({
  task,
  isEditing,
  draft,
  setDraft,
  projectMembers = [],
}) => {
  const deadlineInfo = getDeadlineInfo(
    task.deadline,
    task.status === "done"
  );

  return (
    <section className="grid grid-cols-1 gap-4 border-b border-slate-200 px-5 py-5 sm:grid-cols-2 sm:px-6">
      {/* Assignee */}
      <div>
        <FieldLabel>Assignee</FieldLabel>
        {isEditing ? (
          <select
            value={draft.assigneeId}
            onChange={(e) =>
              setDraft({ ...draft, assigneeId: e.target.value })
            }
            className={FIELD_INPUT_CLASS}
          >
            <option value="">Unassigned</option>
            {projectMembers.map((m) => {
              const uid = m.userId?._id || m.userId;
              return (
                <option key={uid} value={uid}>
                  {m.userId?.name || "Unknown"}
                </option>
              );
            })}
          </select>
        ) : task.assigneeId?.name ? (
          <div className="flex items-center gap-2">
            <Avatar name={task.assigneeId.name} size="sm" />
            <span className="text-sm font-medium text-slate-800">
              {task.assigneeId.name}
            </span>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Unassigned</p>
        )}
      </div>

      {/* Priority */}
      <div>
        <FieldLabel>Priority</FieldLabel>
        {isEditing ? (
          <select
            value={draft.priority}
            onChange={(e) =>
              setDraft({ ...draft, priority: e.target.value })
            }
            className={FIELD_INPUT_CLASS}
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        ) : (
          <Badge type="priority" value={task.priority} icon={Flag} />
        )}
      </div>

      {/* Label */}
      <div>
        <FieldLabel>Label</FieldLabel>
        {isEditing ? (
          <select
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            className={FIELD_INPUT_CLASS}
          >
            {TASK_LABELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        ) : task.label ? (
          <Badge type="label" value={task.label} />
        ) : (
          <p className="text-sm text-slate-400">None</p>
        )}
      </div>

      {/* Deadline */}
      <div>
        <FieldLabel>Deadline</FieldLabel>
        {isEditing ? (
          <input
            type="date"
            value={draft.deadline}
            onChange={(e) =>
              setDraft({ ...draft, deadline: e.target.value })
            }
            className={FIELD_INPUT_CLASS}
          />
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-medium ${DEADLINE_TONE_CLASSES[deadlineInfo.tone]}`}
          >
            <CalendarDays className="h-4 w-4" />
            {deadlineInfo.full || "No deadline"}
          </span>
        )}
      </div>
    </section>
  );
};

export default TaskPanelFields;