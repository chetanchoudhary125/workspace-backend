// src/components/CommentsSection.jsx
import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquare, Send, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../API/axiosInstance";
import Avatar from "../common/Avatar";
import { FIELD_INPUT_CLASS } from "../../utils/task";
import { timeAgo } from "../../utils/dates";

const CommentsSection = ({ taskId, user, isAdmin, currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [body, setBody] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(`/api/tasks/${taskId}/comments`);
      setComments(data.comments || []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePost = async (e) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setIsPosting(true);
    try {
      const { data } = await axiosInstance.post(`/api/tasks/${taskId}/comments`, {
        body: trimmed,
      });
      setComments((c) => [...c, data.comment]);
      setBody("");
      toast.success("Comment posted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't post the comment.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (comment) => {
    if (!window.confirm("Delete this comment?")) return;
    setBusyId(comment._id);
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}/comments/${comment._id}`);
      setComments((c) => c.filter((x) => x._id !== comment._id));
      toast.success("Comment deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete the comment.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="border-t border-slate-200 px-5 py-5 sm:px-6">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-900">Comments</h3>
        <span className="rounded-full bg-slate-100 px-1.5 text-[10px] font-medium text-slate-600">
          {comments.length}
        </span>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/3 animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error.response?.data?.message || "Couldn't load comments."}
        </p>
      )}

      {!isLoading && !error && comments.length === 0 && (
        <p className="text-sm text-slate-500">No comments yet. Be the first.</p>
      )}

      {!isLoading && !error && comments.length > 0 && (
        <ul className="space-y-4">
          {comments.map((c) => {
            const canDelete = isAdmin || c.userId?._id === currentUserId;
            return (
              <li key={c._id} className="group flex gap-3">
                <Avatar name={c.userId?.name || "Someone"} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-900">
                      {c.userId?.name || "Someone"}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {timeAgo(c.createdAt)}
                    </span>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        disabled={busyId === c._id}
                        aria-label="Delete comment"
                        className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {c.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handlePost} className="mt-5 flex gap-2">
        <Avatar name={user?.name || "You"} size="sm" />
        <div className="relative flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a comment…"
            rows={2}
            maxLength={2000}
            className={`${FIELD_INPUT_CLASS} resize-none pr-11`}
          />
          <button
            type="submit"
            disabled={isPosting || !body.trim()}
            aria-label="Post comment"
            className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPosting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CommentsSection;