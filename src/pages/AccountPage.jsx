import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { customerApiClient } from "../customer/api/client";
import { useCustomerAuth } from "../customer/hooks/useCustomerAuth";

const SECTION_KEYS = ["profile", "orders", "quotations", "saved", "settings"];

function normalizeSection(value, fallback = "profile") {
  return SECTION_KEYS.includes(value) ? value : fallback;
}

export default function AccountPage({ initialSection = "profile" }) {
  const location = useLocation();
  const { token, customer, refreshCustomer } = useCustomerAuth();
  const [section, setSection] = useState(() =>
    normalizeSection(location.state?.section || initialSection, "profile")
  );
  const [accountData, setAccountData] = useState({
    profile: null,
    orders: [],
    quotations: [],
    savedProducts: [],
  });
  const [profileForm, setProfileForm] = useState({
    fullName: customer?.name || "",
    companyName: customer?.company || "",
    phoneNumber: customer?.phone || "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setSection(normalizeSection(location.state?.section || initialSection, "profile"));
  }, [initialSection, location.state]);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        setIsLoading(true);
        setError("");
        const response = await customerApiClient.getAccount(token);
        if (ignore) {
          return;
        }

        setAccountData({
          profile: response.profile || null,
          orders: response.orders || [],
          quotations: response.quotations || [],
          savedProducts: response.savedProducts || [],
        });

        setProfileForm({
          fullName: response.profile?.name || customer?.name || "",
          companyName: response.profile?.company || customer?.company || "",
          phoneNumber: response.profile?.phone || customer?.phone || "",
        });
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Failed to load account details.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (token) {
      loadData();
    }

    return () => {
      ignore = true;
    };
  }, [token, customer?.company, customer?.name, customer?.phone]);

  const summary = useMemo(
    () => ({
      orders: accountData.orders.length,
      quotes: accountData.quotations.length,
      saved: accountData.savedProducts.length,
    }),
    [accountData.orders.length, accountData.quotations.length, accountData.savedProducts.length]
  );

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await customerApiClient.updateProfile(token, profileForm);
      setAccountData((current) => ({
        ...current,
        profile: response.profile,
      }));
      await refreshCustomer();
      setSuccess("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderOrders = () => {
    if (!accountData.orders.length) {
      return <p className="customer-muted">No orders yet.</p>;
    }

    return (
      <div className="customer-table-wrap">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Total</th>
              <th>Status</th>
              <th>Support</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {accountData.orders.map((order) => (
              <tr key={order.id}>
                <td>{order.order_number}</td>
                <td>INR {Number(order.total_amount || 0).toLocaleString("en-IN")}</td>
                <td>{order.status}</td>
                <td>{order.support_status}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderQuotations = () => {
    if (!accountData.quotations.length) {
      return <p className="customer-muted">No quotations requested yet.</p>;
    }

    return (
      <div className="customer-table-wrap">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Quotation</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Status</th>
              <th>Valid Until</th>
            </tr>
          </thead>
          <tbody>
            {accountData.quotations.map((quote) => (
              <tr key={quote.id}>
                <td>{quote.quotation_number || `QTN-${quote.id}`}</td>
                <td>{quote.product_name}</td>
                <td>{quote.quantity}</td>
                <td>INR {Number(quote.total_amount || 0).toLocaleString("en-IN")}</td>
                <td>{quote.quotation_status}</td>
                <td>{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSavedProducts = () => {
    if (!accountData.savedProducts.length) {
      return (
        <p className="customer-muted">
          No saved products yet. <Link to="/products">Browse products</Link>
        </p>
      );
    }

    return (
      <div className="customer-saved-grid">
        {accountData.savedProducts.map((product) => (
          <article key={product.id} className="customer-saved-card">
            <h3>{product.name}</h3>
            <p>{product.model}</p>
            <p>{product.category} | {product.brand}</p>
            <strong>INR {Number(product.price || 0).toLocaleString("en-IN")}</strong>
          </article>
        ))}
      </div>
    );
  };

  const renderProfile = () => (
    <div className="customer-profile-grid">
      <article className="customer-summary-card">
        <h3>Profile Information</h3>
        <p><strong>Name:</strong> {accountData.profile?.name || customer?.name}</p>
        <p><strong>Company:</strong> {accountData.profile?.company || "-"}</p>
        <p><strong>Email:</strong> {accountData.profile?.email || customer?.email}</p>
        <p><strong>Phone:</strong> {accountData.profile?.phone || "-"}</p>
      </article>

      <article className="customer-summary-card">
        <h3>Activity Summary</h3>
        <p><strong>Orders:</strong> {summary.orders}</p>
        <p><strong>Quotations:</strong> {summary.quotes}</p>
        <p><strong>Saved Products:</strong> {summary.saved}</p>
      </article>
    </div>
  );

  if (isLoading) {
    return (
      <main className="container section-padded">
        <div className="empty-state">
          <h1>Loading customer dashboard...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="customer-account-page section-padded">
      <div className="container customer-account-layout">
        <aside className="customer-account-sidebar">
          <h1>My Account</h1>
          <button type="button" onClick={() => setSection("profile")} className={section === "profile" ? "active" : ""}>My Profile</button>
          <button type="button" onClick={() => setSection("orders")} className={section === "orders" ? "active" : ""}>My Orders</button>
          <button type="button" onClick={() => setSection("quotations")} className={section === "quotations" ? "active" : ""}>My Quotations</button>
          <button type="button" onClick={() => setSection("saved")} className={section === "saved" ? "active" : ""}>Saved Products</button>
          <button type="button" onClick={() => setSection("settings")} className={section === "settings" ? "active" : ""}>Account Settings</button>
        </aside>

        <section className="customer-account-content">
          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          {section === "profile" ? renderProfile() : null}
          {section === "orders" ? renderOrders() : null}
          {section === "quotations" ? renderQuotations() : null}
          {section === "saved" ? renderSavedProducts() : null}

          {section === "settings" ? (
            <article className="customer-settings-card">
              <h2>Account Settings</h2>
              <p className="customer-muted">Update your profile for quotation and order communication.</p>

              <form className="customer-auth-form" onSubmit={handleProfileSave}>
                <label>
                  Full Name
                  <input
                    type="text"
                    name="fullName"
                    value={profileForm.fullName}
                    onChange={handleProfileChange}
                    required
                  />
                </label>
                <label>
                  Company Name
                  <input
                    type="text"
                    name="companyName"
                    value={profileForm.companyName}
                    onChange={handleProfileChange}
                  />
                </label>
                <label>
                  Phone Number
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileForm.phoneNumber}
                    onChange={handleProfileChange}
                    required
                  />
                </label>
                <button type="submit" className="customer-btn-primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </article>
          ) : null}
        </section>
      </div>
    </main>
  );
}
