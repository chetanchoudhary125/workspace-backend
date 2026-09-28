import { useState } from "react";
import { X } from "lucide-react";
import axiosInstance from "../API/axiosInstance";

const ROLES_BY_INVITER = {
  Admin: ["Developer", "Viewer", "Project_Manager"],
  Project_Manager: ["Developer", "Viewer"],
};

const InviteMemberModal = ({ workspaceId, currentRole, onClose, onInvited }) => {
  const availableRoles = ROLES_BY_INVITER[currentRole] || [];
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(availableRoles[0] || "Developer");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await axiosInstance.post(`/api/workspaces/${workspaceId}/invite`, {
        email: email.trim(),
        role,
      });
      onInvited();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong while inviting the member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[26px] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Workspace access
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Invite member</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="invite-email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="invite-role" className="mb-1.5 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            >
              {availableRoles.map((r) => (
                <option key={r} value={r}>{r === "Project_Manager" ? "Project Manager" : r}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Inviting..." : "Send invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;