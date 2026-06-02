import { useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

const INITIAL_INVOICE_FORM = {
  invoice_number: "",
  customer_id: "",
  order_id: "",
  total_amount: "",
  status: "issued",
  due_date: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function SalesInvoicesPage() {
  const { token, user } = useAdminAuth();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoiceForm, setInvoiceForm] = useState(INITIAL_INVOICE_FORM);
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
        const [invoiceResponse, customerResponse, orderResponse] = await Promise.all([
          adminApi.getInvoices(token, user.role, { search, status: statusFilter }),
          adminApi.getCustomers(token, user.role),
          adminApi.getOrders(token, user.role),
        ]);

        if (!ignore) {
          setInvoices(invoiceResponse.invoices || []);
          setCustomers(customerResponse.customers || []);
          setOrders(orderResponse.orders || []);
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

  const handleCreateInvoice = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await adminApi.createInvoice(token, user.role, {
        invoice_number: invoiceForm.invoice_number.trim(),
        customer_id: Number(invoiceForm.customer_id),
        order_id: invoiceForm.order_id ? Number(invoiceForm.order_id) : null,
        total_amount: Number(invoiceForm.total_amount),
        status: invoiceForm.status,
        due_date: invoiceForm.due_date || null,
      });

      setInvoiceForm(INITIAL_INVOICE_FORM);
      setMessage("Invoice created");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section>
      <h2>Invoices</h2>
      <p>Create invoices and track invoice status across sales operations.</p>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <form className="admin-form-grid" onSubmit={handleCreateInvoice}>
        <label>
          Invoice Number
          <input
            value={invoiceForm.invoice_number}
            onChange={(event) => setInvoiceForm((value) => ({ ...value, invoice_number: event.target.value }))}
            placeholder="INV-1101"
            required
          />
        </label>

        <label>
          Customer
          <select
            value={invoiceForm.customer_id}
            onChange={(event) => setInvoiceForm((value) => ({ ...value, customer_id: event.target.value }))}
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
          Linked Order (Optional)
          <select
            value={invoiceForm.order_id}
            onChange={(event) => setInvoiceForm((value) => ({ ...value, order_id: event.target.value }))}
          >
            <option value="">No linked order</option>
            {orders.map((row) => (
              <option key={row.id} value={row.id}>
                {row.order_number}
              </option>
            ))}
          </select>
        </label>

        <label>
          Invoice Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={invoiceForm.total_amount}
            onChange={(event) => setInvoiceForm((value) => ({ ...value, total_amount: event.target.value }))}
            required
          />
        </label>

        <label>
          Status
          <select
            value={invoiceForm.status}
            onChange={(event) => setInvoiceForm((value) => ({ ...value, status: event.target.value }))}
          >
            <option value="draft">draft</option>
            <option value="issued">issued</option>
            <option value="paid">paid</option>
            <option value="overdue">overdue</option>
          </select>
        </label>

        <label>
          Due Date
          <input
            type="date"
            value={invoiceForm.due_date}
            onChange={(event) => setInvoiceForm((value) => ({ ...value, due_date: event.target.value }))}
          />
        </label>

        <div className="admin-form-actions">
          <button type="submit" className="btn-primary">
            Create Invoice
          </button>
        </div>
      </form>

      <div className="admin-products-toolbar">
        <label className="admin-products-search">
          Search Invoices
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Invoice number, customer, or order number"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All</option>
            <option value="draft">draft</option>
            <option value="issued">issued</option>
            <option value="paid">paid</option>
            <option value="overdue">overdue</option>
          </select>
        </label>
      </div>

      {loading ? <p>Loading invoices...</p> : null}

      {!loading ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Order</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Issued</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((row) => (
                <tr key={row.id}>
                  <td>{row.invoice_number}</td>
                  <td>
                    {row.customer_name}
                    <br />
                    <small>{row.customer_email}</small>
                  </td>
                  <td>{row.order_number || "-"}</td>
                  <td>{formatCurrency(row.total_amount)}</td>
                  <td>{row.status}</td>
                  <td>{row.issued_at ? new Date(row.issued_at).toLocaleDateString() : "-"}</td>
                  <td>{row.due_date ? new Date(row.due_date).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
              {!invoices.length ? (
                <tr>
                  <td colSpan="7">No invoices found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
