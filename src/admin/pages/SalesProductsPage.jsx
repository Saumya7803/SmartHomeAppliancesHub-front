import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

export default function SalesProductsPage() {
  const { token, user } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      setLoading(true);
      setError("");
      try {
        const response = await adminApi.getProducts(token, user.role);
        if (!ignore) {
          setProducts(response.products || []);
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

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [token, user.role]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return products;
    }

    return products.filter((row) =>
      [row.name, row.model, row.brand, row.category].join(" ").toLowerCase().includes(term)
    );
  }, [products, search]);

  const lowStock = filteredProducts.filter((row) => Number(row.stock_quantity || 0) <= 10).length;

  return (
    <section>
      <h2>Products</h2>
      <p>View product catalog, details, and stock-linked sales readiness.</p>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <p>Total Products</p>
          <h3>{filteredProducts.length}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Low Stock Items</p>
          <h3>{lowStock}</h3>
        </article>
      </div>

      <div className="admin-form-grid">
        <label className="span-2">
          Search Products
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product, model, category, or brand"
          />
        </label>
      </div>

      {loading ? <p>Loading products...</p> : null}

      {!loading ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Model</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Updated</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>{row.model}</td>
                  <td>{row.category || "-"}</td>
                  <td>{row.brand || "-"}</td>
                  <td>{Number(row.stock_quantity || 0)}</td>
                  <td>{formatCurrency(row.price)}</td>
                  <td>{formatDateTime(row.updated_at)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => window.open(`/products/${row.id}`, "_blank", "noopener,noreferrer")}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredProducts.length ? (
                <tr>
                  <td colSpan="9">No products found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
