import { useState } from "react";
import { Plus } from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import MembersTable from "../../components/common/MembersTable";
import InviteMemberModal from "../../components/workspace/InviteMemberModal";

const ASSIGNABLE_ROLES = ["Project_Manager", "Developer", "Viewer"];

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

      <MembersTable
        members={members}
        getMemberUser={(m) => ({
          id: m.memberId || m._id,
          name: m.name,
          email: m.email,
        })}
        isSelf={(m) => m._id === user?._id}
        getJoinedAt={(m) => m.joinedAt}
        roleOptions={isAdmin ? ASSIGNABLE_ROLES : null}
        onRoleChange={handleRoleChange}
        canRemove={() => isAdmin}
        onRemove={handleRemove}
        busyId={busyId}
        showActions={isAdmin}
        emptyTitle="No members yet"
        emptyDescription="Invite teammates to start collaborating."
      />

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