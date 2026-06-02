import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

export default function InventoryPage() {
  const { token, user } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadInventory() {
      try {
        setError("");
        const response = await adminApi.getProducts(token, user.role);
        if (!ignore) {
          setProducts(response.products || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
        }
      }
    }

    loadInventory();

    return () => {
      ignore = true;
    };
  }, [token, user.role]);

  const metrics = useMemo(() => {
    const approved = products.filter((row) => row.status === "approved").length;
    const pending = products.filter((row) => row.status === "pending").length;
    const published = products.filter((row) => row.is_published).length;
    const unpublished = products.length - published;
    return {
      total: products.length,
      approved,
      pending,
      published,
      unpublished,
    };
  }, [products]);

  return (
    <section>
      <h2>Inventory</h2>
      <p>Monitor product catalog readiness and publication health.</p>
      {error ? <p className="form-error">{error}</p> : null}

      <div className="admin-stats-grid">
        <article className="admin-stat-card">
          <p>Total Products</p>
          <h3>{metrics.total}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Approved</p>
          <h3>{metrics.approved}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Pending Approval</p>
          <h3>{metrics.pending}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Published</p>
          <h3>{metrics.published}</h3>
        </article>
        <article className="admin-stat-card">
          <p>Unpublished</p>
          <h3>{metrics.unpublished}</h3>
        </article>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Model</th>
              <th>Brand</th>
              <th>Status</th>
              <th>Published</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 100).map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.model}</td>
                <td>{row.brand}</td>
                <td>{row.status}</td>
                <td>{row.is_published ? "Yes" : "No"}</td>
              </tr>
            ))}
            {!products.length ? (
              <tr>
                <td colSpan="6">No products available.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
