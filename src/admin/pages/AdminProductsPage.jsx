import { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { canDeleteProducts, canPublishProducts, isDevelopmentTeamUser } from "../utils/roles";

const ADD_NEW_CATEGORY_VALUE = "__add_new_category__";
const ADD_NEW_BRAND_VALUE = "__add_new_brand__";
const MAX_IMAGE_FILE_SIZE = 1024 * 1024;
const MAX_BROCHURE_FILE_SIZE = 1536 * 1024;
const LOW_STOCK_THRESHOLD = 10;
const PAGE_SIZE = 10;

const INITIAL_FORM = {
  name: "",
  model: "",
  category_id: null,
  brand_id: null,
  stock_quantity: "0",
  price: "0",
  description: "",
  specifications: "{}",
  image_url: "",
  brochure_url: "",
};

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "#2563eb" : "#d3dfee",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(37, 99, 235, 0.15)" : "none",
    minHeight: 42,
    borderRadius: 8,
  }),
  indicatorSeparator: (base) => ({ ...base, display: "none" }),
  menu: (base) => ({ ...base, zIndex: 50 }),
  option: (base, state) => ({
    ...base,
    fontWeight: state.data?.isAddAction ? 700 : 500,
    color: state.data?.isAddAction ? "#1d4ed8" : base.color,
  }),
};

const sortByName = (rows) => [...rows].sort((a, b) => a.name.localeCompare(b.name));
const toRefRows = (rows) =>
  Array.isArray(rows)
    ? rows
        .map((row) => ({ id: Number(row.id), name: String(row.name || "").trim() }))
        .filter((row) => Number.isFinite(row.id) && row.id > 0 && row.name.length >= 2)
    : [];

const mergeRefRows = (currentRows, nextRow) => {
  const map = new Map();
  [...currentRows, nextRow].forEach((row) => {
    if (row?.id && row?.name) {
      map.set(row.id, row);
    }
  });
  return sortByName([...map.values()]);
};

const findIdByName = (rows, name) => {
  const normalized = String(name || "").trim().toLowerCase();
  if (!normalized) return null;
  const match = rows.find((row) => row.name.toLowerCase() === normalized);
  return match ? Number(match.id) : null;
};

const filterOption = (option, rawInput) => {
  if (option.data?.isAddAction) return true;
  const input = String(rawInput || "").trim().toLowerCase();
  if (!input) return true;
  return String(option.label || "").toLowerCase().includes(input);
};

const parsePublished = (value) => value === true || value === 1 || value === "1";

