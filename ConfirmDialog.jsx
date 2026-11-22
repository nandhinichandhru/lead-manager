import { useEffect } from 'react';
import { Loader2, TriangleAlert } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title = 'Delete lead',
  message = 'Are you sure you want to delete this lead?',
  confirmLabel = 'Confirm Delete',
  cancelLabel = 'Cancel',
  busy = false,
  error = '',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="animate-pop-in w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <TriangleAlert className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            <p id="confirm-message" className="mt-1 text-sm leading-relaxed text-slate-600">
              {message}
            </p>
            {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={busy} className="btn-ghost">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className="btn-danger">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
