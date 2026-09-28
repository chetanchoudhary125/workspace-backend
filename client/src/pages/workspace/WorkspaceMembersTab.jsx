import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";
import axiosInstance from "../../API/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Badge from "../../components/Badge";
import InviteMemberModal from "../../components/InviteMemberModal";
import { getInitials } from "../../utils/initials";

const ASSIGNABLE_ROLES = ["Developer", "Viewer", "Project_Manager"];

const formatJoinedDate = (date) => {
  if (!date) return "Recently";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

function WorkspaceMembersTab() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const { members = [], role = "Viewer", refetchMembers } = useOutletContext() || {};
  const isAdmin = role === "Admin";
  const canInvite = isAdmin || role === "Project_Manager";

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [tableError, setTableError] = useState("");

  const sortedMembers = [...members].sort(
    (a, b) => new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0)
  );

  const handleRoleChange = async (memberId, nextRole) => {
    setTableError("");
    try {
      await axiosInstance.patch(`/api/workspaces/${workspaceId}/members/${memberId}/role`, {
        role: nextRole,
      });
      refetchMembers?.();
    } catch (error) {
      setTableError(error.response?.data?.message || "Failed to update the member role.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the workspace?")) return;
    setTableError("");
    try {
      await axiosInstance.delete(`/api/workspaces/${workspaceId}/members/${memberId}`);
      refetchMembers?.();
    } catch (error) {
      setTableError(error.response?.data?.message || "Failed to remove the member.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
            Team access
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Members
          </h1>
        </div>

        {canInvite && (
          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Invite member</span>
          </button>
        )}
      </div>

      {tableError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {tableError}
        </div>
      )}

      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white/80 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/70 px-4 py-3.5 text-slate-700 sm:px-5">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">{sortedMembers.length} members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/60 text-left text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                <th className="px-4 py-3 sm:px-5">Member</th>
                <th className="px-4 py-3 sm:px-5">Role</th>
                <th className="px-4 py-3 sm:px-5">Joined</th>
                {isAdmin && <th className="px-4 py-3 text-right sm:px-5">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedMembers.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="px-4 py-10 text-center text-sm text-slate-500 sm:px-5">
                    No members have been added to this workspace yet.
                  </td>
                </tr>
              ) : (
                sortedMembers.map((member) => {
                  const isSelf = member._id === user?._id;
                  return (
                    <tr key={member._id} className="border-t border-slate-200 text-sm text-slate-700">
                      <td className="px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
                            {getInitials(member.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {member.name || "Unknown member"}
                              {isSelf && <span className="ml-1.5 text-xs font-normal text-slate-400">(you)</span>}
                            </p>
                            <p className="truncate text-xs text-slate-500">{member.email || "No email provided"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 align-middle sm:px-5">
                        {isAdmin && !isSelf ? (
                          <select
                            value={member.role || "Viewer"}
                            onChange={(e) => handleRoleChange(member._id, e.target.value)}
                            className="min-w-[150px] rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                          >
                            {ASSIGNABLE_ROLES.map((r) => (
                              <option key={r} value={r}>{r === "Project_Manager" ? "Project Manager" : r}</option>
                            ))}
                          </select>
                        ) : (
                          <Badge type="role" value={member.role || "Viewer"} />
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-600 sm:px-5">{formatJoinedDate(member.joinedAt)}</td>

                      {isAdmin && (
                        <td className="px-4 py-4 text-right sm:px-5">
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member._id)}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
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
}

export default WorkspaceMembersTab;