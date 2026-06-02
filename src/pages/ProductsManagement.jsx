import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { getAdminSession } from "../utils/adminAuth";
import { adminMockApi } from "../utils/adminMockApi";
import { brandApi } from "../utils/brandApi";

const DESCRIPTION_LIMIT = 500;
const PAGE_SIZE = 8;
const DRAFT_STORAGE_KEY = "smarthome_product_drafts";
const CATEGORY_STORAGE_KEY = "smarthome_product_categories";
const ADD_NEW_BRAND_VALUE = "__add_new_brand__";
const ADD_NEW_CATEGORY_VALUE = "__add_new_category__";
const CATEGORY_SEPARATOR_VALUE = "__category_separator__";
const BRAND_LOGO_MAX_SIZE_BYTES = 700 * 1024;
const DEFAULT_PRODUCT_CATEGORIES = [
  "Fridge",
  "Air Conditioner",
  "Cooler",
  "Washing Machine",
  "Television",
];

const INITIAL_FORM = {
  name: "",
  model: "",
  category: "",
  brand: "",
  description: "",
  specifications: [{ key: "", value: "" }],
  imageUrl: "",
};

const STATUS_ORDER = {
  pending: 1,
  approved: 2,
  rejected: 3,
};

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function getStatusClass(status) {
  const normalized = String(status || "pending").toLowerCase();

  if (normalized === "approved") {
    return "approved";
  }

  if (normalized === "rejected") {
    return "rejected";
  }

  return "pending";
}

function toSpecificationRows(specifications) {
  if (!specifications || typeof specifications !== "object") {
    return [{ key: "", value: "" }];
  }

  const rows = Object.entries(specifications).map(([key, value]) => ({
    key,
    value: String(value ?? ""),
  }));

  return rows.length ? rows : [{ key: "", value: "" }];
}

function toSpecificationObject(rows) {
  return rows.reduce((acc, row) => {
    const key = row.key.trim();
    const value = row.value.trim();

    if (!key || !value) {
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}

function getActionLabel(role, action) {
  if (action === "view") return "View";
  if (action === "edit") return "Edit";
  if (action === "clone") return "Clone";
  if (action === "submit") return role === "operator" ? "Submit for Approval" : "Submit Update";
  if (action === "publish") return "Publish / Unpublish";
  if (action === "delete") return "Delete (Soft)";
  if (action === "history") return "View History";
  return action;
}

function buildActionList({ isAdmin, isOwner }) {
  if (isAdmin) {
    return ["view", "edit", "clone", "publish", "delete", "history"];
  }

  if (isOwner) {
    return ["view", "edit", "clone", "submit", "delete", "history"];
  }

  return ["view", "clone", "history"];
}

function ActionMenu({ role, actions, onAction }) {
  return (
    <details className="enterprise-action-menu">
      <summary>Actions</summary>
      <div className="enterprise-action-dropdown">
        {actions.map((action) => (
          <button
            type="button"
            key={action}
            onClick={(event) => {
              onAction(action);
              const detailsEl = event.currentTarget.closest("details");
              if (detailsEl) {
                detailsEl.removeAttribute("open");
              }
            }}
          >
            {getActionLabel(role, action)}
          </button>
        ))}
      </div>
    </details>
  );
}

function Spinner() {
  return (
    <div className="enterprise-spinner-wrap" role="status" aria-live="polite" aria-label="Loading products">
      <div className="enterprise-spinner" />
    </div>
  );
}

function getDrafts() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : [];
  } catch {
    return [];
  }
}

function saveDraft(draft) {
  if (typeof window === "undefined") {
    return;
  }

  const drafts = getDrafts();
  const nextDrafts = [draft, ...drafts].slice(0, 20);
  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextDrafts));
}

async function fetchProductsAndMeta(user, isAdmin) {
  const nextProducts = await adminMockApi.getProducts();

  if (isAdmin) {
    const pendingChanges = await adminMockApi.getPendingChanges();

    return {
      nextProducts,
      ownSubmissions: [],
      pendingChanges,
    };
  }

  const ownSubmissions = await adminMockApi.getOwnSubmissions(user.email);

  return {
    nextProducts,
    ownSubmissions,
    pendingChanges: [],
  };
}

function sortBrandsByName(brands) {
  return [...brands].sort((left, right) => left.name.localeCompare(right.name));
}

