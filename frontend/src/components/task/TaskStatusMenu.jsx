import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { TASK_STATUSES } from "../../utils/task";

const DOT = {
  backlog: "bg-slate-400",
  in_progress: "bg-sky-500",
  in_review: "bg-violet-500",
  done: "bg-emerald-500",
};

const TaskStatusMenu = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = TASK_STATUSES.find((s) => s.value === value);

  return (
    <div
      ref={ref}
      className="relative"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${DOT[value]}`} />
        {current?.label}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          {TASK_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                if (s.value !== value) onChange(s.value);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-slate-50 ${
                s.value === value
                  ? "bg-slate-50 font-medium text-slate-900"
                  : "text-slate-700"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${DOT[s.value]}`} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskStatusMenu;