/**
 * Navbar Component
 *
 * Top navigation bar matching the Stitch prototype. Features:
 * - AvisaTech brand text (left)
 * - "New Task" button with plus icon (right)
 *
 * Stays fixed at the top of the viewport.
 *
 * @param onNewTask - Callback when the "New Task" button is clicked.
 */

import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 py-2 w-full h-16">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-4xl font-bold text-primary tracking-tighter leading-none">
            AvisaTech
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link
              to="/"
              className="text-primary font-bold border-b-2 border-primary pb-1"
            >
              Tasks
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/tasks/new"
            className="bg-primary-container text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wider hover:bg-primary transition-colors flex items-center gap-1 active:opacity-80"
          >
            <Plus className="w-4 h-4" />
            New Task
          </Link>
        </div>
      </div>
    </header>
  );
}
