import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/adminApi";
import { DistributionChart, RevenueTrendChart } from "../components/AdminCharts";
import { useAdminAuth } from "../hooks/useAdminAuth";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function SalesDashboardPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        setError("");
        const response = await adminApi.getSalesDashboardStats(token);
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

  const cards = useMemo(() => {
    const values = stats?.cards || {};
    return [
      { label: "Total Products", value: Number(values.totalProducts || 0) },
      { label: "Available Stock", value: Number(values.availableStock || 0) },
      { label: "Today's Sales", value: formatCurrency(values.todaysSales) },
      { label: "Monthly Revenue", value: formatCurrency(values.monthlyRevenue) },
      { label: "Pending Orders", value: Number(values.pendingOrders || 0) },
      { label: "Total Enquiries", value: Number(values.totalEnquiries || 0) },
      { label: "New Enquiries", value: Number(values.newEnquiries || 0) },
      { label: "Total Quotations", value: Number(values.totalQuotations || 0) },
      {
        label: "Pending Quote Approval",
        value: Number(values.pendingQuotationApprovals || 0),
      },
    ];
  }, [stats]);

  return (
    <section className="sales-dashboard-page">
      <header className="sales-dashboard-header">
        <h2>Sales Dashboard</h2>
        <p>Enterprise sales operations view across products, orders, customers, and invoicing.</p>
      </header>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="sales-dashboard-cards">
        {cards.map((item) => (
          <article key={item.label} className="sales-stat-card">
            <p>{item.label}</p>
            <h3>{item.value}</h3>
          </article>
        ))}
      </div>

      <div className="admin-chart-grid sales-dashboard-charts">
        <RevenueTrendChart
          rows={stats?.charts?.salesTrend || []}
          title="Sales Trend Chart"
          subtitle="Last 30 days"
          lineColor="#f97316"
          fillColor="rgba(249, 115, 22, 0.2)"
        />
        <DistributionChart
          rows={stats?.charts?.topSellingProducts || []}
          labelKey="name"
          valueKey="units_sold"
          title="Top Selling Products"
          subtitle="Estimated unit movement"
        />
      </div>

      <section className="enterprise-card">
        <h3>Recent Enquiries</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Enquiry</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentEnquiries || []).map((row) => (
                <tr key={row.id}>
                  <td>{row.enquiry_code || `ENQ-${row.id}`}</td>
                  <td>{row.customer_name}</td>
                  <td>
                    {row.product_name} (Qty: {row.quantity})
                  </td>
                  <td>{row.status}</td>
                  <td>{row.created_at ? new Date(row.created_at).toLocaleString() : "-"}</td>
                </tr>
              ))}
              {!stats?.recentEnquiries?.length ? (
                <tr>
                  <td colSpan="5">No enquiries yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
