import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function CustomersPage() {
  const { token, user } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadCustomers() {
      try {
        setError("");
        const response = await adminApi.getCustomers(token, user.role, search);
        if (!ignore) {
          setCustomers(response.customers || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadCustomers();

    return () => {
      ignore = true;
    };
  }, [token, user.role, search]);

  return (
    <section>
      <h2>Customers</h2>
      <p>Browse customer accounts, recent activity, and commercial value at a glance.</p>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-form-grid">
        <label className="span-2">
          Search Customers
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Customer name, email, or company"
          />
        </label>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Status</th>
              <th>Orders</th>
              <th>Lifetime Value</th>
              <th>Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.company || "-"}</td>
                <td>{row.status}</td>
                <td>{row.order_count || 0}</td>
                <td>{formatCurrency(row.lifetime_value)}</td>
                <td>{row.last_order_at ? new Date(row.last_order_at).toLocaleString() : "No orders"}</td>
              </tr>
            ))}
            {!customers.length ? (
              <tr>
                <td colSpan="7">No customers found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
