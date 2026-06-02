import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { RevenueTrendChart, DistributionChart } from "../components/AdminCharts";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function AnalyticsPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadAnalytics() {
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

    loadAnalytics();

    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <section>
      <h2>Analytics</h2>
      <p>Track revenue performance and order behavior trends.</p>
      {error ? <p className="form-error">{error}</p> : null}

      {stats?.charts ? (
        <div className="admin-chart-grid">
          <RevenueTrendChart rows={stats.charts.revenueTrend || []} title="7-Day Revenue" />
          <DistributionChart
            rows={stats.charts.orderStatusBreakdown || []}
            labelKey="status"
            valueKey="total"
            title="Order Status Breakdown"
            subtitle="Operational load by status"
          />
        </div>
      ) : (
        <p>Loading analytics...</p>
      )}
    </section>
  );
}
