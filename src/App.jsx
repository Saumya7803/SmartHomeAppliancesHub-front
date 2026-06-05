import { lazy, Suspense } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminLayout from "./admin/components/AdminLayout";
import PrivateRoute from "./admin/components/PrivateRoute";
import {
  BUSINESS_ADMIN_ROLES,
  DEV_TOOL_ROLES,
  USER_ROLES,
} from "./admin/utils/roles";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute";

const AdminLoginPage = lazy(() => import("./admin/pages/AdminLoginPage"));
const AdminBrandsPage = lazy(() => import("./admin/pages/AdminBrandsPage"));
const AdminCategoriesPage = lazy(() => import("./admin/pages/AdminCategoriesPage"));
const AdminProductsPage = lazy(() => import("./admin/pages/AdminProductsPage"));
const ApiDocsPage = lazy(() => import("./admin/pages/ApiDocsPage"));
const ApiKeysPage = lazy(() => import("./admin/pages/ApiKeysPage"));
const BillingPage = lazy(() => import("./admin/pages/BillingPage"));
const CustomersPage = lazy(() => import("./admin/pages/CustomersPage"));
const DashboardPage = lazy(() => import("./admin/pages/DashboardPage"));
const DevToolsPage = lazy(() => import("./admin/pages/DevToolsPage"));
const ErrorTrackerPage = lazy(() => import("./admin/pages/ErrorTrackerPage"));
const InventoryPage = lazy(() => import("./admin/pages/InventoryPage"));
const LogsPage = lazy(() => import("./admin/pages/LogsPage"));
const OperatorDataEntryPage = lazy(() => import("./admin/pages/OperatorDataEntryPage"));
const OrdersPage = lazy(() => import("./admin/pages/OrdersPage"));
const PendingApprovalsPage = lazy(() => import("./admin/pages/PendingApprovalsPage"));
const RolePermissionsPage = lazy(() => import("./admin/pages/RolePermissionsPage"));
const SalesCustomersPage = lazy(() => import("./admin/pages/SalesCustomersPage"));
const SalesDashboardPage = lazy(() => import("./admin/pages/SalesDashboardPage"));
const SalesEnquiriesPage = lazy(() => import("./admin/pages/SalesEnquiriesPage"));
const SalesInvoicesPage = lazy(() => import("./admin/pages/SalesInvoicesPage"));
const SalesOrdersPage = lazy(() => import("./admin/pages/SalesOrdersPage"));
const SalesProductsPage = lazy(() => import("./admin/pages/SalesProductsPage"));
const SalesQuotationsPage = lazy(() => import("./admin/pages/SalesQuotationsPage"));
const SettingsPage = lazy(() => import("./admin/pages/SettingsPage"));
const SystemHealthPage = lazy(() => import("./admin/pages/SystemHealthPage"));
const SystemLogsPage = lazy(() => import("./admin/pages/SystemLogsPage"));
const AdminUsersPage = lazy(() => import("./admin/pages/UsersPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));

const SUPER_ADMIN_ONLY = [USER_ROLES.SUPER_ADMIN];
const ADMIN_ONLY = [USER_ROLES.ADMIN];
const SALES_ONLY = [USER_ROLES.SALES];

export default function App() {
  const location = useLocation();
  const isAdminRoute =
    location.pathname === "/login" ||
    location.pathname === "/admin-login" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/dev") ||
    location.pathname.startsWith("/operator") ||
    location.pathname.startsWith("/sales") ||
    location.pathname.startsWith("/sales-dashboard") ||
    location.pathname.startsWith("/developer") ||
    location.pathname.startsWith("/admin-dashboard") ||
    location.pathname.startsWith("/operator-dashboard");
  const isShopProductsRoute = location.pathname === "/products";

  return (
    <div className="app-wrapper">
      {!isAdminRoute && !isShopProductsRoute ? <Navbar /> : null}

      <div className="page-content">
        <Suspense
          fallback={
            <main className="container section-padded">
              <div className="empty-state">
                <h1>Loading...</h1>
                <p>Preparing the page.</p>
              </div>
            </main>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/account"
              element={
                <CustomerProtectedRoute>
                  <AccountPage initialSection="profile" />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <CustomerProtectedRoute>
                  <AccountPage initialSection="orders" />
                </CustomerProtectedRoute>
              }
            />
            <Route
              path="/quotes"
              element={
                <CustomerProtectedRoute>
                  <AccountPage initialSection="quotations" />
                </CustomerProtectedRoute>
              }
            />

            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/login" element={<Navigate to="/admin-login" replace />} />
            <Route path="/admin/login" element={<Navigate to="/admin-login" replace />} />

            <Route
              path="/admin"
              element={
                <PrivateRoute roles={BUSINESS_ADMIN_ROLES}>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <PrivateRoute roles={BUSINESS_ADMIN_ROLES}>
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="products"
                element={
                  <PrivateRoute roles={BUSINESS_ADMIN_ROLES}>
                    <AdminProductsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="categories"
                element={
                  <PrivateRoute roles={BUSINESS_ADMIN_ROLES}>
                    <AdminCategoriesPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="brands"
                element={
                  <PrivateRoute roles={BUSINESS_ADMIN_ROLES}>
                    <AdminBrandsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <PrivateRoute roles={BUSINESS_ADMIN_ROLES}>
                    <OrdersPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="customers"
                element={
                  <PrivateRoute roles={BUSINESS_ADMIN_ROLES}>
                    <CustomersPage />
                  </PrivateRoute>
                }
              />
              <Route path="sales/enquiries" element={<SalesEnquiriesPage />} />
              <Route path="sales/quotations" element={<SalesQuotationsPage />} />
              <Route path="sales/dashboard" element={<SalesDashboardPage />} />
              <Route
                path="approvals"
                element={
                  <PrivateRoute roles={BUSINESS_ADMIN_ROLES}>
                    <PendingApprovalsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="users"
                element={
                  <PrivateRoute roles={SUPER_ADMIN_ONLY}>
                    <AdminUsersPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="roles-permissions"
                element={
                  <PrivateRoute roles={SUPER_ADMIN_ONLY}>
                    <RolePermissionsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="billing"
                element={
                  <PrivateRoute roles={SUPER_ADMIN_ONLY}>
                    <BillingPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="api-keys"
                element={
                  <PrivateRoute roles={SUPER_ADMIN_ONLY}>
                    <ApiKeysPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="audit-logs"
                element={
                  <PrivateRoute roles={SUPER_ADMIN_ONLY}>
                    <LogsPage />
                  </PrivateRoute>
                }
              />
              <Route path="logs" element={<Navigate to="/admin/audit-logs" replace />} />
              <Route
                path="system-logs"
                element={
                  <PrivateRoute roles={SUPER_ADMIN_ONLY}>
                    <SystemLogsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="inventory"
                element={
                  <PrivateRoute roles={ADMIN_ONLY}>
                    <InventoryPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <PrivateRoute roles={SUPER_ADMIN_ONLY}>
                    <SettingsPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>

            <Route
              path="/dev"
              element={
                <PrivateRoute roles={DEV_TOOL_ROLES}>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dev/system-logs" replace />} />
              <Route
                path="system-logs"
                element={
                  <PrivateRoute roles={DEV_TOOL_ROLES}>
                    <SystemLogsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="dev-tools"
                element={
                  <PrivateRoute roles={DEV_TOOL_ROLES}>
                    <DevToolsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="api-docs"
                element={
                  <PrivateRoute roles={DEV_TOOL_ROLES}>
                    <ApiDocsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="system-health"
                element={
                  <PrivateRoute roles={DEV_TOOL_ROLES}>
                    <SystemHealthPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="error-tracker"
                element={
                  <PrivateRoute roles={DEV_TOOL_ROLES}>
                    <ErrorTrackerPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dev/system-logs" replace />} />
            </Route>

            <Route
              path="/operator"
              element={
                <PrivateRoute roles={[USER_ROLES.OPERATOR]}>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/operator/data-entry" replace />} />
              <Route path="data-entry" element={<OperatorDataEntryPage />} />
              <Route path="products" element={<Navigate to="/operator/data-entry" replace />} />
              <Route path="orders" element={<Navigate to="/operator/data-entry" replace />} />
              <Route path="customers" element={<Navigate to="/operator/data-entry" replace />} />
              <Route path="*" element={<Navigate to="/operator/data-entry" replace />} />
            </Route>

            <Route
              path="/sales"
              element={
                <PrivateRoute roles={SALES_ONLY}>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/sales/dashboard" replace />} />
              <Route path="dashboard" element={<SalesDashboardPage />} />
              <Route path="enquiries" element={<SalesEnquiriesPage />} />
              <Route path="quotations" element={<SalesQuotationsPage />} />
              <Route path="products" element={<SalesProductsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="orders" element={<SalesOrdersPage />} />
              <Route path="customers" element={<SalesCustomersPage />} />
              <Route path="invoices" element={<SalesInvoicesPage />} />
              <Route path="*" element={<Navigate to="/sales/dashboard" replace />} />
            </Route>

            <Route path="/sales-dashboard" element={<Navigate to="/sales/dashboard" replace />} />
            <Route path="/operator/dashboard" element={<Navigate to="/operator/data-entry" replace />} />
            <Route path="/developer/dashboard" element={<Navigate to="/dev/system-logs" replace />} />
            <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin-dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/operator-dashboard" element={<Navigate to="/operator/data-entry" replace />} />
            <Route path="/operator-dashboard/*" element={<Navigate to="/operator/data-entry" replace />} />
            <Route path="/user/*" element={<Navigate to="/" replace />} />

            <Route
              path="*"
              element={
                <main className="container section-padded">
                  <div className="empty-state">
                    <h1>404 - Page Not Found</h1>
                    <p>The page you requested does not exist in the catalog website.</p>
                    <Link to="/" className="btn-primary">
                      Go to Home
                    </Link>
                  </div>
                </main>
              }
            />
          </Routes>
        </Suspense>
      </div>

      {!isAdminRoute ? <Footer /> : null}
    </div>
  );
}
