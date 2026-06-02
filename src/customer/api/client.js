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
    if (response.status === 401) {
      throw new Error(data.message || "Invalid email or password");
    }

    if (response.status === 403) {
      throw new Error(data.message || "You do not have permission to perform this action.");
    }

    if (response.status === 409) {
      throw new Error(data.message || "Account already exists.");
    }

    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export const customerApiClient = {
  request,
  signup: (payload) => request("/customer-auth/signup", { method: "POST", body: payload }),
  signin: (payload) => request("/customer-auth/signin", { method: "POST", body: payload }),
  getSession: (token) => request("/customer-auth/me", { token }),
  getAccount: (token) => request("/customer/account", { token }),
  getOrders: (token) => request("/customer/orders", { token }),
  getQuotes: (token) => request("/customer/quotes", { token }),
  getSavedProducts: (token) => request("/customer/saved-products", { token }),
  updateProfile: (token, payload) => request("/customer/profile", { token, method: "PUT", body: payload }),
  saveProduct: (token, productId) =>
    request(`/customer/saved-products/${productId}`, { token, method: "POST" }),
  removeSavedProduct: (token, productId) =>
    request(`/customer/saved-products/${productId}`, { token, method: "DELETE" }),
};
