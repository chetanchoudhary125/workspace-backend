import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import MembersTable from "../../components/common/MembersTable";
import AddProjectMemberModal from "../../components/project/AddProjectMemberModal";

const ProjectMembersTab = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const {
    role,
    members: workspaceMembers = [],
    projectMembers = [],
    refetchProject,
  } = useOutletContext() || {};

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [tableError, setTableError] = useState("");

  const isAdmin = role === "Admin";
  const isPM = role === "Project_Manager";
  const canManage = isAdmin || isPM;

  const canRemove = (member) => {
    if (!canManage) return false;
    if (isPM && member.role === "Project_Manager") return false;
    return true;
  };

  const handleRemove = async (member) => {
    const name = member.userId?.name || "this member";
    if (
      !window.confirm(
        `Remove ${name} from this project?\n\nThey'll lose access to the project and its tasks. Their workspace membership is unaffected.`
      )
    ) {
      return;
    }

    setTableError("");
    setBusyId(member._id);
    try {
      await axiosInstance.delete(
        `/api/projects/${projectId}/members/${member._id}`
      );
      toast.success("Member removed from project");
      refetchProject?.();
    } catch (err) {
      const message =
        err.response?.data?.message || "Couldn't remove the member.";
      setTableError(message);
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Project members
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            People with access to this project.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add member</span>
          </button>
        )}
      </div>

      {tableError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {tableError}
        </p>
      )}

      <MembersTable
        members={projectMembers}
        getMemberUser={(m) => ({
          id: m._id,
          name: m.userId?.name,
          email: m.userId?.email,
        })}
        isSelf={(m) => m.userId?._id === user?._id}
        getJoinedAt={(m) => m.createdAt}
        roleOptions={null}
        canRemove={canRemove}
        onRemove={handleRemove}
        busyId={busyId}
        showActions={canManage}
        emptyTitle="No project members"
        emptyDescription="Add workspace Developers or Project Managers to this project."
        emptyAction={
          canManage ? (
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <UserPlus className="h-4 w-4" />
              Add member
            </button>
          ) : null
        }
      />

      {isAddOpen && (
        <AddProjectMemberModal
          projectId={projectId}
          currentRole={role}
          workspaceMembers={workspaceMembers}
          projectMembers={projectMembers}
          onClose={() => setIsAddOpen(false)}
          onAdded={() => {
            refetchProject?.();
          }}
        />
      )}
    </div>
  );
};

export default ProjectMembersTab;