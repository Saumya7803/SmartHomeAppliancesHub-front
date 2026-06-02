import { useEffect, useMemo, useState } from "react";
import { getAdminSession } from "../utils/adminAuth";
import { brandApi } from "../utils/brandApi";

const BRAND_LOGO_MAX_SIZE_BYTES = 700 * 1024;
const INITIAL_BRAND_FORM = {
  name: "",
  logo: "",
  description: "",
};

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export default function BrandsPage() {
  const session = getAdminSession();
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandForm, setBrandForm] = useState(INITIAL_BRAND_FORM);

  const loadBrands = async (searchValue = "") => {
    const response = await brandApi.listBrands(searchValue);
    setBrands(response.brands || []);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchBrands() {
      setLoading(true);
      setError("");

      try {
        const response = await brandApi.listBrands(searchTerm);
        if (!isMounted) {
          return;
        }

        setBrands(response.brands || []);
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || "Failed to load brands");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const timeoutId = setTimeout(fetchBrands, 200);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const sortedBrands = useMemo(
    () => [...brands].sort((left, right) => left.name.localeCompare(right.name)),
    [brands]
  );

  const openCreateModal = () => {
    setEditingBrand(null);
    setBrandForm(INITIAL_BRAND_FORM);
    setBrandModalOpen(true);
    setError("");
    setMessage("");
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name || "",
      logo: brand.logo || "",
      description: brand.description || "",
    });
    setBrandModalOpen(true);
    setError("");
    setMessage("");
  };

  const closeBrandModal = () => {
    setBrandModalOpen(false);
    setEditingBrand(null);
    setBrandForm(INITIAL_BRAND_FORM);
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > BRAND_LOGO_MAX_SIZE_BYTES) {
      setError("Logo file is too large. Keep it under 700 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBrandForm((current) => ({
        ...current,
        logo: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBrand = async () => {
    const name = brandForm.name.trim();
    if (!name) {
      setError("Brand name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingBrand) {
        await brandApi.updateBrand(editingBrand.id, {
          name,
          logo: brandForm.logo || null,
          description: brandForm.description.trim() || null,
        });
        setMessage("Brand updated.");
      } else {
        await brandApi.createBrand({
          name,
          logo: brandForm.logo || null,
          description: brandForm.description.trim() || null,
        });
        setMessage("Brand created.");
      }

      await loadBrands(searchTerm);
      closeBrandModal();
    } catch (requestError) {
      setError(requestError.message || "Failed to save brand");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async (brand) => {
    const confirmed = window.confirm(`Delete brand "${brand.name}"?`);
    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await brandApi.deleteBrand(brand.id);
      setMessage("Brand deleted.");
      await loadBrands(searchTerm);
    } catch (requestError) {
      setError(requestError.message || "Failed to delete brand");
    }
  };

  if (!user || !isAdmin) {
    return (
      <section className="admin-panel-section">
        <div className="empty-state">
          <h3>Access Restricted</h3>
          <p>Only admins can manage brands.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-panel-section products-management-page">
      <header className="enterprise-card-head">
        <div>
          <h2>Brand Management</h2>
          <p>Manage approved brands for product catalog and selector dropdown.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openCreateModal}>
          Add Brand
        </button>
      </header>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <section className="enterprise-card">
        <div className="enterprise-filters enterprise-brand-filters">
          <label>
            Search Brand
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or description"
            />
          </label>
        </div>

        {loading ? (
          <p>Loading brands...</p>
        ) : (
          <div className="admin-table-wrap enterprise-table-wrap">
            <table className="admin-table enterprise-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedBrands.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      {brand.logo ? (
                        <div className="enterprise-brand-logo">
                          <img src={brand.logo} alt={`${brand.name} logo`} />
                        </div>
                      ) : (
                        <span className="admin-muted">No logo</span>
                      )}
                    </td>
                    <td>{brand.name}</td>
                    <td>{brand.slug}</td>
                    <td>{brand.description || "-"}</td>
                    <td>{formatDate(brand.created_at || brand.createdAt)}</td>
                    <td>
                      <div className="enterprise-brand-actions">
                        <button type="button" className="btn-outline" onClick={() => openEditModal(brand)}>
                          Edit
                        </button>
                        <button type="button" className="btn-reject" onClick={() => handleDeleteBrand(brand)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!sortedBrands.length ? (
                  <tr>
                    <td colSpan="6">No brands found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {brandModalOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Brand editor">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>{editingBrand ? "Edit Brand" : "Add New Brand"}</h3>
              <button type="button" className="modal-close-btn" onClick={closeBrandModal}>
                x
              </button>
            </div>

            <div className="enterprise-modal-content">
              <label className="enterprise-brand-modal-field">
                Brand Name
                <input
                  type="text"
                  value={brandForm.name}
                  onChange={(event) => setBrandForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Brand name"
                  maxLength={120}
                />
              </label>

              <label className="enterprise-brand-modal-field">
                Brand Logo (optional)
                <input type="file" accept="image/*" onChange={handleLogoUpload} />
              </label>

              {brandForm.logo ? (
                <div className="enterprise-image-preview">
                  <img src={brandForm.logo} alt="Brand logo preview" />
                </div>
              ) : null}

              <label className="enterprise-brand-modal-field">
                Description (optional)
                <textarea
                  rows={3}
                  value={brandForm.description}
                  onChange={(event) =>
                    setBrandForm((current) => ({ ...current, description: event.target.value }))
                  }
                  maxLength={2000}
                />
              </label>

              <div className="enterprise-brand-add-actions">
                <button type="button" className="btn-primary" onClick={handleSaveBrand} disabled={saving}>
                  {saving ? "Saving..." : editingBrand ? "Update Brand" : "Create Brand"}
                </button>
                <button type="button" className="btn-outline" onClick={closeBrandModal} disabled={saving}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
