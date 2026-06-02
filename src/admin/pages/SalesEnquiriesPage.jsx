import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { canApproveQuotations, isSalesUser } from "../utils/roles";

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ["new", "contacted", "quoted", "closed"];

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString();
}

function formatStatus(status) {
  const normalized = String(status || "new").toLowerCase();
  if (normalized === "contacted") return "Contacted";
  if (normalized === "quoted") return "Quoted";
  if (normalized === "closed") return "Closed";
  return "New";
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

function getDefaultValidUntil() {
  const next = new Date();
  next.setDate(next.getDate() + 7);
  return next.toISOString().slice(0, 10);
}

export default function SalesEnquiriesPage() {
  const { token, user } = useAdminAuth();
  const isSales = isSalesUser(user);
  const canApprove = canApproveQuotations(user);

  const [enquiries, setEnquiries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [mineOnly, setMineOnly] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [quoteEnquiry, setQuoteEnquiry] = useState(null);
  const [quotationDraft, setQuotationDraft] = useState({
    product_name: "",
    price: "",
    quantity: "1",
    discount: "0",
    valid_until: getDefaultValidUntil(),
    notes: "",
  });
  const [quotationResult, setQuotationResult] = useState(null);
  const [savingQuote, setSavingQuote] = useState(false);
  const [sendingQuote, setSendingQuote] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadEnquiries() {
      setLoading(true);
      setError("");
      try {
        const response = await adminApi.getEnquiries(token, {
          search,
          status: statusFilter,
          page: pagination.page,
          pageSize: PAGE_SIZE,
          mine: mineOnly,
        });

        if (!ignore) {
          setEnquiries(response.enquiries || []);
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

    loadEnquiries();

    return () => {
      ignore = true;
    };
  }, [token, search, statusFilter, pagination.page, mineOnly, reloadKey]);

  const summary = useMemo(
    () => ({
      total: pagination.total || enquiries.length,
      newCount: enquiries.filter((row) => row.status === "new").length,
      quotedCount: enquiries.filter((row) => row.status === "quoted").length,
      closedCount: enquiries.filter((row) => row.status === "closed").length,
    }),
    [pagination.total, enquiries]
  );

  const resetQuoteModal = () => {
    setQuoteEnquiry(null);
    setQuotationResult(null);
    setQuotationDraft({
      product_name: "",
      price: "",
      quantity: "1",
      discount: "0",
      valid_until: getDefaultValidUntil(),
      notes: "",
    });
  };

  const handleOpenEnquiry = async (enquiryId) => {
    setError("");
    try {
      const response = await adminApi.getEnquiryById(token, enquiryId);
      setSelectedEnquiry(response.enquiry || null);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleUpdateStatus = async (enquiryId, status) => {
    setError("");
    setMessage("");
    try {
      await adminApi.updateEnquiryStatus(token, enquiryId, status);
      setMessage(`Enquiry marked as ${formatStatus(status)}`);
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleOpenQuotation = (enquiry) => {
    setQuoteEnquiry(enquiry);
    setQuotationResult(null);
    setQuotationDraft({
      product_name: enquiry.product_name || "",
      price: "",
      quantity: String(enquiry.quantity || 1),
      discount: "0",
      valid_until: getDefaultValidUntil(),
      notes: "",
    });
  };

  const handleCreateQuotation = async (event) => {
    event.preventDefault();
    if (!quoteEnquiry) {
      return;
    }

    setSavingQuote(true);
    setError("");
    setMessage("");
    try {
      const response = await adminApi.createQuotationFromEnquiry(token, quoteEnquiry.id, {
        product_name: quotationDraft.product_name.trim(),
        price: Number(quotationDraft.price),
        quantity: Number(quotationDraft.quantity),
        discount: Number(quotationDraft.discount || 0),
        valid_until: quotationDraft.valid_until,
        notes: quotationDraft.notes.trim() || null,
      });

      setQuotationResult(response);
      setMessage(response.message || "Quotation created");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingQuote(false);
    }
  };

  const handleSendQuotation = async () => {
    const quotationId = quotationResult?.quotation?.id;
    if (!quotationId) {
      return;
    }

    setSendingQuote(true);
    setError("");
    setMessage("");
    try {
      const response = await adminApi.sendQuotation(token, quotationId);
      setMessage(response.message || "Quotation email sent");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSendingQuote(false);
    }
  };

  return (
    <section className="sales-enquiries-page">
      <header>
        <h2>Sales Enquiries</h2>
        <p>Track incoming quote requests and convert enquiries into quotations.</p>
      </header>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <p>Total Enquiries</p>
          <h3>{summary.total}</h3>
        </article>
        <article className="admin-stat-card">
          <p>New</p>
          <h3>{summary.newCount}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Quoted</p>
          <h3>{summary.quotedCount}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Closed</p>
          <h3>{summary.closedCount}</h3>
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
            placeholder="Customer, product, phone, or email"
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
        {isSales ? (
          <label>
            Scope
            <select
              value={mineOnly ? "mine" : "all"}
              onChange={(event) => {
                setPagination((value) => ({ ...value, page: 1 }));
                setMineOnly(event.target.value === "mine");
              }}
            >
              <option value="all">All Visible</option>
              <option value="mine">My Assigned</option>
            </select>
          </label>
        ) : (
          <label>
            Scope
            <select disabled>
              <option>All Enquiries</option>
            </select>
          </label>
        )}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Enquiry ID</th>
              <th>Customer Name</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Contact Details</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading enquiries...</td>
              </tr>
            ) : null}
            {!loading
              ? enquiries.map((enquiry) => (
                  <tr key={enquiry.id}>
                    <td>{enquiry.enquiry_code || `ENQ-${enquiry.id}`}</td>
                    <td>{enquiry.customer_name}</td>
                    <td>{enquiry.product_name}</td>
                    <td>{enquiry.quantity}</td>
                    <td>
                      {enquiry.email}
                      <br />
                      <small>{enquiry.phone}</small>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${enquiry.status || "pending"}`}>
                        {formatStatus(enquiry.status)}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-row">
                        <button type="button" className="btn-outline" onClick={() => handleOpenEnquiry(enquiry.id)}>
                          View
                        </button>
                        <button type="button" className="btn-primary" onClick={() => handleOpenQuotation(enquiry)}>
                          Create Quotation
                        </button>
                        <button
                          type="button"
                          className="btn-outline"
                          disabled={enquiry.status === "contacted"}
                          onClick={() => handleUpdateStatus(enquiry.id, "contacted")}
                        >
                          Mark Contacted
                        </button>
                        <button
                          type="button"
                          className="btn-reject"
                          disabled={enquiry.status === "closed"}
                          onClick={() => handleUpdateStatus(enquiry.id, "closed")}
                        >
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              : null}
            {!loading && !enquiries.length ? (
              <tr>
                <td colSpan="7">No enquiries found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="admin-products-pagination">
        <p>
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} total enquiries)
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

      {selectedEnquiry ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Enquiry details">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>Enquiry Details</h3>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedEnquiry(null)}>
                x
              </button>
            </div>
            <div className="enterprise-modal-content">
              <p>
                <strong>Enquiry ID:</strong> {selectedEnquiry.enquiry_code || `ENQ-${selectedEnquiry.id}`}
              </p>
              <p>
                <strong>Customer:</strong> {selectedEnquiry.customer_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedEnquiry.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedEnquiry.phone}
              </p>
              <p>
                <strong>Product:</strong> {selectedEnquiry.product_name}
              </p>
              <p>
                <strong>Quantity:</strong> {selectedEnquiry.quantity}
              </p>
              <p>
                <strong>Status:</strong> {formatStatus(selectedEnquiry.status)}
              </p>
              <p>
                <strong>Created At:</strong> {formatDateTime(selectedEnquiry.created_at)}
              </p>
              <p>
                <strong>Message:</strong> {selectedEnquiry.message || "No message provided."}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {quoteEnquiry ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Create quotation">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>Create Quotation</h3>
              <button type="button" className="modal-close-btn" onClick={resetQuoteModal}>
                x
              </button>
            </div>
            <form className="enterprise-modal-content" onSubmit={handleCreateQuotation}>
              <label className="enterprise-brand-modal-field">
                Product
                <input
                  value={quotationDraft.product_name}
                  onChange={(event) =>
                    setQuotationDraft((value) => ({ ...value, product_name: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="enterprise-brand-modal-field">
                Price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={quotationDraft.price}
                  onChange={(event) => setQuotationDraft((value) => ({ ...value, price: event.target.value }))}
                  required
                />
              </label>
              <label className="enterprise-brand-modal-field">
                Quantity
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quotationDraft.quantity}
                  onChange={(event) => setQuotationDraft((value) => ({ ...value, quantity: event.target.value }))}
                  required
                />
              </label>
              <label className="enterprise-brand-modal-field">
                Discount (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={quotationDraft.discount}
                  onChange={(event) => setQuotationDraft((value) => ({ ...value, discount: event.target.value }))}
                />
              </label>
              <label className="enterprise-brand-modal-field">
                Valid Until
                <input
                  type="date"
                  value={quotationDraft.valid_until}
                  onChange={(event) =>
                    setQuotationDraft((value) => ({ ...value, valid_until: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="enterprise-brand-modal-field">
                Notes
                <textarea
                  rows={3}
                  value={quotationDraft.notes}
                  onChange={(event) => setQuotationDraft((value) => ({ ...value, notes: event.target.value }))}
                />
              </label>

              <div className="enterprise-brand-add-actions">
                <button type="button" className="btn-outline" onClick={resetQuoteModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingQuote}>
                  {savingQuote ? "Creating..." : "Create Quotation"}
                </button>
              </div>

              {quotationResult?.quotation ? (
                <div className="sales-quotation-result">
                  <p>
                    Quotation <strong>{quotationResult.quotation.quotation_number}</strong> created.
                  </p>
                  {quotationResult.requiresApproval ? (
                    <p className="admin-muted">
                      This quotation requires Super Admin/Admin approval before email send.
                    </p>
                  ) : null}
                  <div className="enterprise-brand-add-actions">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() =>
                        quotationResult.pdf_base64
                          ? downloadPdfFromBase64(
                              quotationResult.pdf_base64,
                              `${quotationResult.quotation.quotation_number}.pdf`
                            )
                          : null
                      }
                      disabled={!quotationResult.pdf_base64}
                    >
                      Download PDF
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleSendQuotation}
                      disabled={
                        sendingQuote ||
                        (!canApprove &&
                          quotationResult.quotation.quotation_status !== "approved" &&
                          quotationResult.quotation.quotation_status !== "sent")
                      }
                    >
                      {sendingQuote ? "Sending..." : "Send Quotation Email"}
                    </button>
                  </div>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
