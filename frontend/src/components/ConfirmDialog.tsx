/**
 * ConfirmDialog Component
 *
 * A modal confirmation dialog used before destructive actions (e.g., delete).
 * Renders as a centered overlay with backdrop blur.
 *
 * @param open - Whether the dialog is visible.
 * @param title - Dialog heading text.
 * @param description - Explanatory text shown below the title.
 * @param onConfirm - Callback when the user confirms the action.
 * @param onCancel - Callback when the user cancels / closes the dialog.
 * @param confirmLabel - Text for the confirm button (default: "Delete").
 * @param loading - Whether the confirm action is in progress.
 */

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-semibold text-primary mb-2">{title}</h2>
        <p className="text-sm text-on-surface-variant mb-6">{description}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg text-secondary text-xs font-semibold tracking-wider border border-outline-variant hover:bg-surface-container-high transition-all"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-error text-on-error text-xs font-semibold tracking-wider hover:opacity-90 transition-all disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
