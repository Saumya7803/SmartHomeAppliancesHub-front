import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { canApproveQuotations } from "../utils/roles";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ["pending_approval", "approved", "sent", "expired", "rejected", "draft"];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return parsed.toLocaleDateString();
}

function formatStatus(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "pending_approval") return "Pending Approval";
  if (normalized === "approved") return "Approved";
  if (normalized === "sent") return "Sent";
  if (normalized === "expired") return "Expired";
  if (normalized === "rejected") return "Rejected";
  return "Draft";
}

function downloadPdfFromBase64(base64Value, filename) {
  const byteCharacters = atob(base64Value);
  const byteNumbers = new Array(byteCharacters.length);
  for (let index = 0; index < byteCharacters.length; index += 1) {
    byteNumbers[index] = byteCharacters.charCodeAt(index);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export default function SalesQuotationsPage() {
  const { token, user } = useAdminAuth();
  const canApprove = canApproveQuotations(user);

  const [quotations, setQuotations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadQuotations() {
      setLoading(true);
      setError("");
      try {
        const response = await adminApi.getQuotations(token, {
          search,
          status: statusFilter,
          page: pagination.page,
          pageSize: PAGE_SIZE,
        });

        if (!ignore) {
          setQuotations(response.quotations || []);
          setPagination((current) => ({
            ...current,
            ...(response.pagination || current),
          }));
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

    loadQuotations();

    return () => {
      ignore = true;
    };
  }, [token, search, statusFilter, pagination.page, reloadKey]);

  const summary = useMemo(
    () => ({
      total: pagination.total || quotations.length,
      pendingApproval: quotations.filter((row) => row.quotation_status === "pending_approval").length,
      approved: quotations.filter((row) => row.quotation_status === "approved").length,
      sent: quotations.filter((row) => row.quotation_status === "sent").length,
    }),
    [pagination.total, quotations]
  );

  const handleViewQuotation = async (quotationId) => {
    setError("");
    try {
      const response = await adminApi.getQuotationById(token, quotationId);
      setViewingQuotation(response.quotation || null);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleDownloadPdf = async (quotation) => {
    setDownloadingId(quotation.id);
    setError("");
    try {
      const response = await adminApi.getQuotationById(token, quotation.id, { includePdf: true });
      if (response.pdf_base64) {
        downloadPdfFromBase64(response.pdf_base64, `${quotation.quotation_number || `QTN-${quotation.id}`}.pdf`);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleApprove = async (quotationId) => {
    setActionLoadingId(quotationId);
    setError("");
    setMessage("");
    try {
      const response = await adminApi.approveQuotation(token, quotationId);
      setMessage(response.message || "Quotation approved");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSend = async (quotationId) => {
    setActionLoadingId(quotationId);
    setError("");
    setMessage("");
    try {
      const response = await adminApi.sendQuotation(token, quotationId);
      setMessage(response.message || "Quotation sent successfully");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <section className="sales-quotations-page">
      <header>
        <h2>Sales Quotations</h2>
        <p>Review quotation approvals, generate PDFs, and send proposals to customers.</p>
      </header>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <p>Total Quotations</p>
          <h3>{summary.total}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Pending Approval</p>
          <h3>{summary.pendingApproval}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Approved</p>
          <h3>{summary.approved}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Sent</p>
          <h3>{summary.sent}</h3>
        </article>
      </div>

      <div className="admin-products-toolbar">
        <label className="admin-products-search">
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setPagination((value) => ({ ...value, page: 1 }));
              setSearch(event.target.value);
            }}
            placeholder="Quotation number, customer, or product"
          />
        </label>
        <label>
          Status
          <select
            value={statusFilter}
            onChange={(event) => {
              setPagination((value) => ({ ...value, page: 1 }));
              setStatusFilter(event.target.value);
            }}
          >
            <option value="">All</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Quotation ID</th>
              <th>Customer Details</th>
              <th>Product</th>
              <th>Total Price</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading quotations...</td>
              </tr>
            ) : null}
            {!loading
              ? quotations.map((quotation) => (
                  <tr key={quotation.id}>
                    <td>{quotation.quotation_number || `QTN-${quotation.id}`}</td>
                    <td>
                      {quotation.customer_name}
                      <br />
                      <small>{quotation.customer_email}</small>
                    </td>
                    <td>
                      {quotation.product_name}
                      <br />
                      <small>Qty: {quotation.quantity}</small>
                    </td>
                    <td>{formatCurrency(quotation.total_amount)}</td>
                    <td>{formatDate(quotation.valid_until)}</td>
                    <td>
                      <span className={`admin-status-badge ${quotation.quotation_status || "pending"}`}>
                        {formatStatus(quotation.quotation_status)}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-row">
                        <button type="button" className="btn-outline" onClick={() => handleViewQuotation(quotation.id)}>
                          View
                        </button>
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => handleDownloadPdf(quotation)}
                          disabled={downloadingId === quotation.id}
                        >
                          {downloadingId === quotation.id ? "Downloading..." : "Download PDF"}
                        </button>
                        {canApprove ? (
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => handleApprove(quotation.id)}
                            disabled={
                              actionLoadingId === quotation.id ||
                              quotation.quotation_status === "approved" ||
                              quotation.quotation_status === "sent"
                            }
                          >
                            Approve
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleSend(quotation.id)}
                          disabled={actionLoadingId === quotation.id}
                        >
                          Send Email
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              : null}
            {!loading && !quotations.length ? (
              <tr>
                <td colSpan="7">No quotations found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="admin-products-pagination">
        <p>
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} total quotations)
        </p>
        <div>
          <button
            type="button"
            className="btn-outline"
            disabled={pagination.page <= 1}
            onClick={() => setPagination((value) => ({ ...value, page: Math.max(1, value.page - 1) }))}
          >
            Prev
          </button>
          <button
            type="button"
            className="btn-outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPagination((value) => ({ ...value, page: Math.min(value.totalPages, value.page + 1) }))
            }
          >
            Next
          </button>
        </div>
      </div>

      {viewingQuotation ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Quotation details">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>Quotation Details</h3>
              <button type="button" className="modal-close-btn" onClick={() => setViewingQuotation(null)}>
                x
              </button>
            </div>
            <div className="enterprise-modal-content">
              <p>
                <strong>Quotation ID:</strong> {viewingQuotation.quotation_number || `QTN-${viewingQuotation.id}`}
              </p>
              <p>
                <strong>Customer:</strong> {viewingQuotation.customer_name}
              </p>
              <p>
                <strong>Email:</strong> {viewingQuotation.customer_email}
              </p>
              <p>
                <strong>Product:</strong> {viewingQuotation.product_name}
              </p>
              <p>
                <strong>Quantity:</strong> {viewingQuotation.quantity}
              </p>
              <p>
                <strong>Unit Price:</strong> {formatCurrency(viewingQuotation.unit_price)}
              </p>
              <p>
                <strong>Discount:</strong> {Number(viewingQuotation.discount_percent || 0).toFixed(2)}%
              </p>
              <p>
                <strong>Total:</strong> {formatCurrency(viewingQuotation.total_amount)}
              </p>
              <p>
                <strong>Valid Until:</strong> {formatDate(viewingQuotation.valid_until)}
              </p>
              <p>
                <strong>Status:</strong> {formatStatus(viewingQuotation.quotation_status)}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
