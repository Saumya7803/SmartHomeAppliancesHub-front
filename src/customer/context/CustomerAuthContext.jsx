import { useCallback, useEffect, useMemo, useState } from "react";
import { customerApiClient } from "../api/client";
import { CustomerAuthContext } from "./CustomerAuthContextStore";

const STORAGE_KEY = "smarthome_customer_auth_v1";

function readStoredState() {
  if (typeof window === "undefined") {
    return { token: "", customer: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { token: "", customer: null };
    }

    const parsed = JSON.parse(raw);
    return {
      token: parsed.token || "",
      customer: parsed.customer || null,
    };
  } catch {
    return { token: "", customer: null };
  }
}

function persistState(state, rememberMe) {
  if (typeof window === "undefined") {
    return;
  }

  if (!rememberMe) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function CustomerAuthProvider({ children }) {
  const [authState, setAuthState] = useState(readStoredState);
  const [rememberMe, setRememberMe] = useState(() => Boolean(readStoredState().token));
  const [isLoading, setIsLoading] = useState(() => Boolean(readStoredState().token));

  useEffect(() => {
    let ignore = false;

    async function hydrateCustomer() {
      if (!authState.token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await customerApiClient.getSession(authState.token);
        if (ignore) {
          return;
        }

        const nextState = {
          token: authState.token,
          customer: response.customer || null,
        };

        setAuthState(nextState);
        persistState(nextState, rememberMe);
      } catch {
        if (ignore) {
          return;
        }

        setAuthState({ token: "", customer: null });
        clearState();
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    hydrateCustomer();

    return () => {
      ignore = true;
    };
  }, [authState.token, rememberMe]);

  const signin = async (payload) => {
    const response = await customerApiClient.signin(payload);
    const nextState = {
      token: response.token,
      customer: response.customer,
    };

    const shouldRemember = Boolean(payload.rememberMe);
    setRememberMe(shouldRemember);
    setAuthState(nextState);
    setIsLoading(false);
    persistState(nextState, shouldRemember);

    return response.customer;
  };

  const signup = async (payload) => {
    const response = await customerApiClient.signup(payload);
    const nextState = {
      token: response.token,
      customer: response.customer,
    };

    setRememberMe(true);
    setAuthState(nextState);
    setIsLoading(false);
    persistState(nextState, true);

    return response.customer;
  };

  const logout = () => {
    setAuthState({ token: "", customer: null });
    setRememberMe(false);
    setIsLoading(false);
    clearState();
  };

  const refreshCustomer = useCallback(async () => {
    if (!authState.token) {
      return null;
    }

    const response = await customerApiClient.getSession(authState.token);
    const nextState = {
      token: authState.token,
      customer: response.customer || null,
    };

    setAuthState(nextState);
    persistState(nextState, rememberMe);
    return nextState.customer;
  }, [authState.token, rememberMe]);

  const value = useMemo(
    () => ({
      token: authState.token,
      customer: authState.customer,
      isAuthenticated: Boolean(authState.token && authState.customer),
      isLoading,
      signin,
      signup,
      logout,
      refreshCustomer,
    }),
    [authState.token, authState.customer, isLoading, refreshCustomer]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}
