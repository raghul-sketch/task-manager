/**
 * App Root Component
 *
 * Sets up React Router with the following routes:
 * - / → TaskListPage (main dashboard with sidebar + card grid)
 * - /tasks/new → TaskFormPage (create mode)
 * - /tasks/:id → TaskDetailPage (full detail view)
 * - /tasks/:id/edit → TaskFormPage (edit mode)
 *
 * The Navbar is rendered outside the router outlet so it persists across
 * all routes. The Sonner Toaster provides toast notifications app-wide.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar } from "./components/Navbar";
import { TaskListPage } from "./pages/TaskListPage";
import { TaskDetailPage } from "./pages/TaskDetailPage";
import { TaskFormPage } from "./pages/TaskFormPage";

function App() {
  return (
    <BrowserRouter>
      {/* Persistent top navigation */}
      <Navbar />

      {/* Route-based content */}
      <Routes>
        <Route path="/" element={<TaskListPage />} />
        <Route path="/tasks/new" element={<TaskFormPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
      </Routes>

      {/* Global toast notifications (positioned bottom-right per Stitch prototype) */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#303032",
            color: "#f3f0f2",
            border: "none",
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
