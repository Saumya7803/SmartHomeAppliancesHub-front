import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const distDir = path.join(rootDir, "dist");
const indexFile = path.join(distDir, "index.html");

const routes = [
  "/about",
  "/account",
  "/admin",
  "/admin/approvals",
  "/admin/audit-logs",
  "/admin/billing",
  "/admin/brands",
  "/admin/categories",
  "/admin/customers",
  "/admin/dashboard",
  "/admin/inventory",
  "/admin/login",
  "/admin/logs",
  "/admin/orders",
  "/admin/products",
  "/admin/roles-permissions",
  "/admin/sales/dashboard",
  "/admin/sales/enquiries",
  "/admin/sales/quotations",
  "/admin/settings",
  "/admin/system-logs",
  "/admin/users",
  "/admin-dashboard",
  "/admin-login",
  "/contact",
  "/developer/dashboard",
  "/dev",
  "/dev/api-docs",
  "/dev/dev-tools",
  "/dev/error-tracker",
  "/dev/system-health",
  "/dev/system-logs",
  "/login",
  "/operator",
  "/operator/dashboard",
  "/operator/customers",
  "/operator/data-entry",
  "/operator/orders",
  "/operator/products",
  "/operator-dashboard",
  "/orders",
  "/products",
  "/quotes",
  "/sales",
  "/sales/customers",
  "/sales/dashboard",
  "/sales/enquiries",
  "/sales/inventory",
  "/sales/invoices",
  "/sales/orders",
  "/sales/products",
  "/sales/quotations",
  "/sales-dashboard",
  "/signin",
  "/signup",
];

for (let id = 1; id <= 200; id += 1) {
  routes.push(`/products/${id}`);
}

await Promise.all(
  routes.map(async (route) => {
    const routePath = route.replace(/^\/+|\/+$/g, "");
    if (!routePath) return;

    const targetDir = path.join(distDir, routePath);
    await mkdir(targetDir, { recursive: true });
    await copyFile(indexFile, path.join(targetDir, "index.html"));
  }),
);

console.log(`Created ${routes.length} SPA fallback pages.`);
