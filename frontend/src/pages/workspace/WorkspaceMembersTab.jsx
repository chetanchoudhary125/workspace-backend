import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import PageHeader from "../../components/common/PageHeader";
import InviteMemberModal from "../../components/workspace/InviteMemberModal";

const ASSIGNABLE_ROLES = ["Project_Manager", "Developer", "Viewer"];
const roleLabel = (r) => (r === "Project_Manager" ? "Project Manager" : r);

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

const WorkspaceMembersTab = () => {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const { members = [], role, refetchMembers } = useOutletContext() || {};

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [tableError, setTableError] = useState("");

  const isAdmin = role === "Admin";
  const canInvite = role === "Admin" || role === "Project_Manager";

  const handleRoleChange = async (member, nextRole) => {
    const id = member.memberId || member._id;
    setTableError("");
    setBusyId(id);
    try {
      await axiosInstance.patch(
        `/api/workspaces/${workspaceId}/members/${id}/role`,
        { role: nextRole }
      );
      toast.success("Role updated");
      refetchMembers?.();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update the member role.";
      setTableError(message);
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (member) => {
    const id = member.memberId || member._id;
    if (!window.confirm(`Remove ${member.name} from this workspace?`)) return;

    setTableError("");
    setBusyId(id);
    try {
      await axiosInstance.delete(
        `/api/workspaces/${workspaceId}/members/${id}`
      );
      toast.success("Member removed");
      refetchMembers?.();
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to remove the member.";
      setTableError(message);
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Team access"
        title="Members"
        description="Everyone with access to this workspace and their roles."
      >
        {canInvite && (
          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Invite member</span>
          </button>
        )}
      </PageHeader>

      {tableError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {tableError}
        </p>
      )}

      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white/85 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/60 px-4 py-3.5 text-slate-700 sm:px-5">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
        </div>

        <div className="max-w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-155">
            <thead>
              <tr className="bg-slate-50/60 text-left text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                <th className="px-4 py-3 sm:px-5">Member</th>
                <th className="px-4 py-3 sm:px-5">Role</th>
                <th className="px-4 py-3 sm:px-5">Joined</th>
                {isAdmin && (
                  <th className="px-4 py-3 text-right sm:px-5">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 4 : 3}
                    className="px-4 py-10 text-center text-sm text-slate-500 sm:px-5"
                  >
                    No members yet.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const id = member.memberId || member._id;
                  const isSelf = member._id === user?._id;
                  const isBusy = busyId === id;

                  return (
                    <tr key={id} className="text-sm text-slate-700">
                      <td className="px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <Avatar name={member.name || "Unknown"} size="md" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {member.name || "Unknown member"}
                              {isSelf && (
                                <span className="ml-1.5 text-xs font-normal text-slate-400">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {member.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 sm:px-5">
                        {isAdmin && !isSelf ? (
                          <select
                            value={member.role}
                            disabled={isBusy}
                            onChange={(e) =>
                              handleRoleChange(member, e.target.value)
                            }
                            aria-label={`Change role for ${member.name}`}
                            className="min-w-37.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                          >
                            {ASSIGNABLE_ROLES.map((r) => (
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
                        {formatJoined(member.joinedAt)}
                      </td>

                      {isAdmin && (
                        <td className="px-4 py-4 text-right sm:px-5">
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => handleRemove(member)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isInviteOpen && (
        <InviteMemberModal
          workspaceId={workspaceId}
          currentRole={role}
          onClose={() => setIsInviteOpen(false)}
          onInvited={() => {
            setIsInviteOpen(false);
            refetchMembers?.();
          }}
        />
      )}
    </div>
  );
};

export default WorkspaceMembersTab;