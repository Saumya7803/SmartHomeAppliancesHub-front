const API_ORIGIN = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL || (API_ORIGIN ? `${API_ORIGIN}/api` : "/api");

async function request(path, { token, method = "GET", body } = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Cannot reach backend API. Verify the deployed backend URL and MySQL connection."
    );
  }

  const responseText = await response.text();

  let data = {};
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    const looksLikeProxyError =
      responseText.includes("ECONNREFUSED") ||
      responseText.includes("proxy") ||
      responseText.includes("Error occurred while trying to proxy");

    if (looksLikeProxyError) {
      throw new Error(
        "Backend API is not reachable. Verify the deployed backend URL and MySQL connection."
      );
    }

    if (response.status === 401) {
      throw new Error(
        data.message || (path === "/admin/login" ? "Invalid email or password" : "Your session has expired.")
      );
    }

    if (response.status === 403) {
      throw new Error(data.message || "You do not have permission to perform this action.");
    }

    if (response.status >= 500) {
      throw new Error(
        data.message || "Server error. Check backend logs and MySQL connection."
      );
    }

    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export const apiClient = {
  request,
  login: (payload) => request("/admin/login", { method: "POST", body: payload }),
  getMe: (token) => request("/admin/session", { token }),
};