function normalizeCategoryName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function mergeCategoryLists(...lists) {
  const merged = [];
  const seen = new Set();

  lists.forEach((list) => {
    if (!Array.isArray(list)) {
      return;
    }

    list.forEach((category) => {
      const normalized = normalizeCategoryName(category);
      if (!normalized) {
        return;
      }

      const key = normalized.toLowerCase();
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      merged.push(normalized);
    });
  });

  return merged;
}

function readStoredCategories() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredCategories(categories) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
}

const brandSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    borderColor: state.isFocused ? "#2563eb" : "#d3dfee",
    borderRadius: 8,
    minHeight: 42,
    boxShadow: state.isFocused ? "0 0 0 3px rgba(37, 99, 235, 0.15)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#2563eb" : "#94a3b8",
    },
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    zIndex: 30,
  }),
  option: (baseStyles, state) =>
    state.data.isSeparator
      ? {
          ...baseStyles,
          backgroundColor: "#ffffff",
          color: "#94a3b8",
          fontWeight: 700,
          fontSize: "0.76rem",
          textAlign: "center",
          cursor: "default",
          paddingTop: 6,
          paddingBottom: 6,
        }
      : {
          ...baseStyles,
          backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? "#eff6ff" : "#ffffff",
          color: state.isSelected ? "#ffffff" : "#0f172a",
          fontWeight: state.data.isAddAction ? 700 : 500,
        },
};

function filterBrandOption(option, inputValue) {
  if (option?.data?.isAddAction) {
    return true;
  }

  const normalized = String(inputValue || "").trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return String(option?.label || "").toLowerCase().includes(normalized);
}

function filterCategoryOption(option, inputValue) {
  if (option?.data?.isAddAction || option?.data?.isSeparator) {
    return true;
  }

  const normalized = String(inputValue || "").trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return String(option?.label || "").toLowerCase().includes(normalized);
}

