import { useCallback, useEffect, useState } from "react";
import { getAdminSession } from "../utils/adminAuth";
import { adminMockApi } from "../utils/adminMockApi";

function formatDate(value) {
  return new Date(value).toLocaleString();
}

export default function ApprovalsPage() {
  const session = getAdminSession();
  const user = session?.user;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const pendingRequests = await adminMockApi.getPendingChanges();
      setRequests(pendingRequests);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (requestId) => {
    setMessage("");
    setError("");

    try {
      const response = await adminMockApi.approveChange(requestId, user);
      setMessage(response.message);
      await loadRequests();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleReject = async (requestId) => {
    setMessage("");
    setError("");

    try {
      const reason = window.prompt("Rejection reason", "") || "";
      const response = await adminMockApi.rejectChange(requestId, user, reason);
      setMessage(response.message);
      await loadRequests();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section>
      <h2>Pending Approvals</h2>
      <p>Review and decide on pending operator product requests.</p>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}
      {loading ? <p>Loading pending changes...</p> : null}

      {!loading ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Product</th>
                <th>Requested By</th>
                <th>Requested At</th>
                <th>Data</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>
                    <span className={`status-chip status-${request.changeType}`}>{request.changeType}</span>
                  </td>
                  <td>{request.productName}</td>
                  <td>{request.requestedBy}</td>
                  <td>{formatDate(request.createdAt)}</td>
                  <td>
                    <pre className="json-preview">{JSON.stringify(request.changeData, null, 2)}</pre>
                  </td>
                  <td>
                    <div className="table-action-row">
                      <button type="button" className="btn-approve" onClick={() => handleApprove(request.id)}>
                        Approve
                      </button>
                      <button type="button" className="btn-reject" onClick={() => handleReject(request.id)}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!requests.length ? (
                <tr>
                  <td colSpan="7">No pending approvals.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
