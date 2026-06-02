import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import { AdminAuthContext } from "./AdminAuthContextStore";
import { canAccessAdminWorkspace, isAdminUser, normalizeUserRole } from "../utils/roles";

const STORAGE_KEY = "smarthome_admin_auth_v1";
const TOKEN_STORAGE_KEY = "token";
const LEGACY_STORAGE_KEYS = ["smarthome_admin_session"];

function normalizeAuthUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    role: normalizeUserRole(user.role),
  };
}

function readStoredAuth() {
  if (typeof window === "undefined") {
    return { token: "", user: null };
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return { token: "", user: null };
    }

    const parsedValue = JSON.parse(rawValue);
    return {
      token: parsedValue.token || window.localStorage.getItem(TOKEN_STORAGE_KEY) || "",
      user: normalizeAuthUser(parsedValue.user),
    };
  } catch {
    return { token: window.localStorage.getItem(TOKEN_STORAGE_KEY) || "", user: null };
  }
}

function persistAuthState(nextState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  window.localStorage.setItem(TOKEN_STORAGE_KEY, nextState.token || "");
}

function clearPersistedAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  LEGACY_STORAGE_KEYS.forEach((storageKey) => window.localStorage.removeItem(storageKey));
}

export function AdminAuthProvider({ children }) {
  const [authState, setAuthState] = useState(readStoredAuth);
  const [isLoading, setIsLoading] = useState(() => Boolean(readStoredAuth().token));

  useEffect(() => {
    let ignore = false;

    async function hydrateSession() {
      if (!authState.token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.getMe(authState.token);
        if (ignore) {
          return;
        }

        const nextState = {
          token: authState.token,
          user: normalizeAuthUser(response.user),
        };

        setAuthState(nextState);
        persistAuthState(nextState);
      } catch {
        if (ignore) {
          return;
        }

        const clearedState = { token: "", user: null };
        setAuthState(clearedState);
        clearPersistedAuth();
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    hydrateSession();

    return () => {
      ignore = true;
    };
  }, [authState.token]);

  const login = async (credentials) => {
    const response = await apiClient.login(credentials);

    const nextState = {
      token: response.token,
      user: normalizeAuthUser(response.user),
    };

    setAuthState(nextState);
    setIsLoading(false);
    persistAuthState(nextState);

    return nextState.user;
  };

  const logout = () => {
    const clearedState = { token: "", user: null };
    setAuthState(clearedState);
    setIsLoading(false);
    clearPersistedAuth();
  };

  const value = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      isAuthenticated: Boolean(authState.token && authState.user),
      isAdmin: isAdminUser(authState.user),
      canAccessAdminWorkspace: canAccessAdminWorkspace(authState.user),
      isLoading,
      login,
      logout,
    }),
    [authState.token, authState.user, isLoading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
