# Setup Guide

Step-by-step instructions for setting up the AvisaTech Task Management Application on a new development machine.

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool        | Version | Check Command         | Purpose                |
|-------------|---------|----------------------|------------------------|
| **Node.js** | 18+     | `node --version`     | JavaScript runtime     |
| **npm**     | 9+      | `npm --version`      | Package manager        |
| **Docker**  | 20+     | `docker --version`   | PostgreSQL container   |

> **Note:** Docker is only required if you don't have a local PostgreSQL installation. If you have PostgreSQL 16+ running locally, you can skip Docker.

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd task-manager
```

## Step 2: Start the Database

### Option A: Docker (Recommended)

```bash
# From the task-manager root directory
docker-compose up -d

# Verify the container is running
docker ps
# Should show: taskmanager-db (postgres:16-alpine) on port 5432
```

### Option B: Local PostgreSQL

```bash
# Connect to your PostgreSQL instance and create the database
psql -U postgres
CREATE DATABASE taskmanager;
\q
```

## Step 3: Configure the Backend

```bash
cd backend

# Copy the environment template
cp .env.example .env

# Edit .env if your database credentials differ
# Default: postgresql://postgres:postgres@localhost:5432/taskmanager?schema=public
```

## Step 4: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

## Step 5: Run Database Migrations

```bash
cd backend

# Apply migrations (creates the Task table and enums)
npx prisma migrate dev --name init

# Seed the database with sample tasks
npx prisma db seed
```

You should see:
```
✅ Seeded 6 tasks successfully.
```

## Step 6: Start Development Servers

You'll need two terminal windows:

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:3001
📚 Swagger docs at http://localhost:3001/api-docs
❤️  Health check at http://localhost:3001/health
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v6.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
```

## Step 7: Verify Everything Works

1. **Frontend**: Open http://localhost:5173 — you should see the task list with 6 seeded tasks.
2. **Backend API**: Open http://localhost:3001/api/tasks — you should see a JSON array of tasks.
3. **Swagger Docs**: Open http://localhost:3001/api-docs — interactive API documentation.
4. **Health Check**: Open http://localhost:3001/health — should return `{"status":"ok"}`.

## Available Scripts

### Backend (`cd backend`)

| Script           | Command              | Description                        |
|------------------|---------------------|------------------------------------|
| `npm run dev`    | `tsx watch src/server.ts` | Start dev server with hot reload  |
| `npm run build`  | `tsc`               | Compile TypeScript to JavaScript   |
| `npm start`      | `node dist/server.js` | Run the production build          |
| `npm run db:migrate` | `npx prisma migrate dev` | Run database migrations      |
| `npm run db:seed` | `npx prisma db seed` | Seed the database                 |
| `npm run db:studio` | `npx prisma studio` | Open Prisma Studio (DB browser)  |

### Frontend (`cd frontend`)

| Script           | Command              | Description                        |
|------------------|---------------------|------------------------------------|
| `npm run dev`    | `vite`              | Start Vite dev server              |
| `npm run build`  | `tsc && vite build` | Build for production               |
| `npm run preview`| `vite preview`      | Preview the production build       |

## Troubleshooting

### "Can't reach database server"

- Check that PostgreSQL is running: `docker ps` or `pg_isready`
- Verify the `DATABASE_URL` in `.env` matches your database credentials

### "Port 3001 already in use"

- Change the `PORT` in `.env` to a different value (e.g., 3002)

### "CORS error in browser"

- Ensure `FRONTEND_ORIGIN` in `.env` matches the Vite dev server URL (default: `http://localhost:5173`)

### "Prisma: schema drift detected"

- Run `npx prisma migrate dev` to re-sync the schema with the database
