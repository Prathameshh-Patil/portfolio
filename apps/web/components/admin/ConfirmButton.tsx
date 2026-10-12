"use client";

import { useState } from "react";

// A two-step button for destructive actions: first click asks, second click does it.
// Used instead of window.confirm() so the confirmation is part of the page and keyboard-friendly.
export function ConfirmButton({ label, confirmLabel, onConfirm }: { label: string; confirmLabel: string; onConfirm: () => void }) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className="rounded-md px-2.5 py-1.5 text-sm text-red-700 hover:bg-red-600/10 dark:text-red-400">
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        autoFocus
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        className="rounded-md bg-red-700 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-red-800"
      >
        {confirmLabel}
      </button>
      <button type="button" onClick={() => setAsking(false)} className="rounded-md px-2.5 py-1.5 text-sm text-muted hover:text-text">
        Cancel
      </button>
    </span>
  );
}
