# Architecture

## System Overview

The AvisaTech Task Management Application follows a **three-tier architecture**: a React single-page application (frontend), an Express REST API (backend), and a PostgreSQL database accessed via Prisma ORM.

```
┌─────────────────────────┐
│    React Frontend        │
│  (Vite dev server :5173) │
│                          │
│  Pages → Hooks → API     │
│  Client → fetch()        │
└──────────┬───────────────┘
           │ HTTP (JSON)
           │ CORS-enabled
┌──────────▼───────────────┐
│    Express Backend        │
│  (Node.js server :3001)  │
│                          │
│  Routes → Validators →   │
│  Controllers → Services  │
│  → Prisma Client         │
└──────────┬───────────────┘
           │ TCP (PostgreSQL wire protocol)
┌──────────▼───────────────┐
│    PostgreSQL Database    │
│  (Docker container :5432)│
│                          │
│  Tasks table with UUID   │
│  PK, enums, indexes      │
└──────────────────────────┘
```

## Request Lifecycle

A typical API request (e.g., `POST /api/tasks`) flows through these layers in order:

### 1. Route Layer (`src/routes/taskRoutes.ts`)

The Express router matches the HTTP method and path, then passes the request through a middleware chain. Routes are the "wiring" — they don't contain any logic, just connect paths to middleware and controllers.

```
POST /api/tasks → validate(createTaskSchema, "body") → asyncHandler(taskController.create)
```

### 2. Validation Middleware (`src/middleware/validate.ts`)

The `validate()` middleware factory accepts a Zod schema and a request property (body, query, or params). It:
- Parses the request data against the schema
- On success: replaces the request property with cleaned/coerced data, calls `next()`
- On failure: responds with `400` and structured error details

### 3. Controller Layer (`src/controllers/taskController.ts`)

Controllers are thin functions that:
1. Extract validated data from the request (body, params, query)
2. Call the appropriate service function
3. Send the HTTP response with the correct status code

Controllers never import Prisma or contain business logic.

### 4. Service Layer (`src/services/taskService.ts`)

Services encapsulate all database operations. They:
- Build Prisma queries dynamically (e.g., conditional `where` clauses for filters)
- Handle data transformations (e.g., ISO string → Date conversion for dueDate)
- Are the only layer that imports PrismaClient

### 5. Prisma Client → PostgreSQL

Prisma generates a type-safe client from `schema.prisma`. All database access goes through this client — no raw SQL anywhere. Prisma handles:
- Query building and parameterization
- Connection pooling
- Automatic `updatedAt` timestamps

### 6. Error Handling (`src/middleware/errorHandler.ts`)

Errors at any layer are caught by the centralized error handler (registered last in the middleware chain). It maps:
- Prisma P2025 ("record not found") → `404`
- Zod validation errors → `400`
- Everything else → `500` (no stack trace leakage)

The `asyncHandler` utility wraps all async controller functions so rejected promises automatically forward to this handler.

## Testing Strategy

The backend employs a two-tier testing strategy using **Vitest**:
1. **Service Unit Tests (`taskService.test.ts`)**: Tests the business logic independently. Uses `vitest-mock-extended` to deeply mock the PrismaClient, ensuring tests are blazing fast and don't require a physical database.
2. **API Integration Tests (`taskRoutes.test.ts`)**: Tests the HTTP layer (Express routes, controllers, and Zod validation) using `supertest`. Ensures endpoints correctly parse inputs, handle errors, and return expected HTTP status codes.

## Frontend Architecture

```
App (BrowserRouter)
├── Navbar (persistent)
├── Routes
│   ├── / → TaskListPage
│   │   ├── Sidebar (filter navigation)
│   │   ├── TaskCard[] (card grid)
│   │   └── Stats Row
│   ├── /tasks/new → TaskFormPage (create mode)
│   ├── /tasks/:id → TaskDetailPage
│   └── /tasks/:id/edit → TaskFormPage (edit mode)
└── Toaster (sonner notifications)
```

### Data Flow

1. **Pages** use custom hooks (`useTasks`, `useTask`) for data fetching
2. **Hooks** call typed functions from `api/tasksApi.ts`
3. **API client** makes `fetch()` calls to the backend, handles errors
4. **Components** receive data as props and render UI

Components never call `fetch()` directly. All HTTP calls are centralized in the API client for consistency and testability.

## Key Design Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| Service layer | Backend | Separates DB logic from HTTP concerns; enables unit testing |
| Validation middleware | Backend | DRY validation — schemas defined once, applied per route |
| Async handler | Backend | Eliminates try/catch boilerplate in every controller |
| Centralized API client | Frontend | Single point for base URL, headers, error handling |
| Custom hooks | Frontend | Encapsulates data fetching lifecycle (loading/error/data) |
| Design tokens (CSS variables) | Frontend | Consistent design system matching Stitch prototype |
