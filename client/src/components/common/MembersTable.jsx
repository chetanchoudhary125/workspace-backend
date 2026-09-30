import { Trash2, Users } from "lucide-react";
import Avatar from "./Avatar";
import Badge from "./Badge";
import EmptyState from "./EmptyState";

const ASSIGNABLE_ROLES_FALLBACK = [];

const formatJoined = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const roleLabel = (r) =>
  r === "Project_Manager" ? "Project Manager" : r;

const MembersTable = ({
  members = [],
  getMemberUser,
  isSelf,
  getJoinedAt,
  roleOptions,           // string[] | null — when provided, role becomes editable
  onRoleChange,
  canRemove,
  onRemove,
  busyId = null,
  showActions = false,
  emptyTitle = "No members",
  emptyDescription = "",
  emptyAction = null,
}) => {
  const editableRoles = Array.isArray(roleOptions)
    ? roleOptions
    : ASSIGNABLE_ROLES_FALLBACK;

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white/85 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/60 px-4 py-3.5 text-slate-700 sm:px-5">
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">
          {members.length} {members.length === 1 ? "member" : "members"}
        </span>
      </div>

      {members.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={Users}
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-155">
            <thead>
              <tr className="bg-slate-50/60 text-left text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                <th className="px-4 py-3 sm:px-5">Member</th>
                <th className="px-4 py-3 sm:px-5">Role</th>
                <th className="px-4 py-3 sm:px-5">Joined</th>
                {showActions && (
                  <th className="px-4 py-3 text-right sm:px-5">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {members.map((member) => {
                const user = getMemberUser(member);
                const self = isSelf(member);
                const isBusy = busyId === user.id;
                const editable = editableRoles.length > 0 && !self;
                const removable = showActions && canRemove(member) && !self;

                return (
                  <tr key={user.id} className="text-sm text-slate-700">
                    <td className="px-4 py-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name || "Unknown"} size="md" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {user.name || "Unknown member"}
                            {self && (
                              <span className="ml-1.5 text-xs font-normal text-slate-400">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {user.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 sm:px-5">
                      {editable ? (
                        <select
                          value={member.role}
                          disabled={isBusy}
                          onChange={(e) => onRoleChange(member, e.target.value)}
                          aria-label={`Change role for ${user.name}`}
                          className="min-w-37.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                        >
                          {editableRoles.map((r) => (
                            <option key={r} value={r}>
                              {roleLabel(r)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Badge type="role" value={member.role} />
                      )}
                    </td>

                    <td className="px-4 py-4 text-slate-600 sm:px-5">
                      {formatJoined(getJoinedAt(member))}
                    </td>

                    {showActions && (
                      <td className="px-4 py-4 text-right sm:px-5">
                        {removable && (
                          <button
                            type="button"
                            onClick={() => onRemove(member)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {isBusy ? "Removing…" : "Remove"}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MembersTable;