const formatCurrency = (value) =>
  `\u20b9 ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

const normalizeProduct = (product) => ({
  ...product,
  id: Number(product.id || 0),
  name: String(product.name || ""),
  model: String(product.model || ""),
  category: String(product.category || "-"),
  brand: String(product.brand || "-"),
  status: String(product.status || "pending").toLowerCase(),
  stock_quantity: Math.max(0, Number(product.stock_quantity || product.stockQuantity || 0)),
  price: Number(product.price || 0),
  is_published: parsePublished(product.is_published ?? product.isPublished),
  image_url: product.image_url || product.imageUrl || "",
  created_at: product.created_at || product.createdAt || null,
  updated_at: product.updated_at || product.updatedAt || null,
});

const getStockMeta = (qty) => {
  if (qty <= 0) return { label: "Out of Stock", className: "out" };
  if (qty <= LOW_STOCK_THRESHOLD) return { label: "Low Stock", className: "low" };
  return { label: "In Stock", className: "in" };
};

const getStatusMeta = (status) => {
  if (status === "approved") return { label: "Approved", className: "approved" };
  if (status === "rejected") return { label: "Rejected", className: "rejected" };
  return { label: "Pending", className: "pending" };
};

const toPayload = (form) => ({
  name: String(form.name || "").trim(),
  model: String(form.model || "").trim(),
  category_id: Number(form.category_id),
  brand_id: Number(form.brand_id),
  stock_quantity: Math.max(0, Number(form.stock_quantity || 0)),
  price: Number(form.price || 0),
  description: String(form.description || "").trim(),
  specifications: form.specifications,
  image_url: String(form.image_url || "").trim(),
  brochure_url: String(form.brochure_url || "").trim() || null,
});

const normalizeForm = (product, categories, brands) => ({
  name: product.name || "",
  model: product.model || "",
  category_id:
    Number.isFinite(Number(product.category_id)) && Number(product.category_id) > 0
      ? Number(product.category_id)
      : findIdByName(categories, product.category),
  brand_id:
    Number.isFinite(Number(product.brand_id)) && Number(product.brand_id) > 0
      ? Number(product.brand_id)
      : findIdByName(brands, product.brand),
  stock_quantity: String(product.stock_quantity || product.stockQuantity || 0),
  price: String(product.price ?? 0),
  description: product.description || "",
  specifications: JSON.stringify(product.specifications || {}, null, 2),
  image_url: product.image_url || product.imageUrl || "",
  brochure_url: product.brochure_url || product.brochureUrl || "",
});

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Failed to read file.")));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

function Icon({ children }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function AdminProductsPage() {
  const { token, user } = useAdminAuth();
  const canDelete = canDeleteProducts(user);
  const canPublish = canPublishProducts(user);
  const isDevelopmentTeam = isDevelopmentTeamUser(user);
  const selectAllRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [brochureUploading, setBrochureUploading] = useState(false);
  const [publishingProductIds, setPublishingProductIds] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadPage() {
      setLoading(true);
      setError("");
      try {
        const [productResponse, categoryResponse, brandResponse] = await Promise.all([
          adminApi.getProducts(token, user.role),
          adminApi.getCategories(token),
          adminApi.getBrands(token),
        ]);
        if (!ignore) {
          setProducts((productResponse.products || []).map(normalizeProduct));
          setCategories(sortByName(toRefRows(categoryResponse.categories)));
          setBrands(sortByName(toRefRows(brandResponse.brands)));
          setSelectedProductIds([]);
        }
      } catch (requestError) {
        if (!ignore) setError(requestError.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadPage();
    return () => {
      ignore = true;
    };
  }, [token, user.role, reloadKey]);

  useEffect(() => setCurrentPage(1), [searchTerm, categoryFilter, brandFilter, statusFilter]);

  const submitLabel = editingProductId ? "Update Product" : "Create Product";

  const categoryOptions = useMemo(
    () => [...categories.map((category) => ({ value: category.id, label: category.name })), { value: ADD_NEW_CATEGORY_VALUE, label: "+ Add New Category", isAddAction: true }],
    [categories]
  );

  const brandOptions = useMemo(
    () => [...brands.map((brand) => ({ value: brand.id, label: brand.name })), { value: ADD_NEW_BRAND_VALUE, label: "+ Add New Brand", isAddAction: true }],
    [brands]
  );

  const selectedCategoryOption = categoryOptions.find((option) => Number(option.value) === Number(formState.category_id)) || null;
  const selectedBrandOption = brandOptions.find((option) => Number(option.value) === Number(formState.brand_id)) || null;

  const filterCategoryOptions = useMemo(() => {
    const names = new Set();
    categories.forEach((row) => names.add(row.name));
    products.forEach((product) => {
      if (product.category && product.category !== "-") names.add(product.category);
    });
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [categories, products]);

  const filterBrandOptions = useMemo(() => {
    const names = new Set();
    brands.forEach((row) => names.add(row.name));
    products.forEach((product) => {
      if (product.brand && product.brand !== "-") names.add(product.brand);
    });
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [brands, products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.model.toLowerCase().includes(normalizedSearch);
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesBrand = brandFilter === "all" || product.brand === brandFilter;
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, brandFilter, statusFilter]);

  const summary = useMemo(
    () => ({
      totalProducts: products.length,
      pendingApproval: products.filter((product) => product.status === "pending").length,
      publishedProducts: products.filter((product) => product.is_published).length,
      draftProducts: products.filter((product) => !product.is_published).length,
    }),
    [products]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, safePage]);

  const visibleProductIds = paginatedProducts.map((product) => product.id);
  const allVisibleSelected =
    visibleProductIds.length > 0 && visibleProductIds.every((id) => selectedProductIds.includes(id));
  const someVisibleSelected =
    visibleProductIds.length > 0 && visibleProductIds.some((id) => selectedProductIds.includes(id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected && !allVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const clearForm = () => {
    setEditingProductId(null);
    setFormState(INITIAL_FORM);
  };

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setNewCategoryName("");
  };

  const closeBrandModal = () => {
    setBrandModalOpen(false);
    setNewBrandName("");
  };

  const handleCategoryChange = (selectedOption) => {
    if (!selectedOption) return setFormState((value) => ({ ...value, category_id: null }));
    if (selectedOption.value === ADD_NEW_CATEGORY_VALUE) return setCategoryModalOpen(true);
    setFormState((value) => ({ ...value, category_id: Number(selectedOption.value) }));
  };

  const handleBrandChange = (selectedOption) => {
    if (!selectedOption) return setFormState((value) => ({ ...value, brand_id: null }));
    if (selectedOption.value === ADD_NEW_BRAND_VALUE) return setBrandModalOpen(true);
    setFormState((value) => ({ ...value, brand_id: Number(selectedOption.value) }));
  };

  const handleSaveCategory = async () => {
    const name = newCategoryName.trim();
    if (name.length < 2) return setError("Category name must be at least 2 characters.");
    setSavingCategory(true);
    setMessage("");
    setError("");
    try {
      const response = await adminApi.createCategory(token, { name });
      const created = response.category;
      if (created) {
        const normalized = { id: Number(created.id), name: String(created.name || "").trim() };
        setCategories((current) => mergeRefRows(current, normalized));
        setFormState((value) => ({ ...value, category_id: normalized.id }));
      }
      closeCategoryModal();
      setMessage("Category added and selected.");
    } catch (requestError) {
      setError(requestError.message || "Failed to add category.");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleSaveBrand = async () => {
    const name = newBrandName.trim();
    if (name.length < 2) return setError("Brand name must be at least 2 characters.");
    setSavingBrand(true);
    setMessage("");
    setError("");
    try {
      const response = await adminApi.createBrand(token, { name });
      const created = response.brand;
      if (created) {
        const normalized = { id: Number(created.id), name: String(created.name || "").trim() };
        setBrands((current) => mergeRefRows(current, normalized));
        setFormState((value) => ({ ...value, brand_id: normalized.id }));
      }
      closeBrandModal();
      setMessage("Brand added and selected.");
    } catch (requestError) {
      setError(requestError.message || "Failed to add brand.");
    } finally {
      setSavingBrand(false);
    }
  };

  const handleImageUpload = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please select a valid image file.");
    if (file.size > MAX_IMAGE_FILE_SIZE) return setError("Image file must be 1 MB or smaller.");
    setError("");
    setMessage("");
    setImageUploading(true);
    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      setFormState((value) => ({ ...value, image_url: imageDataUrl }));
      setMessage("Image uploaded. Save the product to persist it.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleBrochureUpload = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = "";
    if (!file) return;
    const isPdfFile = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfFile) return setError("Please select a PDF datasheet.");
    if (file.size > MAX_BROCHURE_FILE_SIZE) return setError("Datasheet file must be 1.5 MB or smaller.");
    setError("");
    setMessage("");
    setBrochureUploading(true);
    try {
      const brochureDataUrl = await readFileAsDataUrl(file);
      setFormState((value) => ({ ...value, brochure_url: brochureDataUrl }));
      setMessage("Datasheet uploaded. Save the product to persist it.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBrochureUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!String(formState.name || "").trim()) return setError("Product name is required.");
    if (!String(formState.model || "").trim()) return setError("Model is required.");
    if (!formState.category_id) return setError("Please select a category.");
    if (!formState.brand_id) return setError("Please select a brand.");
    if (!String(formState.description || "").trim()) return setError("Description is required.");
    if (!String(formState.image_url || "").trim()) return setError("Product image is required.");
    if (!Number.isFinite(Number(formState.price)) || Number(formState.price) < 0) {
      return setError("Price must be a valid amount.");
    }
    try {
      JSON.parse(formState.specifications);
    } catch {
      return setError("Specifications must be valid JSON.");
    }

    try {
      if (editingProductId) {
        await adminApi.updateProduct(token, user.role, editingProductId, toPayload(formState));
        setMessage("Product updated");
      } else {
        await adminApi.createProduct(token, user.role, toPayload(formState));
        setMessage("Product added successfully.");
      }
      clearForm();
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const startEdit = (product) => {
    setEditingProductId(product.id);
    setFormState(normalizeForm(product, categories, brands));
    setMessage("");
    setError("");
  };

  const handleDelete = async (productId) => {
    if (!canDelete) return;
    setMessage("");
    setError("");
    const confirmed = window.confirm("Delete this product permanently?");
    if (!confirmed) return;
    try {
      await adminApi.deleteProduct(token, user.role, productId);
      setMessage("Product deleted");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const togglePublish = async (productId, currentState) => {
    if (!canPublish) return;
    setPublishingProductIds((current) => [...current, productId]);
    try {
      await adminApi.publishProduct(token, productId, !currentState);
      setMessage(!currentState ? "Product published" : "Product unpublished");
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPublishingProductIds((current) => current.filter((id) => id !== productId));
    }
  };

  const toggleRowSelection = (productId) => {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  };

  const toggleVisibleSelection = () => {
    setSelectedProductIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !visibleProductIds.includes(id));
      return [...new Set([...current, ...visibleProductIds])];
    });
  };

  const runBulkAction = async (label, actionFn) => {
    if (!selectedProductIds.length) return setError("Select at least one product.");
    let success = 0;
    let failed = 0;
    for (const productId of selectedProductIds) {
      try {
        await actionFn(productId);
        success += 1;
      } catch {
        failed += 1;
      }
    }
    setSelectedProductIds([]);
    setReloadKey((value) => value + 1);
    setMessage(`${label} completed. Success: ${success}. Failed: ${failed}.`);
  };

  const pageStart = filteredProducts.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = Math.min(filteredProducts.length, safePage * PAGE_SIZE);

  return (
    <section className="products-management-page">
      <header>
        <h2>Products</h2>
        <p>
          {isDevelopmentTeam
            ? "Manage technical product data, images, and implementation assets."
            : "Manage the full product catalogue."}
        </p>
      </header>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <section className="enterprise-card">
        <form className="admin-form-grid" onSubmit={handleSubmit}>
          <label>
            Product Name
            <input type="text" value={formState.name} onChange={(event) => setFormState((value) => ({ ...value, name: event.target.value }))} required />
          </label>

          <label>
            Model
            <input type="text" value={formState.model} onChange={(event) => setFormState((value) => ({ ...value, model: event.target.value }))} required />
          </label>

          <label>
            Category
            <Select classNamePrefix="enterprise-brand-select" options={categoryOptions} value={selectedCategoryOption} onChange={handleCategoryChange} styles={selectStyles} placeholder="Search Category..." isSearchable filterOption={filterOption} noOptionsMessage={() => "No categories found"} />
          </label>

          <label>
            Brand
            <Select classNamePrefix="enterprise-brand-select" options={brandOptions} value={selectedBrandOption} onChange={handleBrandChange} styles={selectStyles} placeholder="Search Brand..." isSearchable filterOption={filterOption} noOptionsMessage={() => "No brands found"} />
          </label>

          <label>
            Stock Quantity
            <input type="number" min="0" step="1" value={formState.stock_quantity} onChange={(event) => setFormState((value) => ({ ...value, stock_quantity: event.target.value }))} required />
          </label>

          <label>
            Price
            <input type="number" min="0" step="0.01" value={formState.price} onChange={(event) => setFormState((value) => ({ ...value, price: event.target.value }))} required />
          </label>

          <label className="span-2">
            Description
            <textarea rows={3} value={formState.description} onChange={(event) => setFormState((value) => ({ ...value, description: event.target.value }))} required />
          </label>

          <label className="span-2">
            Specifications (JSON)
            <textarea rows={4} value={formState.specifications} onChange={(event) => setFormState((value) => ({ ...value, specifications: event.target.value }))} required />
          </label>

          <label className="span-2">
            Upload Product Image
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <span className="admin-field-hint">PNG, JPG, or WebP up to 1 MB.</span>
          </label>

          {formState.image_url ? (
            <div className="span-2 product-image-preview-card">
              <div>
                <p>Image Preview</p>
                <img src={formState.image_url} alt="Product preview" className="product-image-preview" />
              </div>
              <button type="button" className="btn-outline" onClick={() => setFormState((value) => ({ ...value, image_url: "" }))}>
                Remove Image
              </button>
            </div>
          ) : null}

          <label className="span-2">
            Upload Datasheet (PDF)
            <input type="file" accept=".pdf,application/pdf" onChange={handleBrochureUpload} />
            <span className="admin-field-hint">PDF up to 1.5 MB.</span>
          </label>

          {formState.brochure_url ? (
            <div className="span-2 product-image-preview-card">
              <div>
                <p>Datasheet Attached</p>
                <a href={formState.brochure_url} target="_blank" rel="noreferrer" className="btn-outline">
                  {formState.brochure_url.startsWith("data:") ? "Open Uploaded Datasheet" : "Open Datasheet Link"}
                </a>
              </div>
              <button type="button" className="btn-outline" onClick={() => setFormState((value) => ({ ...value, brochure_url: "" }))}>
                Remove Datasheet
              </button>
            </div>
          ) : null}

          <div className="admin-form-actions span-2">
            <button type="submit" className="btn-primary" disabled={imageUploading || brochureUploading}>
              {imageUploading || brochureUploading ? "Preparing Asset..." : submitLabel}
            </button>
            {editingProductId ? (
              <button type="button" className="btn-outline" onClick={clearForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="admin-stats-grid">
        <article className="admin-stat-card"><p>Total Products</p><h3>{summary.totalProducts}</h3></article>
        <article className="admin-stat-card"><p>Pending Approval</p><h3>{summary.pendingApproval}</h3></article>
        <article className="admin-stat-card"><p>Published Products</p><h3>{summary.publishedProducts}</h3></article>
        <article className="admin-stat-card"><p>Draft Products</p><h3>{summary.draftProducts}</h3></article>
      </section>

      <section className="enterprise-card admin-products-table-card">
        <div className="admin-products-toolbar">
          <label className="admin-products-search">
            Search Product
            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by product name or model" />
          </label>

          <label>
            Category
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All Categories</option>
              {filterCategoryOptions.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>

          <label>
            Brand
            <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}>
              <option value="all">All Brands</option>
              {filterBrandOptions.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>

          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>

        <div className="admin-products-bulk-actions">
          <p>{selectedProductIds.length} selected</p>
          <div>
            <button type="button" className="btn-reject" disabled={!selectedProductIds.length || !canDelete} onClick={async () => {
              const ok = window.confirm(`Delete ${selectedProductIds.length} selected product(s)? This cannot be undone.`);
              if (!ok) return;
              await runBulkAction("Bulk delete", (id) => adminApi.deleteProduct(token, user.role, id));
            }}>Bulk Delete</button>
            <button type="button" className="btn-approve" disabled={!selectedProductIds.length || !canPublish} onClick={() => runBulkAction("Bulk publish", (id) => adminApi.publishProduct(token, id, true))}>Bulk Publish</button>
            <button type="button" className="btn-outline" disabled={!selectedProductIds.length || !canPublish} onClick={() => runBulkAction("Bulk unpublish", (id) => adminApi.publishProduct(token, id, false))}>Bulk Unpublish</button>
          </div>
        </div>

        {loading ? <p>Loading products...</p> : null}

        {!loading ? (
          <div className="admin-table-wrap">
            <table className="admin-table admin-products-table">
              <thead>
                <tr>
                  <th><input ref={selectAllRef} type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleSelection} aria-label="Select all on page" /></th>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Model</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Stock Quantity</th>
                  <th>Price</th>
                  <th>Approval Status</th>
                  <th>Published Status</th>
                  <th>Created Date</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length ? paginatedProducts.map((product) => {
                  const stock = getStockMeta(product.stock_quantity);
                  const status = getStatusMeta(product.status);
                  const isPublishing = publishingProductIds.includes(product.id);
                  return (
                    <tr key={product.id}>
                      <td><input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={() => toggleRowSelection(product.id)} aria-label={`Select ${product.name}`} /></td>
                      <td>{product.id}</td>
                      <td>
                        <div className="admin-product-thumb">
                          {product.image_url ? <img src={product.image_url} alt={`${product.name} thumbnail`} /> : <span>No Img</span>}
                        </div>
                      </td>
                      <td>{product.name}</td>
                      <td>{product.model}</td>
                      <td>{product.category}</td>
                      <td>{product.brand}</td>
                      <td>
                        <div className="admin-stock-cell">
                          <strong>{product.stock_quantity}</strong>
                          <span className={`admin-stock-badge ${stock.className}`}>{stock.label}</span>
                        </div>
                      </td>
                      <td>{formatCurrency(product.price)}</td>
                      <td><span className={`admin-status-badge ${status.className}`}>{status.label}</span></td>
                      <td>
                        <div className="admin-publish-cell">
                          <label className="admin-publish-switch">
                            <input type="checkbox" checked={product.is_published} disabled={!canPublish || isPublishing} onChange={() => togglePublish(product.id, product.is_published)} aria-label={`Toggle publish ${product.name}`} />
                            <span className="admin-publish-slider" />
                          </label>
                          <span>{product.is_published ? "Published" : "Unpublished"}</span>
                        </div>
                      </td>
                      <td>{formatDateTime(product.created_at)}</td>
                      <td>{formatDateTime(product.updated_at)}</td>
                      <td>
                        <div className="admin-action-icons">
                          <button type="button" className="admin-icon-btn" onClick={() => window.open(`/products/${product.id}`, "_blank", "noopener,noreferrer")}>
                            <Icon><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="3" /></Icon>
                            <span>View</span>
                          </button>
                          <button type="button" className="admin-icon-btn" onClick={() => startEdit(product)}>
                            <Icon><path d="M4 20h4l10-10-4-4L4 16v4z" /><path d="M13 7l4 4" /></Icon>
                            <span>Edit</span>
                          </button>
                          <button type="button" className="admin-icon-btn danger" onClick={() => handleDelete(product.id)} disabled={!canDelete}>
                            <Icon><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /><path d="M10 11v6M14 11v6" /></Icon>
                            <span>Delete</span>
                          </button>
                          <button type="button" className="admin-icon-btn approve" onClick={() => togglePublish(product.id, product.is_published)} disabled={!canPublish || isPublishing}>
                            <Icon><path d="M12 3v12" /><path d="M7 8l5-5 5 5" /><path d="M5 21h14" /></Icon>
                            <span>{product.is_published ? "Unpublish" : "Publish"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : <tr><td colSpan={14}>No products match your search and filters.</td></tr>}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="admin-products-pagination">
          <p>Showing {pageStart}-{pageEnd} of {filteredProducts.length}</p>
          <div>
            <button type="button" className="btn-outline" disabled={safePage === 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}>Prev</button>
            <span>Page {safePage} of {totalPages}</span>
            <button type="button" className="btn-outline" disabled={safePage === totalPages} onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}>Next</button>
          </div>
        </div>
      </section>

      {categoryModalOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Add new category">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>Add New Category</h3>
              <button type="button" className="modal-close-btn" onClick={closeCategoryModal}>x</button>
            </div>
            <form className="enterprise-modal-content" onSubmit={(event) => { event.preventDefault(); handleSaveCategory(); }}>
              <label className="enterprise-brand-modal-field">Category Name
                <input type="text" value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} maxLength={120} autoFocus required />
              </label>
              <div className="enterprise-brand-add-actions">
                <button type="button" className="btn-outline" onClick={closeCategoryModal} disabled={savingCategory}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingCategory}>{savingCategory ? "Adding..." : "Add Category"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {brandModalOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Add new brand">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>Add New Brand</h3>
              <button type="button" className="modal-close-btn" onClick={closeBrandModal}>x</button>
            </div>
            <form className="enterprise-modal-content" onSubmit={(event) => { event.preventDefault(); handleSaveBrand(); }}>
              <label className="enterprise-brand-modal-field">Brand Name
                <input type="text" value={newBrandName} onChange={(event) => setNewBrandName(event.target.value)} maxLength={120} autoFocus required />
              </label>
              <div className="enterprise-brand-add-actions">
                <button type="button" className="btn-outline" onClick={closeBrandModal} disabled={savingBrand}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingBrand}>{savingBrand ? "Adding..." : "Add Brand"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
