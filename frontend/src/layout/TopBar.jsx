import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/common/Avatar";

const TopBar = ({ onMenuClick, workspaceName }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#ece9ff] bg-white/70 backdrop-blur-2xl">
      <div className="mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e7e4ff] bg-[#f7f5ff] text-[#49577d] transition hover:border-[#d7d0ff] hover:bg-[#f0edff] md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center  text-sm font-bold">
              <img
                src="https://media-www.sqspcdn.com/images/pages/tools/free-tools/business-name-generator-icon-2500w.webp"
                alt=""
                className="w-40 fit"
              />
            </span>
            <span className="ml-3 text-lg font-semibold tracking-tight text-[#1b2038]">
              DevBoard
            </span>
            {workspaceName && (
              <span className="hidden truncate rounded-full border border-[#cac8f9] bg-[#f0efff] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#4b4a8c] md:inline">
                {workspaceName}
              </span>
            )}
          </div>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-full border border-[#e7e4ff] bg-[#f7f5ff] px-2 py-1.5 shadow-[0_12px_24px_rgba(95,88,223,0.08)] transition hover:border-[#d7d0ff]"
          >
            <Avatar name={user?.name || "User"} size="sm" />
            <span className="hidden text-sm font-medium text-[#2b3352] sm:block">
              {user?.name || "User"}
            </span>
            <ChevronDown className="h-4 w-4 text-[#67759b]" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-[#e7e4ff] bg-white/90 shadow-[0_20px_40px_rgba(95,88,223,0.14)]"
            >
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-[#d94d6d] transition hover:bg-[#fff1f4]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
