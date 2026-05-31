import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";
import {
  canAccessBilling,
  canAccessInventory,
  canAccessSettings,
  canAccessSystemLogs,
  canManageCatalogReferences,
  canManageApiKeys,
  canManageApprovals,
  canManageRolePermissions,
  canUseDevelopmentTools,
  canViewAuditLogs,
  canViewSalesWorkspace,
  formatRoleLabel,
  getDefaultPanelPath,
  getWorkspaceRootPath,
  isDevelopmentTeamUser,
  isOperatorUser,
  isSalesUser,
  isSuperAdminUser,
  canViewUsers,
} from "../utils/roles";

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const defaultPath = getDefaultPanelPath(user.role);
  const workspaceRootPath = getWorkspaceRootPath(user.role);
  const isOperator = isOperatorUser(user);
  const isDevelopmentTeam = isDevelopmentTeamUser(user);
  const isSuperAdmin = isSuperAdminUser(user);
  const isSales = isSalesUser(user);
  const canManageCatalog = canManageCatalogReferences(user);
  const canViewSales = canViewSalesWorkspace(user);

  const handleLogout = () => {
    logout();
    navigate("/admin-login", { replace: true });
  };

  const workspaceDescription = isOperator
    ? ""
    : isDevelopmentTeam
      ? "Developer Operations Workspace"
      : isSales
        ? "Sales Operations Workspace"
      : isSuperAdmin
        ? "Super Admin Workspace"
        : "Admin Workspace";

  const panelTitle = isOperator
    ? "Add Product"
    : isDevelopmentTeam
      ? "Developer Console"
      : isSales
        ? "Sales Workspace"
      : isSuperAdmin
        ? "Enterprise Control Center"
        : "Admin Control Center";

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <h2>{isOperator ? "Operator Workspace" : isSales ? "Sales Workspace" : "SmartHome B2B"}</h2>
          {workspaceDescription ? <p>{workspaceDescription}</p> : null}
        </div>

        <nav className="admin-nav">
          {isOperator ? (
            <NavLink to={defaultPath} end>
              Add Product
            </NavLink>
          ) : isDevelopmentTeam ? (
            <>
              {canAccessSystemLogs(user) ? <NavLink to={`${workspaceRootPath}/system-logs`}>System Logs</NavLink> : null}
              {canUseDevelopmentTools(user) ? <NavLink to={`${workspaceRootPath}/dev-tools`}>Dev Tools</NavLink> : null}
              <NavLink to={`${workspaceRootPath}/api-docs`}>API Docs</NavLink>
              <NavLink to={`${workspaceRootPath}/system-health`}>System Health</NavLink>
              <NavLink to={`${workspaceRootPath}/error-tracker`}>Error Tracker</NavLink>
            </>
          ) : isSales ? (
            <>
              <NavLink to={`${workspaceRootPath}/dashboard`}>Dashboard</NavLink>
              <NavLink to={`${workspaceRootPath}/enquiries`}>Enquiries</NavLink>
              <NavLink to={`${workspaceRootPath}/quotations`}>Quotations</NavLink>
              <NavLink to={`${workspaceRootPath}/customers`}>Assigned Customers</NavLink>
              <NavLink to={`${workspaceRootPath}/products`}>Products</NavLink>
            </>
          ) : (
            <>
              <NavLink to={`${workspaceRootPath}/dashboard`}>Dashboard</NavLink>
              <NavLink to={`${workspaceRootPath}/products`}>Products</NavLink>
              {canManageCatalog ? <NavLink to={`${workspaceRootPath}/categories`}>Categories</NavLink> : null}
              {canManageCatalog ? <NavLink to={`${workspaceRootPath}/brands`}>Brands</NavLink> : null}

              {canViewSales ? <p className="admin-nav-group-label">Sales</p> : null}
              {canViewSales ? <NavLink to={`${workspaceRootPath}/sales/dashboard`}>Dashboard</NavLink> : null}
              {canViewSales ? <NavLink to={`${workspaceRootPath}/sales/enquiries`}>Enquiries</NavLink> : null}
              {canViewSales ? <NavLink to={`${workspaceRootPath}/sales/quotations`}>Quotations</NavLink> : null}

              {canViewUsers(user) ? <NavLink to={`${workspaceRootPath}/users`}>Users</NavLink> : null}
              {canAccessSettings(user) ? <NavLink to={`${workspaceRootPath}/settings`}>Settings</NavLink> : null}

              {(canManageApprovals(user) ||
                canManageRolePermissions(user) ||
                canAccessBilling(user) ||
                canManageApiKeys(user) ||
                canViewAuditLogs(user) ||
                canAccessSystemLogs(user) ||
                canAccessInventory(user)) ? (
                  <p className="admin-nav-group-label">Advanced</p>
                ) : null}
              {canManageApprovals(user) ? <NavLink to={`${workspaceRootPath}/approvals`}>Approvals</NavLink> : null}
              {canManageRolePermissions(user) ? (
                <NavLink to={`${workspaceRootPath}/roles-permissions`}>Roles & Permissions</NavLink>
              ) : null}
              {canAccessBilling(user) ? <NavLink to={`${workspaceRootPath}/billing`}>Billing</NavLink> : null}
              {canManageApiKeys(user) ? <NavLink to={`${workspaceRootPath}/api-keys`}>API Keys</NavLink> : null}
              {canViewAuditLogs(user) ? <NavLink to={`${workspaceRootPath}/audit-logs`}>Audit Logs</NavLink> : null}
              {canAccessSystemLogs(user) ? <NavLink to={`${workspaceRootPath}/system-logs`}>System Logs</NavLink> : null}
              {canAccessInventory(user) ? <NavLink to={`${workspaceRootPath}/inventory`}>Inventory</NavLink> : null}
            </>
          )}
        </nav>

        <button type="button" className="btn-outline admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div className="admin-main-wrap">
        <header className="admin-topbar">
          <div>
            <h1>{panelTitle}</h1>
            <p>
              {user.name} ({user.email})
            </p>
          </div>
          <span className="admin-role-badge">Logged in as: {formatRoleLabel(user.role)}</span>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
