import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/adminApi";
import { DistributionChart, RevenueTrendChart } from "../components/AdminCharts";
import { useAdminAuth } from "../hooks/useAdminAuth";

const PAGE_SIZE = 5;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return parsed.toLocaleString();
}

export default function DashboardPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderPage, setOrderPage] = useState(1);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        setError("");
        const response = await adminApi.getDashboardStats(token);
        if (!ignore) {
          setStats(response);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [token]);

  const overview = stats?.dashboardOverview || {
    totalProducts: 0,
    totalEnquiries: 0,
    totalSales: 0,
  };
  const quickStats = stats?.quickStats || {
    products: 0,
    categories: 0,
    brands: 0,
    enquiries: 0,
    quotations: 0,
  };

  const filteredOrders = useMemo(() => {
    const rows = stats?.recentOrders || [];
    const normalizedSearch = orderSearch.trim().toLowerCase();
    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((row) =>
      [row.order_number, row.customer_name, row.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [stats?.recentOrders, orderSearch]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeOrderPage = Math.min(orderPage, totalOrderPages);
  const paginatedOrders = useMemo(() => {
    const start = (safeOrderPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, safeOrderPage]);

  return (
    <section className="admin-dashboard-page">
      <header>
        <h2>Dashboard Overview</h2>
        <p>Enterprise control view for products, enquiries, sales, and order health.</p>
      </header>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <p>Total Products</p>
          <h3>{overview.totalProducts}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Total Enquiries</p>
          <h3>{overview.totalEnquiries}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Total Sales</p>
          <h3>{formatCurrency(overview.totalSales)}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Recent Orders</p>
          <h3>{stats?.recentOrders?.length || 0}</h3>
        </article>
      </div>

      <div className="admin-quick-stats-grid">
        <article className="admin-quick-stat">
          <p>Products</p>
          <h4>{quickStats.products}</h4>
        </article>
        <article className="admin-quick-stat">
          <p>Categories</p>
          <h4>{quickStats.categories}</h4>
        </article>
        <article className="admin-quick-stat">
          <p>Brands</p>
          <h4>{quickStats.brands}</h4>
        </article>
        <article className="admin-quick-stat">
          <p>Enquiries</p>
          <h4>{quickStats.enquiries}</h4>
        </article>
        <article className="admin-quick-stat">
          <p>Quotations</p>
          <h4>{quickStats.quotations}</h4>
        </article>
      </div>

      {stats?.charts ? (
        <div className="admin-chart-grid">
          <RevenueTrendChart rows={stats.charts.revenueTrend || []} title="Revenue Trend" />
          <DistributionChart
            rows={stats.charts.orderStatusBreakdown || []}
            labelKey="status"
            valueKey="total"
            title="Order Status Mix"
            subtitle="Current operational distribution"
          />
        </div>
      ) : null}

      <section className="enterprise-card">
        <div className="admin-products-toolbar">
          <label className="admin-products-search">
            Search Recent Orders
            <input
              type="search"
              value={orderSearch}
              onChange={(event) => {
                setOrderPage(1);
                setOrderSearch(event.target.value);
              }}
              placeholder="Order number, customer, or status"
            />
          </label>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.customer_name}</td>
                  <td>{formatCurrency(order.total_amount)}</td>
                  <td>{order.status}</td>
                  <td>{formatDate(order.created_at)}</td>
                </tr>
              ))}
              {!paginatedOrders.length ? (
                <tr>
                  <td colSpan="5">No recent orders found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="admin-products-pagination">
          <p>
            Page {safeOrderPage} of {totalOrderPages} ({filteredOrders.length} matching orders)
          </p>
          <div>
            <button
              type="button"
              className="btn-outline"
              disabled={safeOrderPage <= 1}
              onClick={() => setOrderPage((value) => Math.max(1, value - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="btn-outline"
              disabled={safeOrderPage >= totalOrderPages}
              onClick={() => setOrderPage((value) => Math.min(totalOrderPages, value + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
