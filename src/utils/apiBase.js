const API_ORIGIN = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API_BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api` : "/api";

export function buildApiUrl(path) {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
