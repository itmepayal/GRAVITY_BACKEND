# Task Management API

## 🚀 Core Task APIs (MVP)

### Task CRUD

| Method | Endpoint                 | Description              | Permission     |
| ------ | ------------------------ | ------------------------ | -------------- |
| POST   | `/tasks`                 | Create Task              | `task:create`  |
| GET    | `/boards/:boardId/tasks` | Get All Tasks of Board   | `task:view`    |
| GET    | `/tasks/:taskId`         | Get Single Task          | `task:view`    |
| PATCH  | `/tasks/:taskId`         | Update Task              | `task:update`  |
| DELETE | `/tasks/:taskId`         | Delete Task              | `task:delete`  |
| PATCH  | `/tasks/:taskId/archive` | Archive / Unarchive Task | `task:archive` |

---

## 📌 Task Workflow

| Method | Endpoint                  | Description                               | Permission    |
| ------ | ------------------------- | ----------------------------------------- | ------------- |
| PATCH  | `/tasks/:taskId/move`     | Move Task Between Columns / Change Status | `task:update` |
| PATCH  | `/tasks/:taskId/assignee` | Assign / Unassign User                    | `task:assign` |

---

## ✅ Subtasks

| Method | Endpoint                             | Description    |
| ------ | ------------------------------------ | -------------- |
| POST   | `/tasks/:taskId/subtasks`            | Add Subtask    |
| PATCH  | `/tasks/:taskId/subtasks/:subtaskId` | Update Subtask |
| DELETE | `/tasks/:taskId/subtasks/:subtaskId` | Delete Subtask |

---

## 💬 Comments

| Method | Endpoint                             | Description    |
| ------ | ------------------------------------ | -------------- |
| POST   | `/tasks/:taskId/comments`            | Add Comment    |
| PATCH  | `/tasks/:taskId/comments/:commentId` | Edit Comment   |
| DELETE | `/tasks/:taskId/comments/:commentId` | Delete Comment |

---

# ⭐ Optional APIs

## 👀 Watchers

| Method | Endpoint                          | Description    |
| ------ | --------------------------------- | -------------- |
| POST   | `/tasks/:taskId/watchers`         | Add Watcher    |
| DELETE | `/tasks/:taskId/watchers/:userId` | Remove Watcher |

---

## 📎 Attachments

| Method | Endpoint                                   | Description       |
| ------ | ------------------------------------------ | ----------------- |
| POST   | `/tasks/:taskId/attachments`               | Upload Attachment |
| DELETE | `/tasks/:taskId/attachments/:attachmentId` | Remove Attachment |

---

## 📊 Project APIs

| Method | Endpoint                     | Description                              |
| ------ | ---------------------------- | ---------------------------------------- |
| GET    | `/projects/:projectId/tasks` | Get All Project Tasks (Supports Filters) |

### Supported Query Parameters

- `status`
- `priority`
- `assignee`
- `isArchived`

Example:

```http
GET /projects/:projectId/tasks?status=todo&priority=high
```

---

## 🏃 Sprint APIs

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| GET    | `/sprints/:sprintId/tasks` | Get Tasks by Sprint |

---

## ⏱️ Time Tracking

| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| PATCH  | `/tasks/:taskId/hours` | Update Actual Hours |

Example Request

```json
{
  "actualHours": 12
}
```

---

# 📌 API Priority

## ✅ Phase 1 (Must Have)

- Task CRUD
- Archive / Unarchive Task
- Move Task
- Assign / Unassign User

**Total:** 8 APIs

---

## ✅ Phase 2 (Very Important)

- Subtasks CRUD
- Comments CRUD

**Total:** 6 APIs

---

## ✅ Phase 3 (Good to Have)

- Watchers
- Attachments

**Total:** 4 APIs

---

## ✅ Phase 4 (Advanced)

- Project Tasks with Filters
- Sprint Tasks
- Time Tracking

**Total:** 3 APIs

---

# 📈 Summary

| Module         |   APIs |
| -------------- | -----: |
| Core Task CRUD |      6 |
| Workflow       |      2 |
| Subtasks       |      3 |
| Comments       |      3 |
| Watchers       |      2 |
| Attachments    |      2 |
| Project Tasks  |      1 |
| Sprint Tasks   |      1 |
| Time Tracking  |      1 |
| **Total APIs** | **21** |
