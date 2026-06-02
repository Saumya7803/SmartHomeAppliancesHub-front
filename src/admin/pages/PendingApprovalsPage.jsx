import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

function formatTimestamp(value) {
  return new Date(value).toLocaleString();
}

const APPROVAL_BUCKETS = [
  { key: "all", label: "All Pending" },
  { key: "products", label: "Pending Products" },
  { key: "orders", label: "Pending Orders" },
  { key: "customers", label: "Pending Customers" },
  { key: "price_changes", label: "Pending Price Changes" },
];

export default function PendingApprovalsPage() {
  const { token } = useAdminAuth();
  const [changes, setChanges] = useState([]);
  const [counts, setCounts] = useState({});
  const [activeBucket, setActiveBucket] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadChanges() {
      setLoading(true);
      setError("");

      try {
        const response = await adminApi.getPendingChanges(token, activeBucket);
        if (!ignore) {
          setChanges(response.changes || []);
          setCounts(response.counts || {});
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadChanges();

    return () => {
      ignore = true;
    };
  }, [token, reloadKey, activeBucket]);

  const handleApprove = async (change) => {
    try {
      await adminApi.approveChange(token, change.entity_type, change.id);
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleReject = async (change) => {
    const reason = window.prompt("Reason for rejection:", "");

    try {
      await adminApi.rejectChange(token, change.entity_type, change.id, reason || "");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section>
      <h2>Approval Center</h2>
      <p>Review pending product, order, customer, and price change submissions.</p>

      {error ? <p className="form-error">{error}</p> : null}
      {loading ? <p>Loading requests...</p> : null}

      <div className="admin-form-actions">
        {APPROVAL_BUCKETS.map((bucket) => (
          <button
            key={bucket.key}
            type="button"
            className={activeBucket === bucket.key ? "btn-primary" : "btn-outline"}
            onClick={() => setActiveBucket(bucket.key)}
          >
            {bucket.label} ({counts[bucket.key] ?? 0})
          </button>
        ))}
      </div>

      {!loading ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Queue ID</th>
                <th>Entity</th>
                <th>Request Type</th>
                <th>Record</th>
                <th>Requested By</th>
                <th>Requested At</th>
                <th>Data</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change) => (
                <tr key={`${change.entity_type}-${change.id}`}>
                  <td>{change.id}</td>
                  <td>
                    <span className={`status-chip status-${change.entity_type}`}>{change.entity_type}</span>
                  </td>
                  <td>{change.change_type}</td>
                  <td>{change.display_name}</td>
                  <td>{change.requested_by_name || change.requested_by_email || "Unknown"}</td>
                  <td>{formatTimestamp(change.created_at)}</td>
                  <td>
                    <pre className="json-preview">{JSON.stringify(change.payload || {}, null, 2)}</pre>
                  </td>
                  <td>
                    <div className="table-action-row">
                      <button type="button" className="btn-approve" onClick={() => handleApprove(change)}>
                        Approve
                      </button>
                      <button type="button" className="btn-reject" onClick={() => handleReject(change)}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!changes.length ? (
                <tr>
                  <td colSpan="8">No pending requests in this queue.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
