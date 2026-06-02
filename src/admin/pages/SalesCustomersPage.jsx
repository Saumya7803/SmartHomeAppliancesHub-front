import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { isSalesUser } from "../utils/roles";

const INITIAL_CUSTOMER_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "active",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function SalesCustomersPage() {
  const { token, user } = useAdminAuth();
  const salesOnlyMode = isSalesUser(user);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customerForm, setCustomerForm] = useState(INITIAL_CUSTOMER_FORM);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState(INITIAL_CUSTOMER_FORM);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadCustomers() {
      setLoading(true);
      setError("");
      try {
        const response = salesOnlyMode
          ? await adminApi.getAssignedCustomers(token)
          : await adminApi.getCustomers(token, user.role, search);
        if (!ignore) {
          setCustomers(response.customers || []);
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

    loadCustomers();

    return () => {
      ignore = true;
    };
  }, [token, user.role, search, reloadKey, salesOnlyMode]);

  const handleCreateCustomer = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await adminApi.createCustomer(token, user.role, {
        ...customerForm,
        email: customerForm.email.trim().toLowerCase(),
      });
      setCustomerForm(INITIAL_CUSTOMER_FORM);
      setMessage("Customer profile created");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const openEditModal = (row) => {
    setEditingCustomer(row);
    setEditForm({
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      company: row.company || "",
      status: row.status || "active",
    });
  };

  const handleSaveCustomer = async (event) => {
    event.preventDefault();
    if (!editingCustomer) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await adminApi.updateCustomer(token, user.role, editingCustomer.id, {
        ...editForm,
        email: editForm.email.trim().toLowerCase(),
      });
      setEditingCustomer(null);
      setMessage("Customer information updated");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section>
      <h2>{salesOnlyMode ? "Assigned Customers" : "Customers"}</h2>
      <p>
        {salesOnlyMode
          ? "View customers currently assigned to your enquiry pipeline."
          : "Create customer profiles, review customer value, and update customer information."}
      </p>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      {!salesOnlyMode ? (
        <form className="admin-form-grid" onSubmit={handleCreateCustomer}>
          <label>
            Name
            <input
              value={customerForm.name}
              onChange={(event) => setCustomerForm((value) => ({ ...value, name: event.target.value }))}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={customerForm.email}
              onChange={(event) => setCustomerForm((value) => ({ ...value, email: event.target.value }))}
              required
            />
          </label>

          <label>
            Phone
            <input
              value={customerForm.phone}
              onChange={(event) => setCustomerForm((value) => ({ ...value, phone: event.target.value }))}
            />
          </label>

          <label>
            Company
            <input
              value={customerForm.company}
              onChange={(event) => setCustomerForm((value) => ({ ...value, company: event.target.value }))}
            />
          </label>

          <label>
            Status
            <select
              value={customerForm.status}
              onChange={(event) => setCustomerForm((value) => ({ ...value, status: event.target.value }))}
            >
              <option value="lead">lead</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </label>

          <div className="admin-form-actions">
            <button type="submit" className="btn-primary">
              Create Customer
            </button>
          </div>
        </form>
      ) : null}

      {!salesOnlyMode ? (
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
      ) : null}

      {loading ? <p>Loading customers...</p> : null}

      {!loading ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              {salesOnlyMode ? (
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Enquiries</th>
                  <th>Last Activity</th>
                </tr>
              ) : (
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Orders</th>
                  <th>Lifetime Value</th>
                  <th>Last Order</th>
                  <th>Action</th>
                </tr>
              )}
            </thead>
            <tbody>
              {customers.map((row) =>
                salesOnlyMode ? (
                  <tr key={row.customer_key || row.email}>
                    <td>{row.customer_name || "-"}</td>
                    <td>{row.email}</td>
                    <td>{row.phone || "-"}</td>
                    <td>{row.enquiry_count || 0}</td>
                    <td>{row.last_activity_at ? new Date(row.last_activity_at).toLocaleString() : "-"}</td>
                  </tr>
                ) : (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.email}</td>
                    <td>{row.phone || "-"}</td>
                    <td>{row.company || "-"}</td>
                    <td>{row.status}</td>
                    <td>{row.order_count || 0}</td>
                    <td>{formatCurrency(row.lifetime_value)}</td>
                    <td>{row.last_order_at ? new Date(row.last_order_at).toLocaleString() : "No orders"}</td>
                    <td>
                      <button type="button" className="btn-outline" onClick={() => openEditModal(row)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              )}
              {!customers.length ? (
                <tr>
                  <td colSpan={salesOnlyMode ? 5 : 9}>No customers found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      {editingCustomer && !salesOnlyMode ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Edit customer">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>Update Customer</h3>
              <button type="button" className="modal-close-btn" onClick={() => setEditingCustomer(null)}>
                x
              </button>
            </div>
            <form className="enterprise-modal-content" onSubmit={handleSaveCustomer}>
              <label className="enterprise-brand-modal-field">
                Name
                <input
                  value={editForm.name}
                  onChange={(event) => setEditForm((value) => ({ ...value, name: event.target.value }))}
                  required
                />
              </label>
              <label className="enterprise-brand-modal-field">
                Email
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm((value) => ({ ...value, email: event.target.value }))}
                  required
                />
              </label>
              <label className="enterprise-brand-modal-field">
                Phone
                <input
                  value={editForm.phone}
                  onChange={(event) => setEditForm((value) => ({ ...value, phone: event.target.value }))}
                />
              </label>
              <label className="enterprise-brand-modal-field">
                Company
                <input
                  value={editForm.company}
                  onChange={(event) => setEditForm((value) => ({ ...value, company: event.target.value }))}
                />
              </label>
              <label className="enterprise-brand-modal-field">
                Status
                <select
                  value={editForm.status}
                  onChange={(event) => setEditForm((value) => ({ ...value, status: event.target.value }))}
                >
                  <option value="lead">lead</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </label>
              <div className="enterprise-brand-add-actions">
                <button type="button" className="btn-outline" onClick={() => setEditingCustomer(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
