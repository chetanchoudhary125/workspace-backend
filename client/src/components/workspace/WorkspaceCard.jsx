import { Link } from "react-router-dom";
import { FolderKanban } from "lucide-react";
import Badge from "../common/Badge";
import { formatDateTime } from "../../utils/dates";

const formatCreated = (value) => {
  if (!value) return "Recently";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const WorkspaceCard = ({ workspace }) => (
  <Link
    to={`/workspaces/${workspace._id}`}
    className="group flex min-h-[190px] flex-col rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <FolderKanban className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-900">
            {workspace.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Created {formatCreated(workspace.createdAt)}
          </p>
        </div>
      </div>
      <Badge type="role" value={workspace.role} />
    </div>

    <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
      {workspace.description || "No description yet."}
    </p>

    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
      <span>{formatDateTime(workspace.createdAt)}</span>
      <span className="font-medium text-slate-700 transition group-hover:text-slate-900">
        Open →
      </span>
    </div>
  </Link>
);

export default WorkspaceCard;