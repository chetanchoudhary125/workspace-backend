import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  MessageSquareMore,
  Search,
  Settings,
  User,
  BriefcaseBusiness,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="sticky top-0  backdrop-blur-xl">
      <div className="mx-auto flex  items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
            N
          </span>
          <div className="text-lg font-semibold tracking-tight text-slate-900">
            NoteFlow
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center px-6 md:flex">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <button
            type="button"
            aria-label="Messages"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
          >
            <MessageSquareMore className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-slate-300"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {initials}
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-slate-800">
                  {user?.name || "User"}
                </p>
              </div>

              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                <button
                  type="button"
                  className="flex w-full items-center justify-start gap-2 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-start gap-2 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-start gap-2 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <BriefcaseBusiness className="h-4 w-4" />
                  Workspace
                </button>

                <div className="my-1 h-px bg-slate-200" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-start gap-2 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
