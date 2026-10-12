// Where the admin JWT lives in the browser. sessionStorage survives a page refresh but is cleared when
// the tab closes, and is never sent automatically with requests (unlike a cookie), so there is no CSRF risk.
// If storage is blocked, the token is kept in memory for this page only.

const KEY = "admin-token";
const EVENT = "admin-token-change";
let memoryToken: string | null = null;

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return memoryToken;
  }
}

export function setToken(token: string | null) {
  memoryToken = token;
  try {
    if (token) sessionStorage.setItem(KEY, token);
    else sessionStorage.removeItem(KEY);
  } catch {
    // storage blocked: memoryToken is enough
  }
  window.dispatchEvent(new Event(EVENT)); // lets useAdminToken() re-render
}

// For useSyncExternalStore: re-read the token whenever it changes.
export function subscribeToken(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}
