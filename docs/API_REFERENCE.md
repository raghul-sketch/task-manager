# API Reference

Base URL: `http://localhost:3001`

Interactive Swagger UI: `http://localhost:3001/api-docs`

All endpoints return JSON. Error responses follow a consistent shape:

```json
{
  "error": "Human-readable error message",
  "details": [
    { "field": "title", "message": "Title is required" }
  ]
}
```

---

## GET /api/tasks

List all tasks with optional filtering and sorting.

### Query Parameters

| Parameter  | Type   | Values                          | Default     | Description          |
|------------|--------|---------------------------------|-------------|----------------------|
| `status`   | string | `TODO`, `IN_PROGRESS`, `DONE`   | (none)      | Filter by status     |
| `priority` | string | `LOW`, `MEDIUM`, `HIGH`         | (none)      | Filter by priority   |
| `sortBy`   | string | `createdAt`, `dueDate`          | `createdAt` | Column to sort by    |
| `order`    | string | `asc`, `desc`                   | `desc`      | Sort direction       |

### Example Request

```bash
GET /api/tasks?status=TODO&sortBy=dueDate&order=asc
```

### Example Response (200 OK)

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Setup Database Schema",
    "description": "Define the PostgreSQL relations...",
    "status": "TODO",
    "priority": "MEDIUM",
    "dueDate": "2025-10-15T17:00:00.000Z",
    "createdAt": "2025-10-01T09:00:00.000Z",
    "updatedAt": "2025-10-01T09:00:00.000Z"
  }
]
```

---

## GET /api/tasks/:id

Retrieve a single task by its UUID.

### Path Parameters

| Parameter | Type | Description    |
|-----------|------|----------------|
| `id`      | UUID | Task identifier |

### Example Request

```bash
GET /api/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Responses

| Status | Description   |
|--------|---------------|
| 200    | Task found    |
| 400    | Invalid UUID format |
| 404    | Task not found |

---

## POST /api/tasks

Create a new task.

### Request Body

```json
{
  "title": "Implement OAuth2 flow",
  "description": "Add refresh token rotation and PKCE support.",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-11-01T00:00:00.000Z"
}
```

### Field Constraints

| Field         | Required | Type   | Constraints                   |
|---------------|----------|--------|-------------------------------|
| `title`       | Yes      | string | 1–200 characters              |
| `description` | No       | string | Max 2000 characters           |
| `status`      | No       | enum   | `TODO` (default), `IN_PROGRESS`, `DONE` |
| `priority`    | No       | enum   | `LOW`, `MEDIUM` (default), `HIGH` |
| `dueDate`     | No       | string | ISO 8601 datetime, nullable   |

### Responses

| Status | Description        |
|--------|--------------------|
| 201    | Task created       |
| 400    | Validation error   |

### Example Response (201 Created)

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "title": "Implement OAuth2 flow",
  "description": "Add refresh token rotation and PKCE support.",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-11-01T00:00:00.000Z",
  "createdAt": "2025-10-10T14:30:00.000Z",
  "updatedAt": "2025-10-10T14:30:00.000Z"
}
```

---

## PUT /api/tasks/:id

Update an existing task. Supports partial updates — only include the fields you want to change.

### Path Parameters

| Parameter | Type | Description    |
|-----------|------|----------------|
| `id`      | UUID | Task identifier |

### Request Body (partial)

```json
{
  "status": "IN_PROGRESS",
  "priority": "HIGH"
}
```

Send `null` for `dueDate` or `description` to explicitly clear those fields:

```json
{
  "dueDate": null
}
```

### Responses

| Status | Description      |
|--------|------------------|
| 200    | Task updated     |
| 400    | Validation error |
| 404    | Task not found   |

---

## DELETE /api/tasks/:id

Permanently delete a task.

### Path Parameters

| Parameter | Type | Description    |
|-----------|------|----------------|
| `id`      | UUID | Task identifier |

### Responses

| Status | Description       |
|--------|-------------------|
| 204    | Deleted (no body) |
| 404    | Task not found    |

### Example Request

```bash
DELETE /api/tasks/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## Error Response Format

All errors use this consistent structure:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title cannot be empty"
    },
    {
      "field": "priority",
      "message": "Invalid enum value. Expected 'LOW' | 'MEDIUM' | 'HIGH'"
    }
  ]
}
```

| Status Code | Meaning               | When                                    |
|-------------|----------------------|-----------------------------------------|
| 400         | Bad Request          | Invalid input, malformed JSON, bad UUIDs |
| 404         | Not Found            | Task with given ID doesn't exist        |
| 500         | Internal Server Error| Unexpected server failure               |
