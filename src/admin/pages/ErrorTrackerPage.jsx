import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

function formatDate(value) {
  return new Date(value).toLocaleString();
}

export default function ErrorTrackerPage() {
  const { token, user } = useAdminAuth();
  const [errorLogs, setErrorLogs] = useState([]);
  const [apiRequests, setApiRequests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadTrackerData() {
      try {
        setError("");
        const [systemResponse, apiResponse] = await Promise.all([
          adminApi.getSystemLogs(token, user.role),
          adminApi.getApiRequests(token),
        ]);

        if (!ignore) {
          setErrorLogs(systemResponse.errorLogs || []);
          setApiRequests(apiResponse.logs || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadTrackerData();

    return () => {
      ignore = true;
    };
  }, [token, user.role]);

  return (
    <section>
      <h2>Error Tracker</h2>
      <p>Recent API failures and request telemetry for debugging incidents quickly.</p>
      {error ? <p className="form-error">{error}</p> : null}

      <section>
        <h3>Recent Errors</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Method</th>
                <th>Path</th>
                <th>Status</th>
                <th>Message</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {errorLogs.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.details?.method || "-"}</td>
                  <td>{row.details?.path || "-"}</td>
                  <td>{row.details?.statusCode || "-"}</td>
                  <td>{row.details?.message || "-"}</td>
                  <td>{formatDate(row.created_at)}</td>
                </tr>
              ))}
              {!errorLogs.length ? (
                <tr>
                  <td colSpan="6">No errors logged.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>Request Activity</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Status</th>
                <th>Duration</th>
                <th>User</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {apiRequests.slice(0, 100).map((row) => (
                <tr key={row.id}>
                  <td>{row.details?.method || "-"}</td>
                  <td>{row.details?.path || "-"}</td>
                  <td>{row.details?.statusCode || "-"}</td>
                  <td>{row.details?.durationMs || "-"} ms</td>
                  <td>{row.user_email || "Anonymous"}</td>
                  <td>{formatDate(row.created_at)}</td>
                </tr>
              ))}
              {!apiRequests.length ? (
                <tr>
                  <td colSpan="6">No API request logs.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
