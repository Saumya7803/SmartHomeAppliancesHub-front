import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function SystemHealthPage() {
  const { token } = useAdminAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadHealth() {
      try {
        setError("");
        const response = await adminApi.getTechnicalHealth(token);
        if (!ignore) {
          setData(response);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadHealth();
    const timerId = window.setInterval(loadHealth, 15000);

    return () => {
      ignore = true;
      window.clearInterval(timerId);
    };
  }, [token]);

  return (
    <section>
      <h2>System Health</h2>
      <p>Live operational telemetry for backend runtime and database connectivity.</p>
      {error ? <p className="form-error">{error}</p> : null}

      {data ? (
        <>
          <div className="admin-stats-grid">
            <article className="admin-stat-card">
              <p>Health Status</p>
              <h3>{data.systemHealth?.status || "unknown"}</h3>
            </article>
            <article className="admin-stat-card">
              <p>DB</p>
              <h3>{data.systemHealth?.database || "unknown"}</h3>
            </article>
            <article className="admin-stat-card">
              <p>Uptime</p>
              <h3>{data.performance?.uptimeSeconds || 0}s</h3>
            </article>
            <article className="admin-stat-card">
              <p>Memory (RSS)</p>
              <h3>{data.performance?.rssMb || 0} MB</h3>
            </article>
            <article className="admin-stat-card">
              <p>Errors (24h)</p>
              <h3>{data.counters?.errorLogs24h || 0}</h3>
            </article>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>API Requests (24h)</td>
                  <td>{data.counters?.apiRequests24h || 0}</td>
                </tr>
                <tr>
                  <td>Enabled Feature Flags</td>
                  <td>{data.counters?.enabledFeatureFlags || 0}</td>
                </tr>
                <tr>
                  <td>Total Products</td>
                  <td>{data.counters?.totalProducts || 0}</td>
                </tr>
                <tr>
                  <td>Total Users</td>
                  <td>{data.counters?.totalUsers || 0}</td>
                </tr>
                <tr>
                  <td>Node Version</td>
                  <td>{data.performance?.nodeVersion || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>Loading system health...</p>
      )}
    </section>
  );
}
