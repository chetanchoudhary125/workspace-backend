import { useMemo, useState } from "react";
import { Search, UserPlus, X } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";

const AddProjectMemberModal = ({
  projectId,
  currentRole,        // "Admin" | "Project_Manager"
  workspaceMembers,   // from workspace context (all members)
  projectMembers,     // from project context (already on this project)
  onClose,
  onAdded,
}) => {
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  // userIds already on this project
  const existingUserIds = useMemo(
    () => new Set(projectMembers.map((m) => m.userId?._id).filter(Boolean)),
    [projectMembers]
  );

  // workspace members eligible to be added
  const eligible = useMemo(() => {
    return workspaceMembers.filter((m) => {
      // already on project
      if (existingUserIds.has(m._id)) return false;

      // only PM / Developer can be added to a project
      if (m.role !== "Project_Manager" && m.role !== "Developer") return false;

      // a Project_Manager may only add Developers
      if (currentRole === "Project_Manager" && m.role !== "Developer") {
        return false;
      }

      return true;
    });
  }, [workspaceMembers, existingUserIds, currentRole]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eligible;
    return eligible.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
    );
  }, [eligible, query]);

  const handleAdd = async (member) => {
    setError("");
    setBusyId(member._id);
    try {
      await axiosInstance.post(`/api/projects/${projectId}/members`, {
        email: member.email,
      });
      toast.success(`${member.name} added to the project`);
      onAdded();
    } catch (err) {
      const message =
        err.response?.data?.message || "Couldn't add the member.";
      setError(message);
      toast.error(message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Project access
            </p>
            <h2 className="mt-1.5 text-xl font-semibold text-slate-900">
              Add member
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-slate-200 px-5 py-3 sm:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              aria-label="Search members"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {error && (
          <p className="mx-5 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:mx-6">
            {error}
          </p>
        )}

        <div className="max-h-[55vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-center sm:px-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <UserPlus className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-800">
                {eligible.length === 0
                  ? "No one left to add"
                  : "No matches"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {eligible.length === 0
                  ? "Every eligible workspace member is already on this project."
                  : "Try a different name or email."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((member) => {
                const isBusy = busyId === member._id;
                return (
                  <li
                    key={member._id}
                    className="flex items-center gap-3 px-5 py-3 sm:px-6"
                  >
                    <Avatar name={member.name || "Unknown"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {member.email}
                      </p>
                    </div>
                    <Badge type="role" value={member.role} />
                    <button
                      type="button"
                      onClick={() => handleAdd(member)}
                      disabled={isBusy}
                      className="shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBusy ? "Adding…" : "Add"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50/60 px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectMemberModal;