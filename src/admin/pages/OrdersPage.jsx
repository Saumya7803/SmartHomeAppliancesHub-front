import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const SUPPORT_OPTIONS = ["open", "in_progress", "resolved"];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function OrdersPage() {
  const { token, user } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const response = await adminApi.getOrders(token, user.role, {
          search,
          status: statusFilter,
        });

        if (!ignore) {
          const rows = response.orders || [];
          setOrders(rows);
          setDrafts(
            Object.fromEntries(
              rows.map((row) => [
                row.id,
                { status: row.status, support_status: row.support_status },
              ])
            )
          );
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

    loadOrders();

    return () => {
      ignore = true;
    };
  }, [token, user.role, search, statusFilter, reloadKey]);

  const summary = useMemo(
    () => ({
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, row) => sum + Number(row.total_amount || 0), 0),
    }),
    [orders]
  );

  const handleSave = async (orderId) => {
    try {
      await adminApi.updateOrderStatus(token, user.role, orderId, drafts[orderId]);
      setMessage(`Order ${orderId} updated`);
      setError("");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section>
      <h2>Orders</h2>
      <p>Track order progress, update fulfilment status, and manage support workflows.</p>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <p>Total Orders</p>
          <h3>{summary.totalOrders}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Total Revenue</p>
          <h3>{formatCurrency(summary.totalRevenue)}</h3>
        </article>
      </div>

      <div className="admin-form-grid">
        <label>
          Search Orders
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order number, customer, or company"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? <p>Loading orders...</p> : null}

      {!loading ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Company</th>
                <th>Total</th>
                <th>Status</th>
                <th>Support</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((row) => {
                const draft = drafts[row.id] || {
                  status: row.status,
                  support_status: row.support_status,
                };

                return (
                  <tr key={row.id}>
                    <td>{row.order_number}</td>
                    <td>{row.customer_name}</td>
                    <td>{row.customer_company || "-"}</td>
                    <td>{formatCurrency(row.total_amount)}</td>
                    <td>
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [row.id]: { ...draft, status: event.target.value },
                          }))
                        }
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={draft.support_status}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [row.id]: { ...draft, support_status: event.target.value },
                          }))
                        }
                      >
                        {SUPPORT_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{new Date(row.created_at).toLocaleString()}</td>
                    <td>
                      <button type="button" className="btn-outline" onClick={() => handleSave(row.id)}>
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!orders.length ? (
                <tr>
                  <td colSpan="8">No orders found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
