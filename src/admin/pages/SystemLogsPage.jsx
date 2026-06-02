import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

function formatDate(value) {
  return new Date(value).toLocaleString();
}

export default function SystemLogsPage() {
  const { token, user } = useAdminAuth();
  const [errorLogs, setErrorLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadLogs() {
      try {
        setError("");
        const response = await adminApi.getSystemLogs(token, user.role);

        if (!ignore) {
          setErrorLogs(response.errorLogs || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadLogs();

    return () => {
      ignore = true;
    };
  }, [token, user.role]);

  return (
    <section>
      <h2>System Logs</h2>
      <p>Read recent API error logs for technical troubleshooting.</p>
      {error ? <p className="form-error">{error}</p> : null}

      <section>
        <h3>Error Logs</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Path</th>
                <th>Method</th>
                <th>Status</th>
                <th>Message</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {errorLogs.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.details?.path || "-"}</td>
                  <td>{row.details?.method || "-"}</td>
                  <td>{row.details?.statusCode || "-"}</td>
                  <td>{row.details?.message || "-"}</td>
                  <td>{formatDate(row.created_at)}</td>
                </tr>
              ))}
              {!errorLogs.length ? (
                <tr>
                  <td colSpan="6">No error logs found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
