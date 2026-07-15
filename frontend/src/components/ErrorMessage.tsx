/**
 * ErrorMessage Component
 *
 * Displays an error message with a retry button.
 * Used as a fallback when API calls fail.
 *
 * @param message - The error message to display.
 * @param onRetry - Optional callback to retry the failed operation.
 */

import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="p-3 bg-error/10 rounded-full">
        <AlertCircle className="w-8 h-8 text-error" />
      </div>
      <p className="text-sm text-on-surface-variant">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold tracking-wider rounded-lg hover:opacity-90 transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
