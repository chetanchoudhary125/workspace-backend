// import { NavLink, useParams } from "react-router-dom";
// import { Activity, FolderKanban, ListTodo, Plus, Users } from "lucide-react";

// function Sidebar({ role = "Admin", projects = [], loading = false }) {
//   const { workspaceId } = useParams();

//   const isViewer = role === "Viewer";
//   const isAdmin = role === "Admin";
//   const base = `/workspaces/${workspaceId}`;

//   const linkClass = ({ isActive }) =>
//     `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
//       isActive
//         ? "bg-slate-900 text-white shadow-sm"
//         : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
//     }`;

//   const projectLinkClass = ({ isActive }) =>
//     `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
//       isActive
//         ? "bg-slate-100 text-slate-900"
//         : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
//     }`;

//   return (
//     <aside className="flex w-full max-w-[290px] flex-col border-r border-slate-200  backdrop-blur-sm">
//       {/* Header */}
//       <div className="border-b border-slate-200 px-5 py-4">
//         <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
//           Workspace
//         </p>
//         <h2 className="mt-2 text-lg font-semibold text-slate-900">
//           Product Team
//         </h2>
//       </div>

//       <nav className="flex-1 px-3 py-4">
//         {/* Main links */}
//         <div className="space-y-1">
//           <NavLink to={base} end className={linkClass}>
//             <FolderKanban className="h-4 w-4" />
//             Projects
//           </NavLink>

//           {!isViewer && (
//             <NavLink to={`${base}/my-tasks`} className={linkClass}>
//               <ListTodo className="h-4 w-4" />
//               My Tasks
//             </NavLink>
//           )}

//           <NavLink to={`${base}/members`} className={linkClass}>
//             <Users className="h-4 w-4" />
//             Members
//           </NavLink>

//           {!isViewer && (
//             <NavLink to={`${base}/activity`} className={linkClass}>
//               <Activity className="h-4 w-4" />
//               Activity
//             </NavLink>
//           )}
//         </div>

//         {/* Projects list */}
//         <div className="mt-6">
//           <div className="mb-3 flex items-center justify-between px-2">
//             <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
//               Projects
//             </p>

//             {isAdmin && (
//               <button
//                 type="button"
//                 className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
//               >
//                 <Plus className="h-3.5 w-3.5" />
//                 New Project
//               </button>
//             )}
//           </div>

//           <div className="space-y-1.5">
//             {loading && (
//               <div className="space-y-2 px-2">
//                 <div className="h-8 animate-pulse rounded-lg bg-slate-200" />
//                 <div className="h-8 animate-pulse rounded-lg bg-slate-200" />
//               </div>
//             )}

//             {!loading && projects.length === 0 && (
//               <p className="px-2 text-sm text-slate-500">No projects yet</p>
//             )}

//             {!loading &&
//               projects.map((project) => (
//                 <NavLink
//                   key={project._id}
//                   to={`${base}/projects/${project._id}`}
//                   className={projectLinkClass}
//                 >
//                   <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-300" />
//                   <span className="truncate">{project.name}</span>
//                 </NavLink>
//               ))}
//           </div>
//         </div>
//       </nav>
//     </aside>
//   );
// }

// export default Sidebar;

import { NavLink, useParams } from "react-router-dom";
import { Activity, FolderKanban, ListTodo, Plus, Users, X } from "lucide-react";

function Sidebar({ role = "Viewer", projects = [], loading = false, workspaceName, isOpen = false, onClose }) {
  const { workspaceId } = useParams();
  const isViewer = role === "Viewer";
  const isAdmin = role === "Admin";
  const base = `/workspaces/${workspaceId}`;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const projectLinkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
      isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80%] transform flex-col border-r border-slate-200 transition-transform duration-200 ease-in-out
          md:static md:z-auto md:w-full md:max-w-[290px] md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">Workspace</p>
            <h2 className="mt-2 truncate text-lg font-semibold text-slate-900">
              {workspaceName || "Loading..."}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close menu" className="text-slate-400 hover:text-slate-600 md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            <NavLink to={base} end className={linkClass} onClick={onClose}>
              <FolderKanban className="h-4 w-4" />
              Projects
            </NavLink>

            {!isViewer && (
              <NavLink to={`${base}/my-tasks`} className={linkClass} onClick={onClose}>
                <ListTodo className="h-4 w-4" />
                My Tasks
              </NavLink>
            )}

            <NavLink to={`${base}/members`} className={linkClass} onClick={onClose}>
              <Users className="h-4 w-4" />
              Members
            </NavLink>

            {!isViewer && (
              <NavLink to={`${base}/activity`} className={linkClass} onClick={onClose}>
                <Activity className="h-4 w-4" />
                Activity
              </NavLink>
            )}
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Projects</p>
              {isAdmin && (
                <button type="button" className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                  <Plus className="h-3.5 w-3.5" />
                  New Project
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {loading && (
                <div className="space-y-2 px-2">
                  <div className="h-8 animate-pulse rounded-lg bg-slate-200" />
                  <div className="h-8 animate-pulse rounded-lg bg-slate-200" />
                </div>
              )}
              {!loading && projects.length === 0 && (
                <p className="px-2 text-sm text-slate-500">No projects yet</p>
              )}
              {!loading &&
                projects.map((project) => (
                  <NavLink key={project._id} to={`${base}/projects/${project._id}`} className={projectLinkClass} onClick={onClose}>
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-300" />
                    <span className="truncate">{project.name}</span>
                  </NavLink>
                ))}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;