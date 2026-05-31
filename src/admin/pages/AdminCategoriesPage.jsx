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

export default function AdminCategoriesPage() {
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadCategories() {
      setLoading(true);
      setError("");
      try {
        const response = await adminApi.getCategories(token, search);
        if (!ignore) {
          setCategories(response.categories || []);
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

    loadCategories();
    return () => {
      ignore = true;
    };
  }, [token, search, reloadKey]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(categories.length / PAGE_SIZE)),
    [categories.length]
  );
  const safePage = Math.min(page, totalPages);

  const paginatedCategories = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return categories.slice(start, start + PAGE_SIZE);
  }, [categories, safePage]);

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    const name = newCategory.trim();
    if (!name) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await adminApi.createCategory(token, { name });
      setMessage(response.message || "Category created");
      setNewCategory("");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h2>Categories</h2>
      <p>Manage product categories used in admin and frontend catalog tables.</p>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <form className="admin-form-grid" onSubmit={handleCreateCategory}>
        <label>
          Add Category
          <input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="e.g. Smart Lighting"
            required
          />
        </label>
        <div className="admin-form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Create Category"}
          </button>
        </div>
      </form>

      <div className="admin-products-toolbar">
        <label className="admin-products-search">
          Search Categories
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search category name"
          />
        </label>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3">Loading categories...</td>
              </tr>
            ) : null}
            {!loading
              ? paginatedCategories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{formatDate(category.created_at || category.createdAt)}</td>
                  </tr>
                ))
              : null}
            {!loading && !paginatedCategories.length ? (
              <tr>
                <td colSpan="3">No categories found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="admin-products-pagination">
        <p>
          Page {safePage} of {totalPages} ({categories.length} total categories)
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
