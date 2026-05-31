const BRAND_API_BASE_URL = (import.meta.env.VITE_API_URL || "") + "/api/brands";

async function request(path = "", { method = "GET", body } = {}) {
  const response = await fetch(`${BRAND_API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

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
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export const brandApi = {
  listBrands: async (search = "") => {
    const query = String(search || "").trim();
    const path = query ? `?search=${encodeURIComponent(query)}` : "";
    return request(path);
  },
  createBrand: (payload) => request("", { method: "POST", body: payload }),
  updateBrand: (brandId, payload) => request(`/${brandId}`, { method: "PUT", body: payload }),
  deleteBrand: (brandId) => request(`/${brandId}`, { method: "DELETE" }),
};
