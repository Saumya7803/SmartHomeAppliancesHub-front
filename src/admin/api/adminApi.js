import { apiClient } from "./client";
import { normalizeUserRole, USER_ROLES } from "../utils/roles";

function getRoleBasePath(role) {
  switch (normalizeUserRole(role)) {
    case USER_ROLES.SUPER_ADMIN:
    case USER_ROLES.ADMIN:
      return "/admin";
    case USER_ROLES.DEVELOPMENT_TEAM:
      return "/dev";
    case USER_ROLES.SALES:
      return "/sales";
    default:
      return "/operator";
  }
}

export const adminApi = {
  getDashboardStats: (token) => apiClient.request("/admin/dashboard", { token }),
  getSalesDashboardStats: (token) => apiClient.request("/sales/dashboard", { token }),
  getProducts: (token, role) => apiClient.request(`${getRoleBasePath(role)}/products`, { token }),
  getInventory: (token, role) => apiClient.request(`${getRoleBasePath(role)}/inventory`, { token }),
  getCategories: (token, search = "") =>
    apiClient.request(`/categories?search=${encodeURIComponent(search)}`, { token }),
  createCategory: (token, payload) =>
    apiClient.request("/categories", { token, method: "POST", body: payload }),
  getBrands: (token, search = "") =>
    apiClient.request(`/brands?search=${encodeURIComponent(search)}`, { token }),
  createBrand: (token, payload) =>
    apiClient.request("/brands", { token, method: "POST", body: payload }),

  getOrders: (token, role, { search = "", status = "" } = {}) =>
    apiClient.request(
      `${getRoleBasePath(role)}/orders?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`,
      { token }
    ),

  updateOrderStatus: (token, role, orderId, payload) =>
    apiClient.request(`${getRoleBasePath(role)}/orders/${orderId}/status`, {
      token,
      method: "PATCH",
      body: payload,
    }),

  getCustomers: (token, role, search = "") =>
    apiClient.request(`${getRoleBasePath(role)}/customers?search=${encodeURIComponent(search)}`, {
      token,
    }),

  createProduct: (token, role, payload) =>
    apiClient.request(`${getRoleBasePath(role)}/products`, {
      token,
      method: "POST",
      body: payload,
    }),

  createOrder: (token, role, payload) =>
    apiClient.request(`${getRoleBasePath(role)}/orders`, {
      token,
      method: "POST",
      body: payload,
    }),

  createCustomer: (token, role, payload) =>
    apiClient.request(`${getRoleBasePath(role)}/customers`, {
      token,
      method: "POST",
      body: payload,
    }),

  updateCustomer: (token, role, customerId, payload) =>
    apiClient.request(`${getRoleBasePath(role)}/customers/${customerId}`, {
      token,
      method: "PATCH",
      body: payload,
    }),

  updateProduct: (token, role, productId, payload) =>
    apiClient.request(`${getRoleBasePath(role)}/products/${productId}`, {
      token,
      method: "PUT",
      body: payload,
    }),

  deleteProduct: (token, role, productId, body = {}) =>
    apiClient.request(`${getRoleBasePath(role)}/products/${productId}`, {
      token,
      method: "DELETE",
      body,
    }),

  publishProduct: (token, productId, published) =>
    apiClient.request(`/admin/products/${productId}/publish`, {
      token,
      method: "PATCH",
      body: { published },
    }),

  getPendingChanges: (token, bucket = "all") =>
    apiClient.request(`/admin/pending-changes?bucket=${encodeURIComponent(bucket)}`, { token }),
  approveChange: (token, entityType, changeId) =>
    apiClient.request(`/admin/pending-changes/${changeId}/approve`, {
      token,
      method: "POST",
      body: { entityType },
    }),
  rejectChange: (token, entityType, changeId, reason) =>
    apiClient.request(`/admin/pending-changes/${changeId}/reject`, {
      token,
      method: "POST",
      body: { entityType, reason },
    }),

  getUsers: (token, role) => apiClient.request(`${getRoleBasePath(role)}/users`, { token }),
  createUser: (token, payload) =>
    apiClient.request("/admin/users", { token, method: "POST", body: payload }),
  updateUser: (token, userId, payload) =>
    apiClient.request(`/admin/users/${userId}`, {
      token,
      method: "PATCH",
      body: payload,
    }),
  updateUserRole: (token, userId, role) =>
    apiClient.request(`/admin/users/${userId}/role`, {
      token,
      method: "PATCH",
      body: { role },
    }),
  updateUserStatus: (token, userId, status) =>
    apiClient.request(`/admin/users/${userId}/status`, {
      token,
      method: "PATCH",
      body: { status },
    }),
  resetUserPassword: (token, userId, password) =>
    apiClient.request(`/admin/users/${userId}/reset-password`, {
      token,
      method: "POST",
      body: { password },
    }),
  deleteUser: (token, userId) =>
    apiClient.request(`/admin/users/${userId}`, { token, method: "DELETE" }),

  getLogs: (token) => apiClient.request("/admin/logs", { token }),
  getSystemLogs: (token, role) =>
    apiClient.request(
      normalizeUserRole(role) === USER_ROLES.DEVELOPMENT_TEAM ? "/dev/system-logs" : "/admin/system-logs",
      { token }
    ),
  getApiRequests: (token) => apiClient.request("/dev/api-requests", { token }),
  getBuildLogs: (token) => apiClient.request("/dev/build-logs", { token }),
  clearCache: (token) => apiClient.request("/dev/cache/clear", { token, method: "POST" }),
  getFeatureFlags: (token) => apiClient.request("/dev/feature-flags", { token }),
  updateFeatureFlag: (token, flagKey, enabled) =>
    apiClient.request(`/dev/feature-flags/${flagKey}`, {
      token,
      method: "PATCH",
      body: { enabled },
    }),
  getDatabaseTables: (token) => apiClient.request("/dev/database/tables", { token }),
  getDatabaseTableRows: (token, tableName, limit = 25) =>
    apiClient.request(`/dev/database/tables/${encodeURIComponent(tableName)}?limit=${limit}`, { token }),
  runReadOnlyQuery: (token, sql) =>
    apiClient.request("/dev/database/query", { token, method: "POST", body: { sql } }),
  getSettings: (token) => apiClient.request("/admin/payment-settings", { token }),
  updateSettings: (token, payload) =>
    apiClient.request("/admin/payment-settings", { token, method: "PATCH", body: payload }),
  getRoleManagement: (token) => apiClient.request("/admin/role-management", { token }),
  getApiKeys: (token) => apiClient.request("/admin/api-keys", { token }),
  createApiKey: (token, payload) =>
    apiClient.request("/admin/api-keys", { token, method: "POST", body: payload }),
  revokeApiKey: (token, keyId) =>
    apiClient.request(`/admin/api-keys/${keyId}`, { token, method: "DELETE" }),
  getInvoices: (token, role, { search = "", status = "" } = {}) =>
    apiClient.request(
      `${getRoleBasePath(role)}/invoices?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`,
      { token }
    ),
  createInvoice: (token, role, payload) =>
    apiClient.request(`${getRoleBasePath(role)}/invoices`, {
      token,
      method: "POST",
      body: payload,
    }),
  getEnquiries: (
    token,
    { search = "", status = "", page = 1, pageSize = 10, mine = false } = {}
  ) =>
    apiClient.request(
      `/sales/enquiries?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&page=${page}&page_size=${pageSize}&mine=${mine ? "1" : "0"}`,
      { token }
    ),
  getEnquiryById: (token, enquiryId) => apiClient.request(`/sales/enquiries/${enquiryId}`, { token }),
  createEnquiry: (token, payload) =>
    apiClient.request("/sales/enquiries", { token, method: "POST", body: payload }),
  updateEnquiryStatus: (token, enquiryId, status) =>
    apiClient.request(`/sales/enquiries/${enquiryId}/status`, {
      token,
      method: "PATCH",
      body: { status },
    }),
  assignEnquiry: (token, enquiryId, assignedTo) =>
    apiClient.request(`/sales/enquiries/${enquiryId}/assign`, {
      token,
      method: "PATCH",
      body: { assigned_to: assignedTo || null },
    }),
  createQuotationFromEnquiry: (token, enquiryId, payload) =>
    apiClient.request(`/sales/enquiries/${enquiryId}/quotations`, {
      token,
      method: "POST",
      body: payload,
    }),
  getQuotations: (
    token,
    { search = "", status = "", page = 1, pageSize = 10 } = {}
  ) =>
    apiClient.request(
      `/sales/quotations?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&page=${page}&page_size=${pageSize}`,
      { token }
    ),
  getQuotationById: (token, quotationId, { includePdf = false } = {}) =>
    apiClient.request(`/sales/quotations/${quotationId}?include_pdf=${includePdf ? "1" : "0"}`, { token }),
  approveQuotation: (token, quotationId) =>
    apiClient.request(`/sales/quotations/${quotationId}/approve`, {
      token,
      method: "POST",
    }),
  sendQuotation: (token, quotationId, payload = {}) =>
    apiClient.request(`/sales/quotations/${quotationId}/send`, {
      token,
      method: "POST",
      body: payload,
    }),
  getAssignedCustomers: (token) => apiClient.request("/sales/assigned-customers", { token }),
  getTechnicalHealth: (token) => apiClient.request("/dev/health", { token }),
  getOperatorSubmissions: (token) => apiClient.request("/operator/submissions", { token }),
};
