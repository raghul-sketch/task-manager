# Design Decisions

This document explains the key technical decisions made in the AvisaTech Task Management Application, with rationale for each choice.

## Technology Choices

### Why Zod for Validation?

**Decision:** Use Zod for both backend (Express middleware) and frontend (form validation) request validation.

**Alternatives considered:** Joi, class-validator, yup

**Rationale:**
- **First-class TypeScript inference:** Zod schemas automatically produce TypeScript types via `z.infer<>`. This eliminates the need to maintain separate type definitions and schema definitions — a single schema is the source of truth for both runtime validation and compile-time types.
- **Composability:** The update schema is derived from the create schema with a single `.partial()` call, ensuring consistency without duplication.
- **Size:** ~12kB gzipped with zero runtime dependencies, making it suitable for frontend use without bloating the bundle.
- **Error structure:** Zod errors include path information (which field failed) out of the box, mapping cleanly to our structured error response format.

### Why Prisma as the ORM?

**Decision:** Use Prisma for all database access. No raw SQL anywhere.

**Alternatives considered:** TypeORM, Knex, Drizzle

**Rationale:**
- **Schema-first approach:** The `schema.prisma` file serves as a single source of truth for the database structure, TypeScript types, and migrations.
- **Type safety:** Prisma Client generates fully typed query methods, so `findUniqueOrThrow({ where: { id } })` returns a properly typed `Task` object.
- **Migration tooling:** `prisma migrate dev` generates SQL migration files that are committed to version control, providing an auditable history of schema changes.
- **Developer experience:** Prisma Studio provides a GUI for inspecting data during development.

### Why Service-Layer Separation?

**Decision:** Separate the backend into three layers: Routes → Controllers → Services.

**Rationale:**
- **Single Responsibility:** Routes handle path matching and middleware wiring. Controllers handle HTTP (req/res). Services handle business logic and data access. Each layer has one job.
- **Testability:** Services can be unit-tested with a mocked PrismaClient, without spinning up an HTTP server. Controllers can be tested by mocking services.
- **Reusability:** If a WebSocket interface or CLI tool is added later, they can call the same service functions without duplicating database logic.

### Why Tailwind CSS v4?

**Decision:** Use Tailwind CSS v4 with custom design tokens from the Stitch design system.

**Alternatives considered:** MUI, vanilla CSS, styled-components

**Rationale:**
- **Speed of development:** Utility classes eliminate the need to name CSS classes and switch between files.
- **Design system integration:** Tailwind's `@theme` directive in v4 maps cleanly to the Stitch design tokens (colors, spacing, typography), creating a consistent visual language.
- **Bundle size:** Tailwind v4 is CSS-only with no JavaScript runtime. Only used classes are included in the production build.
- **Stitch compatibility:** The prototype HTML from Stitch already uses Tailwind classes, making translation to React components straightforward.

### Why React Router (not Next.js)?

**Decision:** Use Vite + React Router for a single-page application.

**Alternatives considered:** Next.js App Router

**Rationale:**
- **Simplicity:** The spec doesn't require server-side rendering, file-based routing, or API routes. A SPA with client-side routing is the simplest correct solution.
- **Vite performance:** Vite's dev server starts in <100ms with hot module replacement. Next.js adds significant startup and build overhead for features we don't need.
- **Spec compliance:** The assignment explicitly specifies "React (Vite), React Router."

## Design Patterns

### Centralized API Client

**Decision:** All HTTP calls go through `api/tasksApi.ts`. Components never call `fetch()` directly.

**Rationale:**
- **Single configuration point:** Base URL, headers, and error handling are defined once.
- **Type safety:** Each function has typed parameters and return values.
- **Swappability:** If we switch from fetch to axios (e.g., for request interceptors), only one file changes.

### Async Handler Utility

**Decision:** Wrap all async route handlers in an `asyncHandler` that catches rejected promises.

**Rationale:** Express 4 doesn't catch async errors automatically. Without this wrapper, every controller would need:
```typescript
try { ... } catch (err) { next(err); }
```

The wrapper eliminates this boilerplate and ensures errors always reach the centralized error handler.

### UUID Primary Keys

**Decision:** Use UUID v4 for task IDs instead of auto-incrementing integers.

**Rationale:**
- **Security:** Sequential IDs are predictable (e.g., `/tasks/1`, `/tasks/2`), enabling enumeration attacks.
- **URL safety:** UUIDs are opaque and don't leak information about the database size or insertion order.
- **Distributed systems:** UUIDs can be generated without database coordination, useful for eventual consistency patterns.

## Error Handling Strategy

### Consistent Error Shape

**Decision:** All errors conform to `{ error: string, details?: Array }`.

**Rationale:** Clients can reliably parse any failure response without checking the status code first. The `details` array is optional and only populated for validation errors (field-level feedback).

### Centralized Error Handler

**Decision:** A single Express error middleware catches all unhandled errors.

**Rationale:**
- **No stack trace leakage:** The handler maps internal errors to generic messages for the client.
- **Consistent mapping:** Prisma P2025 → 404, Zod errors → 400, everything else → 500.
- **Single logging point:** All errors are logged to stderr in one place (easy to integrate with a logging service).

## Frontend Architecture Decisions

### Custom Hooks for Data Fetching

**Decision:** `useTasks()` and `useTask()` encapsulate fetch lifecycle (loading, data, error, refetch).

**Alternatives considered:** React Query (TanStack Query), SWR

**Rationale:** For 5 endpoints and no caching requirements, React Query adds ~40kB of bundle weight for features we don't use. Simple useState/useEffect hooks are sufficient and more transparent for code review.

### Client-Side Validation (Duplicated from Backend)

**Decision:** Frontend Zod schemas duplicate backend validation rules instead of sharing.

**Rationale:** Sharing Zod schemas across a monorepo requires a build step for a shared package, TypeScript project references, and workspace configuration. For an assignment with ~5 validated fields, the duplication cost is lower than the configuration overhead. A production app at scale would justify the shared package.

### Sonner for Toasts

**Decision:** Use Sonner for success/error notifications.

**Alternatives considered:** react-hot-toast, custom implementation

**Rationale:** Sonner is lightweight (~3kB), has a clean API (`toast.success("message")`), and renders toast notifications that match the Stitch prototype's dark bottom-right style.
