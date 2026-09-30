import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";

const ROLES_BY_INVITER = {
  Admin: ["Project_Manager", "Developer", "Viewer"],
  Project_Manager: ["Developer", "Viewer"],
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

const roleLabel = (r) =>
  r === "Project_Manager" ? "Project Manager" : r;

const InviteMemberModal = ({ workspaceId, currentRole, onClose, onInvited }) => {
  const availableRoles = ROLES_BY_INVITER[currentRole] || ["Viewer"];

  const [email, setEmail] = useState("");
  const [role, setRole] = useState(availableRoles[0]);
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
      toast.success("Member invited");
      onInvited();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while inviting the member."
      );
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Workspace access
            </p>
            <h2 className="mt-1.5 text-xl font-semibold text-slate-900">
              Invite member
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="invite-email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              The person must already have a DevBoard account.
            </p>
          </div>

          <div>
            <label
              htmlFor="invite-role"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
            >
              {availableRoles.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Inviting…" : "Send invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;