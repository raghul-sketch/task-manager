/**
 * Application Entry Point
 *
 * Renders the React app into the DOM root element.
 * Imports the global CSS (Tailwind + design tokens) before the App component.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
