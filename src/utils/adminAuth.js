const AUTH_STORAGE_KEY = "smarthome_admin_session";
const NEXT_AUTH_STORAGE_KEY = "smarthome_admin_auth_v1";
const TOKEN_STORAGE_KEY = "token";

export function getAdminSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue =
      window.localStorage.getItem(NEXT_AUTH_STORAGE_KEY) || window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    return token ? { token, user: null } : null;
  }
}

export function setAdminSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.localStorage.setItem(NEXT_AUTH_STORAGE_KEY, JSON.stringify(session));
  if (session?.token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
  }
}

export function clearAdminSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(NEXT_AUTH_STORAGE_KEY);
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}
