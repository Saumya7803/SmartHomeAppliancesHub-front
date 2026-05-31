export const USER_ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  DEVELOPMENT_TEAM: "development_team",
  OPERATOR: "operator",
  SALES: "sales",
});

export const ADMIN_PANEL_ROLES = Object.freeze([
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.DEVELOPMENT_TEAM,
  USER_ROLES.SALES,
]);

export const BUSINESS_ADMIN_ROLES = Object.freeze([
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
]);

export const DEV_TOOL_ROLES = Object.freeze([
  USER_ROLES.DEVELOPMENT_TEAM,
]);

export const SYSTEM_LOG_ROLES = Object.freeze([
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.DEVELOPMENT_TEAM,
]);

export const ORDER_MANAGEMENT_ROLES = Object.freeze([
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.SALES,
]);

export const CUSTOMER_MANAGEMENT_ROLES = ORDER_MANAGEMENT_ROLES;

export const SALES_TEAM_ROLES = Object.freeze([
  USER_ROLES.SALES,
]);

const LEGACY_ROLE_MAP = Object.freeze({
  super_admin: USER_ROLES.SUPER_ADMIN,
  admin: USER_ROLES.ADMIN,
  development_team: USER_ROLES.DEVELOPMENT_TEAM,
  development_admin: USER_ROLES.DEVELOPMENT_TEAM,
  operator: USER_ROLES.OPERATOR,
  sales: USER_ROLES.SALES,
  sales_team: USER_ROLES.SALES,
  user: USER_ROLES.OPERATOR,
});

export function normalizeUserRole(role) {
  const normalizedRole = String(role || "").trim().toLowerCase();
  return LEGACY_ROLE_MAP[normalizedRole] || USER_ROLES.OPERATOR;
}

export function isSuperAdminUser(user) {
  return normalizeUserRole(user?.role) === USER_ROLES.SUPER_ADMIN;
}

export function isAdminUser(user) {
  return BUSINESS_ADMIN_ROLES.includes(normalizeUserRole(user?.role));
}

export function isDevelopmentTeamUser(user) {
  return normalizeUserRole(user?.role) === USER_ROLES.DEVELOPMENT_TEAM;
}

export function isOperatorUser(user) {
  return normalizeUserRole(user?.role) === USER_ROLES.OPERATOR;
}

export function isSalesUser(user) {
  return normalizeUserRole(user?.role) === USER_ROLES.SALES;
}

export function canAccessAdminWorkspace(user) {
  return ADMIN_PANEL_ROLES.includes(normalizeUserRole(user?.role));
}

export function canManageApprovals(user) {
  return isAdminUser(user);
}

export function canManageUsers(user) {
  return isSuperAdminUser(user);
}

export function canViewUsers(user) {
  return isSuperAdminUser(user);
}

export function canDirectlyManageProducts(user) {
  return BUSINESS_ADMIN_ROLES.includes(normalizeUserRole(user?.role));
}

export function canDeleteProducts(user) {
  return isAdminUser(user);
}

export function canPublishProducts(user) {
  return isAdminUser(user);
}

export function canUseDevelopmentTools(user) {
  return DEV_TOOL_ROLES.includes(normalizeUserRole(user?.role));
}

export function canManageOrders(user) {
  return ORDER_MANAGEMENT_ROLES.includes(normalizeUserRole(user?.role));
}

export function canManageCustomers(user) {
  return CUSTOMER_MANAGEMENT_ROLES.includes(normalizeUserRole(user?.role));
}

export function canAccessSettings(user) {
  return isSuperAdminUser(user);
}

export function canAccessSystemLogs(user) {
  return SYSTEM_LOG_ROLES.includes(normalizeUserRole(user?.role));
}

export function canViewAuditLogs(user) {
  return isSuperAdminUser(user);
}

export function canAccessBilling(user) {
  return isSuperAdminUser(user);
}

export function canManageApiKeys(user) {
  return isSuperAdminUser(user);
}

export function canManageRolePermissions(user) {
  return isSuperAdminUser(user);
}

export function canAccessAnalytics(user) {
  return normalizeUserRole(user?.role) === USER_ROLES.ADMIN;
}

export function canAccessInventory(user) {
  return [USER_ROLES.ADMIN, USER_ROLES.SALES].includes(normalizeUserRole(user?.role));
}

export function canManageCatalogReferences(user) {
  return [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(normalizeUserRole(user?.role));
}

export function canViewSalesWorkspace(user) {
  return [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SALES].includes(
    normalizeUserRole(user?.role)
  );
}

export function canApproveQuotations(user) {
  return [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(normalizeUserRole(user?.role));
}

export function canCreateSalesOrders(user) {
  return [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SALES].includes(
    normalizeUserRole(user?.role)
  );
}

export function canCreateCustomerProfiles(user) {
  return [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SALES].includes(
    normalizeUserRole(user?.role)
  );
}

export function canCreateInvoices(user) {
  return [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SALES].includes(
    normalizeUserRole(user?.role)
  );
}

export function canUpdateCustomerProfiles(user) {
  return [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SALES].includes(
    normalizeUserRole(user?.role)
  );
}

export function getWorkspaceRootPath(role) {
  const normalizedRole = normalizeUserRole(role);

  if (normalizedRole === USER_ROLES.OPERATOR) {
    return "/operator";
  }

  if (normalizedRole === USER_ROLES.DEVELOPMENT_TEAM) {
    return "/dev";
  }

  if (normalizedRole === USER_ROLES.SALES) {
    return "/sales";
  }

  return "/admin";
}

export function getDefaultPanelPath(role) {
  const normalizedRole = normalizeUserRole(role);

  if (normalizedRole === USER_ROLES.OPERATOR) {
    return "/operator/data-entry";
  }

  if (normalizedRole === USER_ROLES.DEVELOPMENT_TEAM) {
    return "/dev/system-logs";
  }

  if (normalizedRole === USER_ROLES.SALES) {
    return "/sales/dashboard";
  }

  return "/admin/dashboard";
}

export function formatRoleLabel(role) {
  switch (normalizeUserRole(role)) {
    case USER_ROLES.SUPER_ADMIN:
      return "Super Admin";
    case USER_ROLES.ADMIN:
      return "Admin";
    case USER_ROLES.DEVELOPMENT_TEAM:
      return "Developer";
    case USER_ROLES.SALES:
      return "Sales Team";
    default:
      return "Operator";
  }
}

export function formatRoleBadge(role) {
  return formatRoleLabel(role).toUpperCase();
}
