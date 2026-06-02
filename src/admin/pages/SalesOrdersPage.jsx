import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const SUPPORT_OPTIONS = ["open", "in_progress", "resolved"];

const INITIAL_ORDER_FORM = {
  customer_id: "",
  order_number: "",
  total_amount: "",
  status: "pending",
  support_status: "open",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function SalesOrdersPage() {
  const { token, user } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orderForm, setOrderForm] = useState(INITIAL_ORDER_FORM);
  const [drafts, setDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [ordersResponse, customerResponse] = await Promise.all([
          adminApi.getOrders(token, user.role, { search, status: statusFilter }),
          adminApi.getCustomers(token, user.role),
        ]);

        if (!ignore) {
          const rows = ordersResponse.orders || [];
          setOrders(rows);
          setCustomers(customerResponse.customers || []);
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

    loadData();

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

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await adminApi.createOrder(token, user.role, {
        customer_id: Number(orderForm.customer_id),
        order_number: orderForm.order_number.trim(),
        total_amount: Number(orderForm.total_amount),
        status: orderForm.status,
        support_status: orderForm.support_status,
      });

      setOrderForm(INITIAL_ORDER_FORM);
      setMessage("Sales order created");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleSaveStatus = async (orderId) => {
    setError("");
    setMessage("");
    try {
      await adminApi.updateOrderStatus(token, user.role, orderId, drafts[orderId]);
      setMessage(`Order ${orderId} updated`);
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section>
      <h2>Sales Orders</h2>
      <p>Create sales orders, review sales history, and update fulfillment status.</p>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <form className="admin-form-grid" onSubmit={handleCreateOrder}>
        <label>
          Customer
          <select
            value={orderForm.customer_id}
            onChange={(event) => setOrderForm((value) => ({ ...value, customer_id: event.target.value }))}
            required
          >
            <option value="">Select customer</option>
            {customers.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name} ({row.email})
              </option>
            ))}
          </select>
        </label>

        <label>
          Order Number
          <input
            value={orderForm.order_number}
            onChange={(event) => setOrderForm((value) => ({ ...value, order_number: event.target.value }))}
            placeholder="ORD-1099"
            required
          />
        </label>

        <label>
          Total Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={orderForm.total_amount}
            onChange={(event) => setOrderForm((value) => ({ ...value, total_amount: event.target.value }))}
            required
          />
        </label>

        <label>
          Status
          <select
            value={orderForm.status}
            onChange={(event) => setOrderForm((value) => ({ ...value, status: event.target.value }))}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Support Status
          <select
            value={orderForm.support_status}
            onChange={(event) => setOrderForm((value) => ({ ...value, support_status: event.target.value }))}
          >
            {SUPPORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="admin-form-actions">
          <button type="submit" className="btn-primary">
            Create Sales Order
          </button>
        </div>
      </form>

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

      <div className="admin-products-toolbar">
        <label className="admin-products-search">
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
                      <button type="button" className="btn-outline" onClick={() => handleSaveStatus(row.id)}>
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
