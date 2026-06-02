import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

const PAGE_SIZE = 10;

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return parsed.toLocaleString();
}

export default function AdminBrandsPage() {
  const { token } = useAdminAuth();
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [brandForm, setBrandForm] = useState({ name: "", description: "" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadBrands() {
      setLoading(true);
      setError("");
      try {
        const response = await adminApi.getBrands(token, search);
        if (!ignore) {
          setBrands(response.brands || []);
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

    loadBrands();
    return () => {
      ignore = true;
    };
  }, [token, search, reloadKey]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(brands.length / PAGE_SIZE)), [brands.length]);
  const safePage = Math.min(page, totalPages);

  const paginatedBrands = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return brands.slice(start, start + PAGE_SIZE);
  }, [brands, safePage]);

  const handleCreateBrand = async (event) => {
    event.preventDefault();
    const name = brandForm.name.trim();
    if (!name) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await adminApi.createBrand(token, {
        name,
        description: brandForm.description.trim() || null,
      });
      setMessage(response.message || "Brand created");
      setBrandForm({ name: "", description: "" });
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h2>Brands</h2>
      <p>Manage product brands used for filtering, catalog pages, and sales operations.</p>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <form className="admin-form-grid" onSubmit={handleCreateBrand}>
        <label>
          Brand Name
          <input
            value={brandForm.name}
            onChange={(event) => setBrandForm((value) => ({ ...value, name: event.target.value }))}
            placeholder="e.g. Panasonic"
            required
          />
        </label>
        <label>
          Description (Optional)
          <input
            value={brandForm.description}
            onChange={(event) => setBrandForm((value) => ({ ...value, description: event.target.value }))}
            placeholder="Short brand description"
          />
        </label>
        <div className="admin-form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Create Brand"}
          </button>
        </div>
      </form>

      <div className="admin-products-toolbar">
        <label className="admin-products-search">
          Search Brands
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search brand name"
          />
        </label>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Brand Name</th>
              <th>Description</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4">Loading brands...</td>
              </tr>
            ) : null}
            {!loading
              ? paginatedBrands.map((brand) => (
                  <tr key={brand.id}>
                    <td>{brand.id}</td>
                    <td>{brand.name}</td>
                    <td>{brand.description || "-"}</td>
                    <td>{formatDate(brand.created_at || brand.createdAt)}</td>
                  </tr>
                ))
              : null}
            {!loading && !paginatedBrands.length ? (
              <tr>
                <td colSpan="4">No brands found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="admin-products-pagination">
        <p>
          Page {safePage} of {totalPages} ({brands.length} total brands)
        </p>
        <div>
          <button
            type="button"
            className="btn-outline"
            disabled={safePage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className="btn-outline"
            disabled={safePage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
