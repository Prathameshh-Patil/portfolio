"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ApiError } from "@/lib/api-client";
import { getToken, subscribeToken } from "@/features/admin/token";

// The current admin token. `undefined` during server rendering and hydration (storage isn't readable
// there yet), then the real value. useSyncExternalStore keeps React in sync with sessionStorage.
export function useAdminToken() {
  return useSyncExternalStore(subscribeToken, getToken, () => undefined);
}

export function errorMessage(err: unknown) {
  if (err instanceof ApiError) return err.message;
  return "Couldn't reach the API. Check that it is running.";
}

// Loads data for an admin screen. `load` must be stable (wrap it in useCallback); call `reload()` after a change.
export function useAdminData<T>(load: () => Promise<T>) {
  const [state, setState] = useState<{ data?: T; error?: string }>({});
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false; // ignore a slow response that arrives after a newer request
    load()
      .then((data) => !cancelled && setState({ data }))
      .catch((err) => !cancelled && setState({ error: errorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [load, version]);

  return { ...state, reload: () => setVersion((v) => v + 1) };
}