export default function ProductsManagement() {
  const [session] = useState(() => getAdminSession());
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState(() =>
    mergeCategoryLists(DEFAULT_PRODUCT_CATEGORIES, readStoredCategories())
  );
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalSaving, setCategoryModalSaving] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [brands, setBrands] = useState([]);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [brandModalSaving, setBrandModalSaving] = useState(false);
  const [brandForm, setBrandForm] = useState({
    name: "",
    logo: "",
    description: "",
  });

  const [previewModalProduct, setPreviewModalProduct] = useState(null);
  const [historyModalData, setHistoryModalData] = useState({ product: null, logs: [] });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createdDateFilter, setCreatedDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    writeStoredCategories(categories);
  }, [categories]);

  useEffect(() => {
    let isMounted = true;

    async function loadPageData() {
      const currentSession = getAdminSession();
      const currentUser = currentSession?.user;
      const currentIsAdmin = currentUser?.role === "admin";

      if (!currentUser) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const [{ nextProducts, ownSubmissions, pendingChanges: nextPendingChanges }, brandResponse] =
          await Promise.all([fetchProductsAndMeta(currentUser, currentIsAdmin), brandApi.listBrands()]);

        if (!isMounted) {
          return;
        }

        setProducts(nextProducts);
        setSubmissions(ownSubmissions);
        setPendingChanges(nextPendingChanges);
        setCategories((current) =>
          mergeCategoryLists(DEFAULT_PRODUCT_CATEGORIES, current, nextProducts.map((product) => product.category))
        );
        setBrands(sortBrandsByName(brandResponse.brands || []));
        setError("");
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || "Failed to load products");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, createdDateFilter, sortBy, sortDirection]);

  const categorySelectOptions = useMemo(() => {
    const nextOptions = categories.map((category) => ({
      value: category,
      label: category,
    }));

    if (
      formState.category &&
      !nextOptions.some((option) => option.value.toLowerCase() === formState.category.toLowerCase())
    ) {
      nextOptions.unshift({
        value: formState.category,
        label: `${formState.category} (legacy)`,
      });
    }

    nextOptions.push({
      value: CATEGORY_SEPARATOR_VALUE,
      label: "----------",
      isDisabled: true,
      isSeparator: true,
    });

    nextOptions.push({
      value: ADD_NEW_CATEGORY_VALUE,
      label: "\u2795 Add New Category",
      isAddAction: true,
    });

    return nextOptions;
  }, [categories, formState.category]);

  const selectedCategoryOption = useMemo(() => {
    return categorySelectOptions.find((option) => option.value === formState.category) || null;
  }, [categorySelectOptions, formState.category]);

  const brandSelectOptions = useMemo(() => {
    const nextOptions = sortBrandsByName(brands).map((brand) => ({
      value: brand.name,
      label: brand.name,
      brand,
    }));

    if (
      formState.brand &&
      !nextOptions.some((option) => option.value.toLowerCase() === formState.brand.toLowerCase())
    ) {
      nextOptions.unshift({
        value: formState.brand,
        label: `${formState.brand} (legacy)`,
      });
    }

    nextOptions.push({
      value: ADD_NEW_BRAND_VALUE,
      label: "\u2795 Add New Brand",
      isAddAction: true,
    });

    return nextOptions;
  }, [brands, formState.brand]);

  const selectedBrandOption = useMemo(() => {
    return brandSelectOptions.find((option) => option.value === formState.brand) || null;
  }, [brandSelectOptions, formState.brand]);

  const pendingByProductId = useMemo(() => {
    const map = new Map();

    pendingChanges.forEach((change) => {
      if (!change.productId) {
        return;
      }

      const productId = Number(change.productId);
      if (!map.has(productId)) {
        map.set(productId, change);
      }
    });

    return map;
  }, [pendingChanges]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const next = products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.model.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      const matchesDate =
        !createdDateFilter || String(product.createdAt || "").slice(0, 10) === createdDateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });

    next.sort((a, b) => {
      if (sortBy === "status") {
        const aRank = STATUS_ORDER[String(a.status || "pending").toLowerCase()] || 99;
        const bRank = STATUS_ORDER[String(b.status || "pending").toLowerCase()] || 99;
        return sortDirection === "asc" ? aRank - bRank : bRank - aRank;
      }

      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
    });

    return next;
  }, [products, searchTerm, statusFilter, createdDateFilter, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const submitLabel = "Submit for Approval";

  const clearForm = () => {
    setFormState(INITIAL_FORM);
    setEditingId(null);
  };

  const reloadData = async () => {
    if (!user) {
      return;
    }

    const { nextProducts, ownSubmissions, pendingChanges: nextPendingChanges } = await fetchProductsAndMeta(
      user,
      isAdmin
    );

    setProducts(nextProducts);
    setSubmissions(ownSubmissions);
    setPendingChanges(nextPendingChanges);
    setCategories((current) =>
      mergeCategoryLists(DEFAULT_PRODUCT_CATEGORIES, current, nextProducts.map((product) => product.category))
    );
  };

  const reloadBrands = async () => {
    const response = await brandApi.listBrands();
    setBrands(sortBrandsByName(response.brands || []));
  };

  const openCategoryModal = () => {
    setCategoryForm({ name: "" });
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setCategoryModalSaving(false);
    setCategoryForm({ name: "" });
  };

  const openBrandModal = () => {
    setBrandForm({
      name: "",
      logo: "",
      description: "",
    });
    setBrandModalOpen(true);
  };

  const closeBrandModal = () => {
    setBrandModalOpen(false);
    setBrandModalSaving(false);
    setBrandForm({
      name: "",
      logo: "",
      description: "",
    });
  };

  const handleCategorySelectChange = (selectedOption) => {
    if (!selectedOption) {
      setFormState((current) => ({ ...current, category: "" }));
      return;
    }

    if (selectedOption.value === ADD_NEW_CATEGORY_VALUE) {
      openCategoryModal();
      return;
    }

    setFormState((current) => ({ ...current, category: selectedOption.value }));
  };

  const handleSaveCategory = () => {
    const categoryName = normalizeCategoryName(categoryForm.name);
    if (!categoryName) {
      setError("Category name is required.");
      return;
    }

    const duplicate = categories.some((category) => category.toLowerCase() === categoryName.toLowerCase());
    if (duplicate) {
      setError("Category already exists.");
      return;
    }

    setError("");
    setCategoryModalSaving(true);

    setCategories((current) => mergeCategoryLists(current, [categoryName]));
    setFormState((current) => ({ ...current, category: categoryName }));
    setMessage(`Category "${categoryName}" added and selected.`);
    closeCategoryModal();
  };

  const handleBrandSelectChange = (selectedOption) => {
    if (!selectedOption) {
      setFormState((current) => ({ ...current, brand: "" }));
      return;
    }

    if (selectedOption.value === ADD_NEW_BRAND_VALUE) {
      openBrandModal();
      return;
    }

    setFormState((current) => ({ ...current, brand: selectedOption.value }));
  };

  const handleBrandLogoUpload = (event) => {
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
    const brandName = brandForm.name.trim();
    if (!brandName) {
      setError("Brand name is required.");
      return;
    }

    const duplicate = brands.some((brand) => brand.name.toLowerCase() === brandName.toLowerCase());
    if (duplicate) {
      setError("Brand already exists.");
      return;
    }

    setError("");
    setBrandModalSaving(true);

    try {
      const response = await brandApi.createBrand({
        name: brandName,
        logo: brandForm.logo || null,
        description: brandForm.description.trim() || null,
      });
      const nextBrand = response.brand;

      await reloadBrands();
      setFormState((current) => ({ ...current, brand: nextBrand.name }));
      setMessage(`Brand "${nextBrand.name}" added and selected.`);
      closeBrandModal();
    } catch (requestError) {
      setError(requestError.message || "Failed to add brand");
    } finally {
      setBrandModalSaving(false);
    }
  };

  const handleSpecChange = (index, field, value) => {
    setFormState((current) => {
      const nextSpecifications = [...current.specifications];
      nextSpecifications[index] = {
        ...nextSpecifications[index],
        [field]: value,
      };

      return {
        ...current,
        specifications: nextSpecifications,
      };
    });
  };

  const handleAddSpecification = () => {
    setFormState((current) => ({
      ...current,
      specifications: [...current.specifications, { key: "", value: "" }],
    }));
  };

  const handleRemoveSpecification = (index) => {
    setFormState((current) => {
      if (current.specifications.length === 1) {
        return {
          ...current,
          specifications: [{ key: "", value: "" }],
        };
      }

      return {
        ...current,
        specifications: current.specifications.filter((_, specIndex) => specIndex !== index),
      };
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormState((current) => ({
        ...current,
        imageUrl: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormState((current) => ({
      ...current,
      imageUrl: "",
    }));
  };

  const buildPayload = () => ({
    name: formState.name.trim(),
    model: formState.model.trim(),
    category: formState.category.trim(),
    brand: formState.brand.trim(),
    description: formState.description.trim(),
    specifications: toSpecificationObject(formState.specifications),
    imageUrl: formState.imageUrl,
  });

  const handleSaveDraft = () => {
    setMessage("");
    setError("");

    try {
      saveDraft({
        id: Date.now(),
        owner: user.email,
        editingId,
        payload: buildPayload(),
        createdAt: new Date().toISOString(),
      });

      setMessage("Draft saved locally.");
    } catch (draftError) {
      setError(draftError.message || "Failed to save draft");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = buildPayload();

      if (!payload.name || !payload.model || !payload.category || !payload.brand || !payload.description) {
        throw new Error("Please complete all required fields");
      }

      const response = editingId
        ? await adminMockApi.updateProduct(editingId, payload, user)
        : await adminMockApi.createProduct(payload, user);

      setMessage(response.message);
      clearForm();
      await reloadData();
    } catch (requestError) {
      setError(requestError.message || "Submission failed");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormState({
      name: product.name || "",
      model: product.model || "",
      category: product.category || "",
      brand: product.brand || "",
      description: product.description || "",
      specifications: toSpecificationRows(product.specifications),
      imageUrl: product.imageUrl || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClone = (product) => {
    setEditingId(null);
    setFormState({
      name: `${product.name} (Copy)`,
      model: `${product.model}-COPY`,
      category: product.category || "",
      brand: product.brand || "",
      description: product.description || "",
      specifications: toSpecificationRows(product.specifications),
      imageUrl: product.imageUrl || "",
    });

    setMessage("Product cloned into form.");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId) => {
    setMessage("");
    setError("");

    try {
      const reason = isAdmin ? "" : window.prompt("Delete reason", "") || "";
      const response = await adminMockApi.deleteProduct(productId, user, reason);
      setMessage(response.message);
      await reloadData();
    } catch (requestError) {
      setError(requestError.message || "Delete action failed");
    }
  };

  const handleTogglePublish = async (productId) => {
    if (!isAdmin) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await adminMockApi.togglePublish(productId, user);
      setMessage(response.message);
      await reloadData();
    } catch (requestError) {
      setError(requestError.message || "Publish toggle failed");
    }
  };

  const handleSubmitForApproval = async (product) => {
    if (isAdmin || product.createdBy !== user.email) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await adminMockApi.updateProduct(
        product.id,
        {
          name: product.name,
          model: product.model,
          category: product.category,
          brand: product.brand,
          description: product.description,
          specifications: product.specifications || {},
          imageUrl: product.imageUrl || "",
        },
        user
      );

      setMessage(response.message);
      await reloadData();
    } catch (requestError) {
      setError(requestError.message || "Submit for approval failed");
    }
  };

  const handleApprovePending = async (changeId) => {
    setMessage("");
    setError("");

    try {
      const response = await adminMockApi.approveChange(changeId, user);
      setMessage(response.message);
      await reloadData();
    } catch (requestError) {
      setError(requestError.message || "Approval failed");
    }
  };

  const handleRejectPending = async (changeId) => {
    setMessage("");
    setError("");

    try {
      const reason = window.prompt("Rejection reason", "") || "";
      const response = await adminMockApi.rejectChange(changeId, user, reason);
      setMessage(response.message);
      await reloadData();
    } catch (requestError) {
      setError(requestError.message || "Rejection failed");
    }
  };

  const handleOpenHistory = async (product) => {
    setMessage("");
    setError("");

    try {
      const logs = await adminMockApi.getLogs();
      const productLogs = logs.filter((log) => Number(log.details?.productId) === Number(product.id));
      setHistoryModalData({ product, logs: productLogs });
    } catch (requestError) {
      setError(requestError.message || "Failed to load audit history");
    }
  };

  const handleAction = async (action, product) => {
    if (action === "view") {
      setPreviewModalProduct(product);
      return;
    }

    if (action === "edit") {
      handleEdit(product);
      return;
    }

    if (action === "clone") {
      handleClone(product);
      return;
    }

    if (action === "submit") {
      await handleSubmitForApproval(product);
      return;
    }

    if (action === "publish") {
      await handleTogglePublish(product.id);
      return;
    }

    if (action === "delete") {
      await handleDelete(product.id);
      return;
    }

    if (action === "history") {
      await handleOpenHistory(product);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <section className="admin-panel-section products-management-page">
      <header>
        <h2>Products Management</h2>
        <p>
          {isAdmin
            ? "Enterprise catalogue controls with approvals, publishing, and audit visibility."
            : "Manage your submissions and send product changes for admin approval."}
        </p>
      </header>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <section className="enterprise-card">
        <div className="enterprise-card-head">
          <div>
            <h3>{editingId ? "Edit Product" : "Create Product"}</h3>
            <p>Structured form with specs, image upload, and workflow actions.</p>
          </div>
          {editingId ? <span className="admin-role-badge">Editing #{editingId}</span> : null}
        </div>

        <form className="admin-form-grid enterprise-form-grid" onSubmit={handleSubmit}>
          <label>
            Product Name
            <input
              type="text"
              value={formState.name}
              onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>

          <label>
            Model
            <input
              type="text"
              value={formState.model}
              onChange={(event) => setFormState((current) => ({ ...current, model: event.target.value }))}
              required
            />
          </label>

          <label>
            Category
            <Select
              classNamePrefix="enterprise-brand-select"
              options={categorySelectOptions}
              value={selectedCategoryOption}
              onChange={handleCategorySelectChange}
              styles={brandSelectStyles}
              placeholder="Select category"
              isSearchable
              filterOption={filterCategoryOption}
              noOptionsMessage={() => "No categories found"}
            />
            <span className="admin-muted">Select a category or choose "Add New Category".</span>
          </label>

          <label>
            Brand
            <Select
              classNamePrefix="enterprise-brand-select"
              options={brandSelectOptions}
              value={selectedBrandOption}
              onChange={handleBrandSelectChange}
              styles={brandSelectStyles}
              placeholder="Search or select brand"
              isSearchable
              filterOption={filterBrandOption}
              noOptionsMessage={() => "No brands found"}
            />
            <span className="admin-muted">Type to search. Use "Add New Brand" to create a new one.</span>
          </label>

          <label className="span-2">
            Description
            <textarea
              rows={4}
              maxLength={DESCRIPTION_LIMIT}
              value={formState.description}
              onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
              required
            />
            <span className="enterprise-char-counter">
              {formState.description.length}/{DESCRIPTION_LIMIT}
            </span>
          </label>

          <div className="span-2">
            <label>Specifications</label>
            <div className="enterprise-spec-block">
              {formState.specifications.map((row, index) => (
                <div key={`spec-${index}`} className="enterprise-spec-row">
                  <input
                    type="text"
                    placeholder="Key (e.g. capacity)"
                    value={row.key}
                    onChange={(event) => handleSpecChange(index, "key", event.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 420L)"
                    value={row.value}
                    onChange={(event) => handleSpecChange(index, "value", event.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-reject"
                    onClick={() => handleRemoveSpecification(index)}
                    aria-label="Remove specification"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="enterprise-spec-actions">
                <button type="button" className="btn-outline" onClick={handleAddSpecification}>
                  Add Specification
                </button>
              </div>
            </div>
          </div>

          <div className="span-2">
            <label>Product Image</label>
            <div className="enterprise-image-upload">
              <input type="file" accept="image/*" onChange={handleImageUpload} />

              {formState.imageUrl ? (
                <div className="enterprise-image-preview-wrap">
                  <div className="enterprise-image-preview">
                    <img src={formState.imageUrl} alt="Product preview" />
                  </div>
                  <button type="button" className="btn-outline" onClick={handleRemoveImage}>
                    Remove Image
                  </button>
                </div>
              ) : (
                <p className="admin-muted">No image selected</p>
              )}
            </div>
          </div>

          <div className="admin-form-actions span-2 enterprise-form-actions">
            <button type="button" className="btn-outline" onClick={handleSaveDraft}>
              Save as Draft
            </button>
            <button type="submit" className="btn-primary">
              {submitLabel}
            </button>
            <button type="button" className="btn-outline" onClick={clearForm}>
              Reset Form
            </button>
          </div>
        </form>
      </section>

      <section className="enterprise-card">
        <div className="enterprise-card-head">
          <div>
            <h3>Catalogue Table</h3>
            <p>Search, filter, sort, and manage records with role-based controls.</p>
          </div>
        </div>

        <div className="enterprise-filters">
          <label>
            Search
            <input
              type="text"
              placeholder="Filter by name or model"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label>
            Created Date
            <input
              type="date"
              value={createdDateFilter}
              onChange={(event) => setCreatedDateFilter(event.target.value)}
            />
          </label>

          <label>
            Sort By
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="createdAt">Created Date</option>
              <option value="status">Status</option>
            </select>
          </label>

          <button
            type="button"
            className="btn-outline"
            onClick={() => setSortDirection((value) => (value === "asc" ? "desc" : "asc"))}
          >
            {sortDirection === "asc" ? "Ascending" : "Descending"}
          </button>
        </div>

        {paginatedProducts.length ? (
          <>
            <div className="admin-table-wrap enterprise-table-wrap">
              <table className="admin-table enterprise-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>Model</th>
                    <th>Category</th>
                    <th>Approval Status</th>
                    <th>Published</th>
                    {isAdmin ? <th>Owner</th> : null}
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => {
                    const isOwner = product.createdBy === user.email;
                    const actions = buildActionList({ isAdmin, isOwner });
                    const pendingChange = pendingByProductId.get(Number(product.id));

                    return (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>{product.model}</td>
                        <td>{product.category}</td>
                        <td>
                          <span className={`pm-status ${getStatusClass(product.status)}`}>{product.status}</span>
                        </td>
                        <td>
                          <label className="enterprise-switch" aria-label="Publish toggle">
                            <input
                              type="checkbox"
                              checked={Boolean(product.published)}
                              onChange={() => handleTogglePublish(product.id)}
                              disabled={!isAdmin}
                            />
                            <span />
                          </label>
                        </td>
                        {isAdmin ? <td>{product.createdBy}</td> : null}
                        <td>{formatDate(product.createdAt)}</td>
                        <td>{formatDate(product.updatedAt)}</td>
                        <td>
                          <div className="enterprise-actions-cell">
                            {isAdmin && pendingChange ? (
                              <div className="enterprise-inline-approvals">
                                <button
                                  type="button"
                                  className="btn-approve"
                                  onClick={() => handleApprovePending(pendingChange.id)}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="btn-reject"
                                  onClick={() => handleRejectPending(pendingChange.id)}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : null}

                            <ActionMenu
                              role={isAdmin ? "admin" : "operator"}
                              actions={actions}
                              onAction={(action) => handleAction(action, product)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="enterprise-pagination">
              <span>
                Showing {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredProducts.length)}
                {" "}of {filteredProducts.length}
              </span>

              <div>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>No products match current filters.</p>
          </div>
        )}
      </section>

      {!isAdmin ? (
        <section className="enterprise-card">
          <div className="enterprise-card-head">
            <div>
              <h3>My Submissions</h3>
              <p>Track pending, approved, and rejected requests.</p>
            </div>
          </div>

          {submissions.length ? (
            <div className="admin-table-wrap enterprise-table-wrap">
              <table className="admin-table enterprise-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Product ID</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>{submission.id}</td>
                      <td>{submission.changeType}</td>
                      <td>
                        <span className={`pm-status ${getStatusClass(submission.status)}`}>{submission.status}</span>
                      </td>
                      <td>{submission.productId || "New"}</td>
                      <td>{formatDate(submission.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No submissions yet.</p>
            </div>
          )}
        </section>
      ) : null}

      {categoryModalOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Add new category">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>Add New Category</h3>
              <button type="button" className="modal-close-btn" onClick={closeCategoryModal}>
                x
              </button>
            </div>

            <form
              className="enterprise-modal-content"
              onSubmit={(event) => {
                event.preventDefault();
                handleSaveCategory();
              }}
            >
              <label className="enterprise-brand-modal-field">
                Category Name
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(event) => setCategoryForm({ name: event.target.value })}
                  placeholder="e.g. Deep Freezer"
                  maxLength={100}
                  autoFocus
                  required
                />
              </label>

              <p className="admin-muted">New categories are saved for future product creation in this panel.</p>

              <div className="enterprise-brand-add-actions">
                <button type="submit" className="btn-primary" disabled={categoryModalSaving}>
                  {categoryModalSaving ? "Saving..." : "Save Category"}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={closeCategoryModal}
                  disabled={categoryModalSaving}
                >
                  Cancel
                </button>
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
                  placeholder="e.g. Panasonic"
                  maxLength={120}
                  required
                />
              </label>

              <label className="enterprise-brand-modal-field">
                Brand Logo (optional)
                <input type="file" accept="image/*" onChange={handleBrandLogoUpload} />
              </label>

              {brandForm.logo ? (
                <div className="enterprise-image-preview">
                  <img src={brandForm.logo} alt="Brand logo preview" />
                </div>
              ) : null}

              <label className="enterprise-brand-modal-field">
                Brand Description (optional)
                <textarea
                  rows={3}
                  value={brandForm.description}
                  onChange={(event) =>
                    setBrandForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Short description for this brand"
                  maxLength={2000}
                />
              </label>

              <div className="enterprise-brand-add-actions">
                <button type="button" className="btn-primary" onClick={handleSaveBrand} disabled={brandModalSaving}>
                  {brandModalSaving ? "Saving..." : "Save Brand"}
                </button>
                <button type="button" className="btn-outline" onClick={closeBrandModal} disabled={brandModalSaving}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {previewModalProduct ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Product details">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>Product Details</h3>
              <button type="button" className="modal-close-btn" onClick={() => setPreviewModalProduct(null)}>
                x
              </button>
            </div>

            <div className="enterprise-modal-content">
              <p>
                <strong>Name:</strong> {previewModalProduct.name}
              </p>
              <p>
                <strong>Model:</strong> {previewModalProduct.model}
              </p>
              <p>
                <strong>Category:</strong> {previewModalProduct.category}
              </p>
              <p>
                <strong>Brand:</strong> {previewModalProduct.brand}
              </p>
              <p>
                <strong>Description:</strong> {previewModalProduct.description}
              </p>

              {previewModalProduct.imageUrl ? (
                <div className="enterprise-image-preview">
                  <img src={previewModalProduct.imageUrl} alt={previewModalProduct.name} />
                </div>
              ) : (
                <p className="admin-muted">No image uploaded.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && historyModalData.product ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Audit history">
          <div className="enquiry-modal enterprise-modal">
            <div className="enquiry-modal-header enterprise-modal-header">
              <h3>Audit History: {historyModalData.product.name}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setHistoryModalData({ product: null, logs: [] })}
              >
                x
              </button>
            </div>

            <div className="enterprise-modal-content">
              {historyModalData.logs.length ? (
                <ul className="enterprise-history-list">
                  {historyModalData.logs.map((log) => (
                    <li key={log.id}>
                      <p>
                        <strong>{log.action}</strong>
                      </p>
                      <p>
                        Actor: {log.actorEmail} | Date: {formatDate(log.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <p>No audit logs for this product.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
