import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { adminApi } from "../api/adminApi";
import { useAdminAuth } from "../hooks/useAdminAuth";

const ADD_NEW_CATEGORY_VALUE = "__add_new_category__";
const ADD_NEW_BRAND_VALUE = "__add_new_brand__";
const MAX_IMAGE_FILE_SIZE = 1024 * 1024;
const MAX_BROCHURE_FILE_SIZE = 1536 * 1024;

const INITIAL_PRODUCT_FORM = {
  name: "",
  model: "",
  category_id: null,
  category: "",
  brand_id: null,
  brand: "",
  stock_quantity: "0",
  price: "0",
  description: "",
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

function sortByName(rows) {
  return [...rows].sort((left, right) => left.name.localeCompare(right.name));
}

function toReferenceRows(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => ({
      id: Number(row.id),
      name: String(row.name || "").trim(),
    }))
    .filter((row) => Number.isFinite(row.id) && row.id > 0 && row.name.length >= 2);
}

function mergeReferenceRows(currentRows, nextRow) {
  const existing = new Map();

  [...currentRows, nextRow].forEach((row) => {
    if (!row?.id || !row?.name) {
      return;
    }
    existing.set(row.id, row);
  });

  return sortByName([...existing.values()]);
}

function filterSelectOption(option, rawInput) {
  if (option.data?.isAddAction) {
    return true;
  }

  const input = String(rawInput || "").trim().toLowerCase();
  if (!input) {
    return true;
  }

  return String(option.label || "")
    .toLowerCase()
    .includes(input);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read file."));
    };

    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export default function OperatorDataEntryPage() {
  const { token, user } = useAdminAuth();
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [brochureUploading, setBrochureUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadReferences() {
      try {
        const [categoryResponse, brandResponse] = await Promise.all([
          adminApi.getCategories(token),
          adminApi.getBrands(token),
        ]);

        if (!mounted) {
          return;
        }

        setCategories(sortByName(toReferenceRows(categoryResponse.categories)));
        setBrands(sortByName(toReferenceRows(brandResponse.brands)));
      } catch (requestError) {
        if (!mounted) {
          return;
        }
        setError(requestError.message || "Failed to load categories and brands.");
      }
    }

    loadReferences();

    return () => {
      mounted = false;
    };
  }, [token]);

  const categoryOptions = useMemo(() => {
    return [
      ...categories.map((category) => ({ value: category.id, label: category.name })),
      {
        value: ADD_NEW_CATEGORY_VALUE,
        label: "+ Add New Category",
        isAddAction: true,
      },
    ];
  }, [categories]);

  const brandOptions = useMemo(() => {
    return [
      ...brands.map((brand) => ({ value: brand.id, label: brand.name })),
      {
        value: ADD_NEW_BRAND_VALUE,
        label: "+ Add New Brand",
        isAddAction: true,
      },
    ];
  }, [brands]);

  const selectedCategoryOption = useMemo(() => {
    if (!productForm.category_id) {
      return null;
    }
    return categoryOptions.find((option) => Number(option.value) === Number(productForm.category_id)) || null;
  }, [categoryOptions, productForm.category_id]);

  const selectedBrandOption = useMemo(() => {
    if (!productForm.brand_id) {
      return null;
    }
    return brandOptions.find((option) => Number(option.value) === Number(productForm.brand_id)) || null;
  }, [brandOptions, productForm.brand_id]);

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
    setNewCategoryName("");
  };

  const closeBrandModal = () => {
    setBrandModalOpen(false);
    setNewBrandName("");
  };

  const handleCategoryChange = (selectedOption) => {
    if (!selectedOption) {
      setProductForm((current) => ({ ...current, category_id: null, category: "" }));
      return;
    }

    if (selectedOption.value === ADD_NEW_CATEGORY_VALUE) {
      setCategoryModalOpen(true);
      return;
    }

    setProductForm((current) => ({
      ...current,
      category_id: Number(selectedOption.value),
      category: selectedOption.label,
    }));
  };

  const handleBrandChange = (selectedOption) => {
    if (!selectedOption) {
      setProductForm((current) => ({ ...current, brand_id: null, brand: "" }));
      return;
    }

    if (selectedOption.value === ADD_NEW_BRAND_VALUE) {
      setBrandModalOpen(true);
      return;
    }

    setProductForm((current) => ({
      ...current,
      brand_id: Number(selectedOption.value),
      brand: selectedOption.label,
    }));
  };

  const handleSaveCategory = async () => {
    const name = newCategoryName.trim();
    if (name.length < 2) {
      setError("Category name must be at least 2 characters.");
      return;
    }

    setSavingCategory(true);
    setError("");
    setMessage("");

    try {
      const response = await adminApi.createCategory(token, { name });
      const created = response.category;

      if (created) {
        const normalizedCategory = {
          id: Number(created.id),
          name: String(created.name || "").trim(),
        };

        setCategories((current) => mergeReferenceRows(current, normalizedCategory));
        setProductForm((current) => ({
          ...current,
          category_id: normalizedCategory.id,
          category: normalizedCategory.name,
        }));
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
    if (name.length < 2) {
      setError("Brand name must be at least 2 characters.");
      return;
    }

    setSavingBrand(true);
    setError("");
    setMessage("");

    try {
      const response = await adminApi.createBrand(token, { name });
      const created = response.brand;

      if (created) {
        const normalizedBrand = {
          id: Number(created.id),
          name: String(created.name || "").trim(),
        };

        setBrands((current) => mergeReferenceRows(current, normalizedBrand));
        setProductForm((current) => ({
          ...current,
          brand_id: normalizedBrand.id,
          brand: normalizedBrand.name,
        }));
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

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      setError("Image file must be 1 MB or smaller.");
      return;
    }

    setError("");
    setMessage("");
    setImageUploading(true);

    try {
      const imageDataUrl = await readFileAsDataUrl(file);
      setProductForm((current) => ({ ...current, image_url: imageDataUrl }));
      setMessage("Image uploaded. Submit product to send for admin approval.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleBrochureUpload = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = "";

    if (!file) {
      return;
    }

    const isPdfFile = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfFile) {
      setError("Please select a PDF datasheet.");
      return;
    }

    if (file.size > MAX_BROCHURE_FILE_SIZE) {
      setError("Datasheet file must be 1.5 MB or smaller.");
      return;
    }

    setError("");
    setMessage("");
    setBrochureUploading(true);

    try {
      const brochureDataUrl = await readFileAsDataUrl(file);
      setProductForm((current) => ({ ...current, brochure_url: brochureDataUrl }));
      setMessage("Datasheet uploaded. Submit product to send for admin approval.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBrochureUploading(false);
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!productForm.category_id) {
      setError("Please select a category.");
      return;
    }

    if (!productForm.brand_id) {
      setError("Please select a brand.");
      return;
    }

    if (!String(productForm.image_url || "").trim()) {
      setError("Please upload a product image.");
      return;
    }

    const stockQuantity = Number(productForm.stock_quantity);
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setError("Stock quantity must be a non-negative whole number.");
      return;
    }

    const payload = {
      name: productForm.name,
      model: productForm.model,
      category_id: Number(productForm.category_id),
      brand_id: Number(productForm.brand_id),
      category: productForm.category,
      brand: productForm.brand,
      stock_quantity: stockQuantity,
      price: productForm.price,
      description: productForm.description,
      specifications: {},
      image_url: productForm.image_url || null,
      brochure_url: productForm.brochure_url || null,
      status: "pending",
    };

    try {
      await adminApi.createProduct(token, user.role, payload);
      setProductForm(INITIAL_PRODUCT_FORM);
      setMessage("Product added successfully. Status is pending until admin approval.");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <section className="data-entry-panel">
      <div className="data-entry-header">
        <div>
          <h2>Add Product</h2>
        </div>
      </div>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <section className="data-entry-section-card">
        <div className="data-entry-section-head">
          <div>
            <h3>Add Product Form</h3>
          </div>
        </div>

        <form className="admin-form-grid" onSubmit={handleProductSubmit}>
          <label>
            Product Name
            <input
              type="text"
              value={productForm.name}
              onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>

          <label>
            Model
            <input
              type="text"
              value={productForm.model}
              onChange={(event) => setProductForm((current) => ({ ...current, model: event.target.value }))}
              required
            />
          </label>

          <label>
            Category
            <Select
              classNamePrefix="enterprise-brand-select"
              options={categoryOptions}
              value={selectedCategoryOption}
              onChange={handleCategoryChange}
              styles={selectStyles}
              placeholder="Search Category..."
              isSearchable
              filterOption={filterSelectOption}
              noOptionsMessage={() => "No categories found"}
            />
          </label>

          <label>
            Brand
            <Select
              classNamePrefix="enterprise-brand-select"
              options={brandOptions}
              value={selectedBrandOption}
              onChange={handleBrandChange}
              styles={selectStyles}
              placeholder="Search Brand..."
              isSearchable
              filterOption={filterSelectOption}
              noOptionsMessage={() => "No brands found"}
            />
          </label>

          <label>
            Stock Quantity
            <input
              type="number"
              min="0"
              step="1"
              value={productForm.stock_quantity}
              onChange={(event) =>
                setProductForm((current) => ({ ...current, stock_quantity: event.target.value }))
              }
              required
            />
          </label>

          <label>
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={productForm.price}
              onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
              required
            />
          </label>

          <label className="span-2">
            Description
            <textarea
              rows={3}
              value={productForm.description}
              onChange={(event) =>
                setProductForm((current) => ({ ...current, description: event.target.value }))
              }
              required
            />
          </label>

          <label className="span-2">
            Upload Image
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <span className="admin-field-hint">PNG, JPG, or WebP up to 1 MB.</span>
          </label>

          {productForm.image_url ? (
            <div className="span-2 product-image-preview-card">
              <div>
                <p>Image Preview</p>
                <img src={productForm.image_url} alt="Product preview" className="product-image-preview" />
              </div>
              <button type="button" className="btn-outline" onClick={() => setProductForm((current) => ({ ...current, image_url: "" }))}>
                Remove Image
              </button>
            </div>
          ) : null}

          <label className="span-2">
            Upload Datasheet (PDF) - optional
            <input type="file" accept=".pdf,application/pdf" onChange={handleBrochureUpload} />
            <span className="admin-field-hint">PDF up to 1.5 MB.</span>
          </label>

          {productForm.brochure_url ? (
            <div className="span-2 product-image-preview-card">
              <div>
                <p>Datasheet Attached</p>
                <a href={productForm.brochure_url} target="_blank" rel="noreferrer" className="btn-outline">
                  Open Uploaded Datasheet
                </a>
              </div>
              <button type="button" className="btn-outline" onClick={() => setProductForm((current) => ({ ...current, brochure_url: "" }))}>
                Remove Datasheet
              </button>
            </div>
          ) : null}

          <div className="admin-form-actions span-2">
            <button type="submit" className="btn-primary" disabled={imageUploading || brochureUploading}>
              {imageUploading || brochureUploading ? "Preparing Asset..." : "Submit Product"}
            </button>
          </div>
        </form>
      </section>

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
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  maxLength={120}
                  autoFocus
                  required
                />
              </label>

              <div className="enterprise-brand-add-actions">
                <button type="button" className="btn-outline" onClick={closeCategoryModal} disabled={savingCategory}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingCategory}>
                  {savingCategory ? "Adding..." : "Add Category"}
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

            <form
              className="enterprise-modal-content"
              onSubmit={(event) => {
                event.preventDefault();
                handleSaveBrand();
              }}
            >
              <label className="enterprise-brand-modal-field">
                Brand Name
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(event) => setNewBrandName(event.target.value)}
                  maxLength={120}
                  autoFocus
                  required
                />
              </label>

              <div className="enterprise-brand-add-actions">
                <button type="button" className="btn-outline" onClick={closeBrandModal} disabled={savingBrand}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingBrand}>
                  {savingBrand ? "Adding..." : "Add Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
