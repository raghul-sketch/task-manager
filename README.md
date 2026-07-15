# AvisaTech Task Management Application

A production-quality, full-stack Task Management Application built with TypeScript, React, Express, Prisma, and PostgreSQL.

## Tech Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| **Frontend** | React 19 (Vite), TypeScript, Tailwind CSS v4, React Router, Zod |
| **Backend**  | Node.js, Express 4, TypeScript, Zod              |
| **Database** | PostgreSQL 16, Prisma ORM                        |
| **API Docs** | Swagger/OpenAPI 3.0 (swagger-jsdoc + swagger-ui-express) |
| **Styling**  | Tailwind CSS v4 with custom design tokens (Stitch design system) |

## Project Structure

```
task-manager/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema with Task model
│   │   ├── seed.ts            # Sample data (6 realistic tasks)
│   │   └── migrations/        # Generated migration SQL files
│   ├── src/
│   │   ├── routes/            # Express route definitions + OpenAPI annotations
│   │   ├── controllers/       # HTTP request/response handling
│   │   ├── services/          # Business logic + Prisma queries
│   │   ├── middleware/        # Error handler, async wrapper, validation
│   │   ├── validators/        # Zod schemas for request validation
│   │   ├── swagger/           # OpenAPI specification configuration
│   │   ├── types/             # Shared TypeScript interfaces
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route-level page components
│   │   ├── api/               # Centralized API client
│   │   ├── types/             # TypeScript interfaces
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   ├── App.tsx            # Root component with routing
│   │   └── main.tsx           # Application entry point
│   ├── package.json
│   └── tsconfig.app.json
├── docs/                      # Project documentation
├── docker-compose.yml         # PostgreSQL local dev container
└── README.md
```

## Local Setup

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 16+ (or Docker for the provided docker-compose)

### 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd task-manager

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

**Option A: Docker (recommended)**

```bash
# From the task-manager root
docker-compose up -d
```

**Option B: Local PostgreSQL**

Create a database named `taskmanager` and update the connection string accordingly.

### 3. Environment Configuration

```bash
# In the backend directory
cp .env.example .env
# Edit .env if your database credentials differ from defaults
```

### 4. Run Migrations & Seed

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 5. Start Development Servers

```bash
# Terminal 1: Backend (port 3001)
cd backend
npm run dev

# Terminal 2: Frontend (port 5173)
cd frontend
npm run dev
```

### 6. Access the Application

| Resource        | URL                                    |
|-----------------|----------------------------------------|
| **Frontend**    | http://localhost:5173                   |
| **Backend API** | http://localhost:3001/api/tasks         |
| **Swagger Docs**| http://localhost:3001/api-docs          |
| **Health Check**| http://localhost:3001/health            |

## Testing

The backend is fully tested using **Vitest** and **Supertest**. The test suite includes unit tests for the service layer (with a mocked database) and integration tests for the API routes.

```bash
cd backend
npm test
```

## API Endpoints

| Method | Endpoint          | Description                                          |
|--------|-------------------|------------------------------------------------------|
| GET    | `/api/tasks`      | List tasks (filter: `status`, `priority`; sort: `sortBy`, `order`) |
| GET    | `/api/tasks/:id`  | Get a single task by UUID                            |
| POST   | `/api/tasks`      | Create a new task                                    |
| PUT    | `/api/tasks/:id`  | Update a task (partial updates supported)            |
| DELETE | `/api/tasks/:id`  | Delete a task                                        |

See the [API Reference](docs/API_REFERENCE.md) for detailed request/response examples, or visit the interactive Swagger docs at `/api-docs`.

## Assumptions & Design Decisions

1. **Zod for validation** — Chosen over Joi/class-validator for first-class TypeScript inference and composable schema definitions (e.g., `updateSchema = createSchema.partial()`).

2. **Service-layer separation** — Controllers handle HTTP; services handle data. This makes services independently testable and reusable across different transports.

3. **UUID primary keys** — Prevents sequential ID enumeration and is safe for use in URLs.

4. **Indexes on `status` and `dueDate`** — These are the primary filter/sort dimensions per the API spec. Without these indexes, every filtered query would full-table-scan.

5. **No shared package for types** — The frontend and backend duplicate type definitions. In a production monorepo, these would live in a shared `@taskmanager/types` package, but the configuration overhead isn't justified for this assignment scope.

6. **Tailwind CSS v4** — Used over MUI for faster development with utility classes while maintaining the custom Stitch design system tokens.

7. **No authentication** — Per spec, the app is tightly scoped to task CRUD. Auth would be the natural next feature.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — Request lifecycle and system design
- [API Reference](docs/API_REFERENCE.md) — Detailed endpoint documentation
- [Database Schema](docs/DATABASE_SCHEMA.md) — Entity model and indexing
- [Setup Guide](docs/SETUP_GUIDE.md) — Step-by-step setup instructions
- [Design Decisions](docs/DESIGN_DECISIONS.md) — Technical rationale
