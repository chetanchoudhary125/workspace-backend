import { useCallback, useEffect, useState } from "react";
import { Activity as ActivityIcon, Lock, RefreshCw } from "lucide-react";
import axiosInstance from "../../API/axiosInstance";
import Avatar from "./Avatar";
import EmptyState from "./EmptyState";
import { getActivityAction } from "../../utils/activity";
import { timeAgo } from "../../utils/dates";

const LIMIT = 20;

const ActivityFeed = ({
  url,
  emptyTitle = "No activity yet",
  emptyDescription = "Updates will appear here as work happens.",
}) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(
    async ({ append = false, before } = {}) => {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ limit: String(LIMIT) });
        if (before) params.set("before", before);

        const { data } = await axiosInstance.get(`${url}?${params}`);
        const next = data.activities || [];

        setActivities((curr) => (append ? [...curr, ...next] : next));
        setHasMore(next.length === LIMIT);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [url]
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    const oldest = activities[activities.length - 1];
    if (!oldest?.createdAt) return;
    load({ append: true, before: oldest.createdAt });
  };

  if (isLoading) {
    return (
      <div className="rounded-[26px] border border-slate-200 bg-white/85 p-4 shadow-sm sm:p-5">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
                <div className="h-3 w-1/4 animate-pulse rounded-full bg-slate-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    const is403 = error.response?.status === 403;
    return (
      <EmptyState
        icon={is403 ? Lock : ActivityIcon}
        title={is403 ? "Access restricted" : "Couldn't load activity"}
        description={
          is403
            ? "This activity feed isn't available to your role."
            : error.response?.data?.message ||
              "Something went wrong while loading the feed."
        }
        action={
          !is403 ? (
            <button
              type="button"
              onClick={() => load()}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Try again
            </button>
          ) : null
        }
      />
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={ActivityIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white/85 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
        <p className="text-sm font-medium text-slate-700">
          {activities.length} {activities.length === 1 ? "event" : "events"}
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh feed"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <ul className="divide-y divide-slate-200">
        {activities.map((activity) => (
          <li
            key={activity._id}
            className="flex items-start gap-3 px-4 py-4 sm:px-5"
          >
            <Avatar name={activity.userId?.name || "Someone"} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-6 text-slate-600">
                <span className="font-semibold text-slate-900">
                  {activity.userId?.name || "Someone"}
                </span>{" "}
                {getActivityAction(activity)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {timeAgo(activity.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="flex justify-center border-t border-slate-200 px-4 py-4">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;