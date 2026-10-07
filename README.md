# DevBoard — Project Management Platform

A production-style project management tool built with the MERN stack. Teams create workspaces, organize work into projects, and track tasks on a Kanban board with role-based access control, threaded comments, and a full activity feed.

This is a portfolio project focused on the parts of full-stack development that tutorials skip: real authorization, session-based token revocation, cross-origin cookie handling, multi-tenant data modeling, and MongoDB transactions.

**Live Demo:** [https://workspace-frontend-c6rgbgvhg-chetan-chooudharys-projects.vercel.app]

**Backend API:** [https://workspace-backend-1-q7ms.onrender.com]

Repository:\*\* [https://github.com/chetanchoudhary125/workspace-backend]

---

## Demo Accounts

Log in with any of these accounts to see the app from different roles:

| Role            | Email             | Password   | What they see                                    |
| --------------- | ----------------- | ---------- | ------------------------------------------------ |
| Admin           | chetan@gmail.com  | 9685941192 | Everything in the workspace — full control       |
| Project Manager | anurag@gmail.com  | 123456     | Only assigned projects, can manage Developers    |
| Developer       | abhishek@gmail.co | 123456     | Only assigned projects, can move their own tasks |
| Viewer          | aayush@gmail.com  | 123456     | Read-only project summaries, no task detail      |

Switch between roles to see how the sidebar, buttons, board, and task panel change.

> The demo database is periodically reset. Data you create may not persist.

## The Problem It Solves

Jira, Asana, and Linear are all built around the same core idea: a team needs to organize work across projects, assign it to people, and see what's happening. This rebuilds that core with a clean UI and a data model designed for multi-tenant access control.

The interesting problem isn't CRUD. It's answering _"who can do what, where?"_ on every request:

- A Developer on Project A shouldn't see tasks in Project B — even if they're both in the same workspace.
- A Project Manager can add Developers to a project but not other PMs.
- A Viewer can see the percentage of tasks done in a project but can't open a single task.
- An Admin has workspace-wide power and shouldn't need to be "assigned" to a project to manage it.

These rules are enforced on the backend (middleware chain) and mirrored on the frontend (UI gating). The backend is the security boundary; the frontend just avoids showing buttons that would be rejected.

---

## Features

### Authentication & Sessions

- Register, login, logout with **httpOnly cookies** — tokens never touch JavaScript
- **JWT access token (5h) + refresh token (7d)** with rotation on every refresh
- Refresh tokens are hashed with SHA-256 and stored server-side as `Session` documents
- **Session revocation**: every access token references a session ID that's validated in the DB on every request. Logging out kills the session instantly
- **Silent token refresh**: an axios response interceptor catches 401s, refreshes once (shared in-flight promise so parallel 401s don't trigger N refreshes), and retries the original request
- Password hashing with bcrypt (cost 10)
- Cross-origin cookies configured with `SameSite=None; Secure` for Vercel ↔ Render

### Role-Based Access Control

Four workspace-level roles. Every user has exactly one role per workspace.

| Capability                      | Admin    | Project Manager      | Developer     | Viewer |
| ------------------------------- | -------- | -------------------- | ------------- | ------ |
| Create / delete projects        | ✅       | ❌                   | ❌            | ❌     |
| Edit project name / description | ✅       | ❌                   | ❌            | ❌     |
| Edit project status / deadline  | ✅       | ✅                   | ❌            | ❌     |
| Add members to project          | ✅       | ✅ (Developers only) | ❌            | ❌     |
| Remove members from project     | ✅       | ✅ (Developers only) | ❌            | ❌     |
| Create / edit / delete tasks    | ✅       | ✅                   | ❌            | ❌     |
| Move task status                | ✅ (any) | ✅ (any)             | ✅ (own only) | ❌     |
| Comment on tasks                | ✅       | ✅                   | ✅            | ❌     |
| View Kanban board               | ✅       | ✅                   | ✅            | ❌     |
| View activity feeds             | ✅       | ✅                   | ✅            | ❌     |
| View project summary            | ✅       | ✅                   | ✅            | ✅     |

Additional guard rules:

- Project Managers cannot remove other Project Managers from a project
- Nobody can remove themselves from a workspace or a project
- Admins cannot be added as project members (they have workspace-wide access already)
- Project Managers cannot invite other Project Managers to a workspace (Admin-only)
- You cannot change your own role

### Workspaces

- Create and switch between multiple workspaces
- Invite members by email with a role
- Change roles, remove members (cascades to project memberships)
- Workspace-scoped activity feed with cursor-based pagination

### Projects

- Create with name, description, priority, and deadline
- Status lifecycle: `active` → `on_hold` → `completed`
- Priority: `high` / `medium` / `low`
- Admin can edit all fields; PM can only edit status and deadline
- Delete cascades tasks, comments, members, and logs a `project_deleted` activity

### Kanban Board

- Four columns: **Backlog · In Progress · In Review · Done**
- Each card shows priority, label, assignee avatar, and deadline with tone coloring (overdue red, due-soon amber)
- Status change via a dropdown on each card — **optimistic update with rollback** on failure
- Client-side filters: priority, label, assignee, "assigned to me"
- Client-side title search
- Responsive — horizontal snap-scroll on mobile, grid on desktop
- Only users with permission see the status dropdown (Developers only on their own tasks)

### Task Detail Panel

- Slide-over panel opened by clicking a card
- URL-addressable via `/tasks/:taskId` — closing the panel returns to the board
- Full CRUD: title, description, priority, label, assignee, deadline
- Inline editing mode for Admin and PM
- Developers can only change status on their own tasks
- Comments section with avatars and relative timestamps
- Delete cascade removes all comments

### Comments

- Threaded per task, oldest first
- Author or Admin can delete a comment
- Every comment generates a `comment_added` activity

### Activity Feed

Immutable event log across 19 event types:

**Task events:** `task_created`, `task_updated`, `task_status_changed`, `task_assigned`, `task_reassigned`, `task_priority_changed`, `task_deadline_set`, `task_deleted`

**Comment events:** `comment_added`, `comment_deleted`

**Member events:** `member_invited`, `member_removed`, `member_role_changed`

**Project events:** `project_created`, `project_updated`, `project_deleted`, `project_member_added`, `project_member_removed`

Each event has a typed payload. The frontend formats them into natural sentences via a single `getActivityAction()` helper — the backend just stores raw data.

**Scoping rules:**

- Admin sees all activity in the workspace
- PM and Developer see workspace-level events plus activity from projects they're on
- Viewer sees nothing (feed is hidden and the API returns 403)

Cursor-based pagination via `?limit=20&before=ISODate`. The frontend keeps a "Load more" button that fetches older items using the oldest loaded item's `createdAt` as the cursor.

---

## What Makes This Different From Typical MERN Projects

Most full-stack tutorials end at "CRUD with JWT." Here's what this project does beyond that:

**1. Authorization is a middleware chain, not scattered conditions.**

Every protected route runs through:
