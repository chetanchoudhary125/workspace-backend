import { useState } from "react";
import { UserMinus, UserPlus, Users } from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import AddProjectMemberModal from "../../components/project/AddProjectMemberModal";
import { useAuth } from "../../context/AuthContext";

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
    const isSelf = member.userId?._id === user?._id;
    if (isSelf) return false;
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

    const id = member._id;
    setTableError("");
    setBusyId(id);

    try {
      await axiosInstance.delete(
        `/api/projects/${projectId}/members/${id}`
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

      <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white/85 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/60 px-4 py-3.5 text-slate-700 sm:px-5">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">
            {projectMembers.length}{" "}
            {projectMembers.length === 1 ? "member" : "members"}
          </span>
        </div>

        {projectMembers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title="No project members"
              description="Add workspace Developers or Project Managers to this project."
              action={
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
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-155">
              <thead>
                <tr className="bg-slate-50/60 text-left text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-4 py-3 sm:px-5">Member</th>
                  <th className="px-4 py-3 sm:px-5">Role</th>
                  <th className="px-4 py-3 sm:px-5">Joined</th>
                  {canManage && (
                    <th className="px-4 py-3 text-right sm:px-5">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {projectMembers.map((member) => {
                  const isSelf = member.userId?._id === user?._id;
                  const showRemove = canRemove(member);
                  const isBusy = busyId === member._id;

                  return (
                    <tr
                      key={member._id}
                      className="text-sm text-slate-700"
                    >
                      <td className="px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={member.userId?.name || "Unknown"}
                            size="md"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {member.userId?.name || "Unknown"}
                              {isSelf && (
                                <span className="ml-1.5 text-xs font-normal text-slate-400">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {member.userId?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 sm:px-5">
                        <Badge type="role" value={member.role} />
                      </td>

                      <td className="px-4 py-4 text-slate-600 sm:px-5">
                        {formatJoined(member.createdAt)}
                      </td>

                      {canManage && (
                        <td className="px-4 py-4 text-right sm:px-5">
                          {showRemove && (
                            <button
                              type="button"
                              onClick={() => handleRemove(member)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <UserMinus className="h-3.5 w-3.5" />
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