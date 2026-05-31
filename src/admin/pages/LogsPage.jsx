import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleString();
}

export default function LogsPage() {
  const { token } = useAdminAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadLogs() {
      try {
        setError("");
        const response = await adminApi.getLogs(token);
        if (!ignore) {
          setRows(response.logs || []);
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
  }, [token]);

  return (
    <section>
      <h2>Audit Logs</h2>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.user_name || "System"}</td>
                <td>{row.action}</td>
                <td>
                  {row.entity_type}#{row.entity_id || "-"}
                </td>
                <td>
                  <pre className="json-preview">{JSON.stringify(row.details || {}, null, 2)}</pre>
                </td>
                <td>{formatDate(row.created_at)}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan="6">No logs found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
