
// import { CalendarDays, FolderKanban, Plus } from "lucide-react";
// import { Link, useOutletContext, useParams } from "react-router-dom";

// const statusClasses = {
//   active: "bg-emerald-100 text-emerald-700",
//   on_hold: "bg-amber-100 text-amber-700",
//   completed: "bg-slate-200 text-slate-700",
// };

// const formatProjectStatus = (status = "active") => {
//   const normalized = String(status).replace("_", " ");
//   return normalized
//     .split(" ")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");
// };

// const formatDeadline = (date) => {
//   if (!date) return null;

//   const parsed = new Date(date);

//   if (Number.isNaN(parsed.getTime())) {
//     return null;
//   }

//   return parsed.toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//   });
// };

// function WorkspaceProjectsTab() {
//   const { workspaceId } = useParams();
//   const { projects = [], loading = false, role = "Viewer" } = useOutletContext() || {};
//   const isAdmin = role === "Admin";

//   if (loading) {
//     return (
//       <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
//         {[1, 2, 3].map((item) => (
//           <div
//             key={item}
//             className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-white/70"
//           />
//         ))}
//       </div>
//     );
//   }

//   if (!projects.length) {
//     return (
//       <div className="flex min-h-[420px] items-center justify-center">
//         <div className="w-full max-w-xl rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-sm">
//           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700">
//             <FolderKanban className="h-7 w-7" />
//           </div>

//           <h2 className="mt-5 text-2xl font-semibold text-slate-900">
//             No projects yet
//           </h2>

//           {isAdmin && (
//             <button
//               type="button"
//               className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
//             >
//               <Plus className="h-4 w-4" />
//               New project
//             </button>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between gap-4">
//         <div>
//           <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
//             Workspace overview
//           </p>
//           <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
//             Projects
//           </h1>
//         </div>

//         {isAdmin && (
//           <button
//             type="button"
//             className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
//           >
//             <Plus className="h-4 w-4" />
//             New project
//           </button>
//         )}
//       </div>

//       <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
//         {projects.map((project) => {
//           const deadline = formatDeadline(project.deadline);

//           return (
//             <Link
//               key={project._id}
//               to={`/workspaces/${workspaceId}/projects/${project._id}`}
//               className="group rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
//             >
//               <div className="flex items-start justify-between gap-3">
//                 <div className="min-w-0">
//                   <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
//                     Project
//                   </p>
//                   <h3 className="mt-2 text-xl font-semibold text-slate-900">
//                     {project.name}
//                   </h3>
//                 </div>

//                 <span
//                   className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
//                     statusClasses[project.status] || statusClasses.active
//                   }`}
//                 >
//                   {formatProjectStatus(project.status)}
//                 </span>
//               </div>

//               <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
//                 <span className="inline-flex items-center gap-2">
//                   <CalendarDays className="h-4 w-4 text-slate-400" />
//                   {deadline ? `Due ${deadline}` : "No deadline"}
//                 </span>
//               </div>
//             </Link>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// export default WorkspaceProjectsTab;

import { CalendarDays, FolderKanban, Plus } from "lucide-react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import Badge from "../../components/Badge";

const formatDeadline = (date) => {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function WorkspaceProjectsTab() {
  const { workspaceId } = useParams();
  const { projects = [], loading = false, role = "Viewer" } = useOutletContext() || {};
  const isAdmin = role === "Admin";

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-44 animate-pulse rounded-[24px] border border-slate-200 bg-white/70"
          />
        ))}
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-xl rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <FolderKanban className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-900">No projects yet</h2>
          {isAdmin && (
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              New project
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
            This workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Projects
          </h1>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New project</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const deadline = formatDeadline(project.deadline);

          return (
            <Link
              key={project._id}
              to={`/workspaces/${workspaceId}/projects/${project._id}`}
              className="group block rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                    <span className="inline-flex h-2 w-2 rounded-full bg-sky-500" />
                    Project
                  </div>
                  <h3 className="line-clamp-2 text-xl font-semibold text-slate-900">
                    {project.name}
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge type="status" value={project.status} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Priority
                </span>
                <Badge type="priority" value={project.priority || "high"} />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 text-slate-500">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    Deadline
                  </span>
                  <span className="font-medium text-slate-700">
                    {deadline || "No deadline"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default WorkspaceProjectsTab;