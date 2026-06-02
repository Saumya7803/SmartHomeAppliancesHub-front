import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Flame,
  Headphones,
  Monitor,
  Refrigerator,
  RefreshCcw,
  Search,
  ShieldCheck,
  User,
  Wind,
} from "lucide-react";
import EnquiryModal from "../components/enquiry/EnquiryModal";
import CategoryDropdownMenu from "../components/layout/CategoryDropdownMenu";
import ProductImage from "../components/product/ProductImage";
import { useCustomerAuth } from "../customer/hooks/useCustomerAuth";
import { contactInfo } from "../data/contactInfo";
import { getAllCanonicalCategories, resolveCategoryName } from "../data/categoryTaxonomy";
import { normalizePublicProduct } from "../utils/publicProductMapper";

const SORT_OPTIONS = [
  { value: "recent_desc", label: "Recently Added" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "brand_asc", label: "Brand (A-Z)" },
  { value: "brand_desc", label: "Brand (Z-A)" },
];

const DEFAULT_FILTERS = {
  search: "",
  categoryId: "",
  category: "All",
  brand: "All",
  availability: "all",
  productType: "All",
  sort: "name_asc",
};

const SORT_VALUES = new Set(SORT_OPTIONS.map((item) => item.value));
const AVAILABILITY_VALUES = new Set(["all", "in_stock", "ready_dispatch"]);

const SHOP_HERO_SLIDES = [
  {
    title: "Smart Industrial Appliances",
    subtitle: "Quotation-first procurement for cooling, kitchen, and laundry business projects.",
    cta: "Browse Products",
    image:
      "https://images.unsplash.com/photo-1742192757416-27d69a5d5029?auto=format&fit=crop&w=1920&h=900&q=80",
  },
  {
    title: "Cooling Infrastructure",
    subtitle: "Enterprise AC and air-cooling systems for offices, hospitality, and operations floors.",
    cta: "Browse Products",
    image:
      "https://images.unsplash.com/photo-1761330440311-16e160cad236?auto=format&fit=crop&w=1920&h=900&q=80",
  },
  {
    title: "Kitchen and Laundry Utility",
    subtitle: "Reliable appliances with support for bulk business sourcing and deployment.",
    cta: "Browse Products",
    image:
      "https://images.unsplash.com/photo-1646592474094-342fbc28736c?auto=format&fit=crop&w=1920&h=900&q=80",
  },
];

const SERVICE_FEATURES = [
  {
    Icon: Wind,
    title: "Project Consultation",
    description: "Solution guidance for enterprise appliance deployment.",
  },
  {
    Icon: RefreshCcw,
    title: "RFQ Response",
    description: "Quotation turnaround aligned with business timelines.",
  },
  {
    Icon: Headphones,
    title: "Sales Assistance",
    description: "Dedicated support for model selection and technical queries.",
  },
  {
    Icon: ShieldCheck,
    title: "Trusted Brands",
    description: "Approved appliance lines for industrial and commercial usage.",
  },
];

function sanitizeSortValue(sortValue) {
  const normalized = String(sortValue || "")
    .trim()
    .toLowerCase();
  return SORT_VALUES.has(normalized) ? normalized : "name_asc";
}

function sanitizeAvailabilityValue(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return AVAILABILITY_VALUES.has(normalized) ? normalized : "all";
}

function deriveProductType(product) {
  const text = [
    product.name,
    product.category,
    product.modelNumber,
    product.shortDescription,
    product.enterpriseProfile?.solutionCluster,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/(air conditioner|\bac\b|split|cassette|hvac|chiller)/.test(text)) {
    return "HVAC Systems";
  }
  if (/(cooler|air purifier|ventilation|tower fan|fan)/.test(text)) {
    return "Air Management";
  }
  if (/(refrigerator|fridge|microwave|oven|kitchen|food)/.test(text)) {
    return "Kitchen Utility";
  }
  if (/(washing|washer|laundry|dryer|steam)/.test(text)) {
    return "Laundry Utility";
  }

  return "General Appliance";
}

function readFiltersFromSearchParams(searchParams) {
  const categoryId = String(searchParams.get("category_id") || "").trim();
  const categoryFromParam = String(searchParams.get("category") || "").trim();
  const canonicalCategory = resolveCategoryName(categoryFromParam);

  return {
    search: String(searchParams.get("search") || "").trim(),
    categoryId,
    category: canonicalCategory || "All",
    brand: String(searchParams.get("brand") || "").trim() || "All",
    availability: sanitizeAvailabilityValue(searchParams.get("availability")),
    productType: String(searchParams.get("product_type") || "").trim() || "All",
    sort: sanitizeSortValue(searchParams.get("sort")),
  };
}

function areFiltersEqual(a, b) {
  return (
    a.search === b.search &&
    a.categoryId === b.categoryId &&
    a.category === b.category &&
    a.brand === b.brand &&
    a.availability === b.availability &&
    a.productType === b.productType &&
    a.sort === b.sort
  );
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function isPublishedProduct(product) {
  const rawValue = product.published ?? product.is_published ?? product.isPublished;

  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return true;
  }

  if (typeof rawValue === "string") {
    const normalized = rawValue.trim().toLowerCase();
    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }
  }

  return Boolean(rawValue);
}

function getCategoryIcon(categoryName) {
  const normalized = String(categoryName || "").trim().toLowerCase();

  if (normalized.includes("air conditioner")) return Wind;
  if (normalized.includes("cooler")) return Wind;
  if (normalized.includes("microwave")) return Flame;
  if (normalized.includes("refrigerator")) return Refrigerator;
  if (normalized.includes("washing")) return Droplet;
  if (normalized.includes("tv")) return Monitor;

  return Wind;
}

function getProductCreatedTimestamp(product) {
  const rawTimestamp = product.createdAt ?? product.created_at ?? product.created ?? null;
  const parsedTimestamp = rawTimestamp ? new Date(rawTimestamp).getTime() : Number.NaN;

  if (Number.isFinite(parsedTimestamp) && parsedTimestamp > 0) {
    return parsedTimestamp;
  }

  const fallbackNumericId = Number(product.id);
  return Number.isFinite(fallbackNumericId) ? fallbackNumericId : 0;
}

function getWhatsAppQuoteMessage(product) {
  return encodeURIComponent(
    `Hello, I want a quotation for [${product.name} - ${product.modelNumber || "-"}].`
  );
}

function normalizeProductCategory(product) {
  const canonicalCategory = resolveCategoryName(product.category);
  if (!canonicalCategory) {
    return null;
  }

  return {
    ...product,
    category: canonicalCategory,
  };
}

export default function ProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryRailRef = useRef(null);
  const accountCloseTimerRef = useRef(null);
  const { isAuthenticated, isLoading: isAuthLoading, logout } = useCustomerAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [quoteProduct, setQuoteProduct] = useState(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const [draftFilters, setDraftFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...readFiltersFromSearchParams(searchParams),
  }));
  const [appliedFilters, setAppliedFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...readFiltersFromSearchParams(searchParams),
  }));

  useEffect(() => {
    const nextFilters = {
      ...DEFAULT_FILTERS,
      ...readFiltersFromSearchParams(searchParams),
    };

    setDraftFilters((current) => (areFiltersEqual(current, nextFilters) ? current : nextFilters));
    setAppliedFilters((current) => (areFiltersEqual(current, nextFilters) ? current : nextFilters));
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/products", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch products (${response.status})`);
        }

        const payload = await response.json();
        const apiProducts = Array.isArray(payload.products) ? payload.products : [];
        const approvedProducts = apiProducts.filter(
          (product) => normalizeStatus(product.status) === "approved" && isPublishedProduct(product)
        );
        const normalizedProducts = approvedProducts
          .map(normalizePublicProduct)
          .map(normalizeProductCategory)
          .filter(Boolean);

        if (!ignore) {
          setProducts(normalizedProducts);
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }

        if (!ignore) {
          setProducts([]);
          setError(requestError.message || "Failed to load products");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % SHOP_HERO_SLIDES.length);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const categories = useMemo(() => {
    const availableCategories = new Set(products.map((product) => product.category).filter(Boolean));
    const canonicalCategories = getAllCanonicalCategories().filter((category) => availableCategories.has(category));
    return ["All", ...canonicalCategories];
  }, [products]);
  const brands = useMemo(
    () => ["All", ...new Set(products.map((product) => product.brand).filter(Boolean))],
    [products]
  );
  const productTypes = useMemo(
    () => ["All", ...new Set(products.map((product) => deriveProductType(product)).filter(Boolean))],
    [products]
  );

  useEffect(() => {
    const normalizeFilterState = (current) => {
      const nextCategory = categories.includes(current.category) ? current.category : "All";
      const nextBrand = brands.includes(current.brand) ? current.brand : "All";
      const nextProductType = productTypes.includes(current.productType) ? current.productType : "All";
      const nextAvailability = sanitizeAvailabilityValue(current.availability);
      const nextSort = sanitizeSortValue(current.sort);

      if (
        nextCategory === current.category &&
        nextBrand === current.brand &&
        nextProductType === current.productType &&
        nextAvailability === current.availability &&
        nextSort === current.sort
      ) {
        return current;
      }

      return {
        ...current,
        category: nextCategory,
        brand: nextBrand,
        productType: nextProductType,
        availability: nextAvailability,
        sort: nextSort,
      };
    };

    setDraftFilters(normalizeFilterState);
    setAppliedFilters(normalizeFilterState);
  }, [categories, brands, productTypes]);

  const productsView = String(searchParams.get("view") || "")
    .trim()
    .toLowerCase();

  const applyFilters = () => {
    const nextFilters = {
      ...draftFilters,
      search: draftFilters.search.trim(),
      sort: sanitizeSortValue(draftFilters.sort),
      availability: sanitizeAvailabilityValue(draftFilters.availability),
    };

    setAppliedFilters(nextFilters);

    const params = new URLSearchParams();
    if (productsView === "recent") {
      params.set("view", productsView);
    }
    if (nextFilters.search) {
      params.set("search", nextFilters.search);
    }
    if (nextFilters.categoryId) {
      params.set("category_id", nextFilters.categoryId);
      params.set("category", nextFilters.category);
    } else if (nextFilters.category !== "All") {
      params.set("category", nextFilters.category);
    }
    if (nextFilters.brand !== "All") {
      params.set("brand", nextFilters.brand);
    }
    if (nextFilters.availability !== "all") {
      params.set("availability", nextFilters.availability);
    }
    if (nextFilters.productType !== "All") {
      params.set("product_type", nextFilters.productType);
    }
    if (nextFilters.sort !== "name_asc") {
      params.set("sort", nextFilters.sort);
    }

    setSearchParams(params, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    const normalizedSearch = appliedFilters.search.toLowerCase();
    const selectedCategoryId = appliedFilters.categoryId ? Number(appliedFilters.categoryId) : null;
    const hasCategoryIdFilter = Number.isInteger(selectedCategoryId);
    const selectedCategory = resolveCategoryName(appliedFilters.category);

    const nextProducts = products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        [product.name, product.brand, product.modelNumber, product.shortDescription]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      let matchesCategory = selectedCategory ? product.category === selectedCategory : appliedFilters.category === "All";

      if (hasCategoryIdFilter) {
        if (product.categoryId !== null && product.categoryId !== undefined) {
          matchesCategory = Number(product.categoryId) === selectedCategoryId;
        } else {
          matchesCategory = selectedCategory ? product.category === selectedCategory : matchesCategory;
        }
      }

      const matchesBrand = appliedFilters.brand === "All" || product.brand === appliedFilters.brand;
      const productType = deriveProductType(product);
      const matchesProductType = appliedFilters.productType === "All" || productType === appliedFilters.productType;

      let matchesAvailability = true;
      if (appliedFilters.availability === "in_stock") {
        matchesAvailability = Number(product.stockQuantity || 0) > 0;
      }
      if (appliedFilters.availability === "ready_dispatch") {
        matchesAvailability = Number(product.stockQuantity || 0) >= 5;
      }

      return matchesSearch && matchesCategory && matchesBrand && matchesProductType && matchesAvailability;
    });

    nextProducts.sort((a, b) => {
      if (appliedFilters.sort === "recent_desc") {
        return getProductCreatedTimestamp(b) - getProductCreatedTimestamp(a);
      }
      if (appliedFilters.sort === "name_desc") {
        return b.name.localeCompare(a.name);
      }
      if (appliedFilters.sort === "brand_asc") {
        return a.brand.localeCompare(b.brand);
      }
      if (appliedFilters.sort === "brand_desc") {
        return b.brand.localeCompare(a.brand);
      }
      return a.name.localeCompare(b.name);
    });

    return nextProducts;
  }, [products, appliedFilters]);

  const visualCategories = useMemo(
    () => categories.filter((category) => category !== "All"),
    [categories]
  );
  const activeCategoryLabel = appliedFilters.category === "All" ? "All Categories" : appliedFilters.category;

  const handleHeaderSearchSubmit = (event) => {
    event.preventDefault();
    applyFilters();
  };

  const activeNavItem = useMemo(() => {
    if (location.pathname === "/") {
      return "home";
    }
    if (location.pathname === "/about") {
      return "about";
    }
    if (location.pathname === "/contact") {
      return "contact";
    }
    if (location.pathname.startsWith("/products")) {
      if (productsView === "recent") {
        return "recent";
      }
      return "products";
    }
    return "";
  }, [location.pathname, productsView]);

  const navItemClassName = (itemKey) => `shop-nav-link ${activeNavItem === itemKey ? "active" : ""}`;

  const productsLinkTo = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("view");
    const queryString = params.toString();
    return queryString ? `/products?${queryString}` : "/products";
  }, [searchParams]);

  const applySortPreset = (sortValue, viewValue) => {
    const nextSort = sanitizeSortValue(sortValue);

    setDraftFilters((current) => ({ ...current, sort: nextSort }));
    setAppliedFilters((current) => ({ ...current, sort: nextSort }));

    const params = new URLSearchParams(searchParams);
    if (viewValue) {
      params.set("view", viewValue);
    }
    if (nextSort === "name_asc") {
      params.delete("sort");
    } else {
      params.set("sort", nextSort);
    }
    setSearchParams(params, { replace: true });
  };

  const handleAccountClick = () => {
    if (isAuthLoading) {
      return;
    }

    setAccountMenuOpen((value) => !value);
  };

  const handleAccountMouseEnter = () => {
    if (accountCloseTimerRef.current) {
      clearTimeout(accountCloseTimerRef.current);
      accountCloseTimerRef.current = null;
    }
    setAccountMenuOpen(true);
  };

  const handleAccountMouseLeave = () => {
    accountCloseTimerRef.current = setTimeout(() => {
      setAccountMenuOpen(false);
      accountCloseTimerRef.current = null;
    }, 220);
  };

  const handleCustomerLogout = () => {
    logout();
    setAccountMenuOpen(false);
    navigate("/signin");
  };

  const setCategoryFilter = (categoryName) => {
    const normalizedCategory = categoryName || "All";

    setDraftFilters((current) => ({
      ...current,
      category: normalizedCategory,
      categoryId: "",
    }));
    setAppliedFilters((current) => ({
      ...current,
      category: normalizedCategory,
      categoryId: "",
    }));

    const params = new URLSearchParams(searchParams);
    if (normalizedCategory === "All") {
      params.delete("category");
      params.delete("category_id");
    } else {
      params.set("category", normalizedCategory);
      params.delete("category_id");
    }
    setSearchParams(params, { replace: true });
  };

  const shiftHeroSlide = (direction) => {
    setHeroSlideIndex((current) => {
      if (direction < 0) {
        return current === 0 ? SHOP_HERO_SLIDES.length - 1 : current - 1;
      }
      return (current + 1) % SHOP_HERO_SLIDES.length;
    });
  };

  const scrollCategoryRail = (direction) => {
    if (!categoryRailRef.current) {
      return;
    }

    categoryRailRef.current.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  };

  return (
    <main className="shop-products-page">
      <header className="shop-header-shell">
        <div className="container shop-top-header">
          <Link to="/" className="shop-brand-lockup">
            <span className="shop-brand-icon" aria-hidden="true">
              SH
            </span>
            <span className="shop-brand-copy">
              <strong>SmartHome Automation</strong>
              <small>Industrial Appliance Store</small>
            </span>
          </Link>

          <form className="shop-search-form" onSubmit={handleHeaderSearchSubmit}>
            <input
              className="shop-search-input"
              type="search"
              placeholder="Search by product, brand, model, or type"
              value={draftFilters.search}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
            />
            <button type="submit" className="shop-search-icon" aria-label="Search products">
              <Search size={18} strokeWidth={2} />
            </button>
          </form>

          <div className="shop-header-actions">
            <div
              className={`account-dropdown ${accountMenuOpen ? "open" : ""}`}
              onMouseEnter={handleAccountMouseEnter}
              onMouseLeave={handleAccountMouseLeave}
            >
            <button
              type="button"
              className="shop-header-action"
              onClick={handleAccountClick}
              disabled={isAuthLoading}
            >
              <span className="shop-header-action-icon" aria-hidden="true">
                <User size={22} strokeWidth={2} />
              </span>
              <span>{isAuthenticated ? "My Account" : "Customer Login"}</span>
              <ChevronDown size={16} strokeWidth={2} />
            </button>
              {accountMenuOpen ? (
                <div className="account-dropdown-menu">
                  {!isAuthenticated ? (
                    <>
                      <Link to="/signin" onClick={() => setAccountMenuOpen(false)}>
                        Sign In
                      </Link>
                      <Link to="/signup" onClick={() => setAccountMenuOpen(false)}>
                        Create Account
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/account" state={{ section: "profile" }} onClick={() => setAccountMenuOpen(false)}>
                        My Profile
                      </Link>
                      <Link to="/orders" state={{ section: "orders" }} onClick={() => setAccountMenuOpen(false)}>
                        My Orders
                      </Link>
                      <Link
                        to="/quotes"
                        state={{ section: "quotations" }}
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        Requested Quotes
                      </Link>
                      <button type="button" onClick={handleCustomerLogout}>
                        Logout
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shop-nav-shell">
          <div className="container shop-nav-row">
            <CategoryDropdownMenu />

            <nav className="shop-nav-links" aria-label="Shop sections">
              <NavLink to="/" end className={() => navItemClassName("home")}>
                Home
              </NavLink>
              <NavLink to={productsLinkTo} end className={() => navItemClassName("products")}>
                Products
              </NavLink>
              <button
                type="button"
                className={navItemClassName("recent")}
                onClick={() => {
                  applySortPreset("recent_desc", "recent");
                  document.getElementById("shop-products")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Recently Added
              </button>
              <NavLink to="/about" className={() => navItemClassName("about")}>
                About
              </NavLink>
              <NavLink to="/contact" className={() => navItemClassName("contact")}>
                Contact
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <section className="shop-hero-section">
        <div className="container">
          <div className="shop-hero-slider">
            <div className="shop-hero-track" style={{ transform: `translateX(-${heroSlideIndex * 100}%)` }}>
              {SHOP_HERO_SLIDES.map((slide) => (
                <article key={slide.title} className="shop-hero-slide">
                  <img src={slide.image} alt={slide.title} loading="lazy" />
                  <div className="shop-hero-overlay">
                    <p>B2B Appliance Procurement</p>
                    <h1>{slide.title}</h1>
                    <p>{slide.subtitle}</p>
                    <button
                      type="button"
                      className="shop-hero-cta"
                      onClick={() => document.getElementById("shop-products")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      {slide.cta}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="shop-hero-arrow left"
              aria-label="Previous slide"
              onClick={() => shiftHeroSlide(-1)}
            >
              <ChevronLeft size={18} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="shop-hero-arrow right"
              aria-label="Next slide"
              onClick={() => shiftHeroSlide(1)}
            >
              <ChevronRight size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </section>

      <section className="shop-service-strip">
        <div className="container shop-service-grid">
          {SERVICE_FEATURES.map((feature) => {
            const ServiceIcon = feature.Icon;

            return (
              <article key={feature.title} className="shop-service-item">
                <span className="shop-service-icon" aria-hidden="true">
                  <ServiceIcon size={22} strokeWidth={2} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="shop-category-section">
        <div className="container">
          <div className="shop-category-head">
            <div>
              <p>Find By Segment</p>
              <h2>Categories</h2>
            </div>
            <div className="shop-category-rail-arrows">
              <button type="button" onClick={() => scrollCategoryRail(-1)} aria-label="Scroll categories left">
                <ChevronLeft size={18} strokeWidth={2.2} />
              </button>
              <button type="button" onClick={() => scrollCategoryRail(1)} aria-label="Scroll categories right">
                <ChevronRight size={18} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          <div className="shop-category-rail" ref={categoryRailRef}>
            {visualCategories.map((category) => {
              const CategoryIcon = getCategoryIcon(category);

              return (
                <button
                  key={category}
                  type="button"
                  className={`shop-category-pill ${appliedFilters.category === category ? "active" : ""}`}
                  onClick={() => setCategoryFilter(category)}
                >
                  <span className="shop-category-icon" aria-hidden="true">
                    <CategoryIcon size={28} strokeWidth={2} />
                  </span>
                  <span>{category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="shop-products-section" id="shop-products">
        <div className="container shop-products-layout">
          <aside className="shop-filter-sidebar">
            <h3>Filters</h3>

            <div className="shop-filter-group">
              <p>Category</p>
              <button
                type="button"
                className={appliedFilters.category === "All" ? "active" : ""}
                onClick={() => setCategoryFilter("All")}
              >
                All Categories
              </button>
              {visualCategories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={appliedFilters.category === category ? "active" : ""}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="shop-filter-group">
              <label htmlFor="shop-brand-filter">Brand</label>
              <select
                id="shop-brand-filter"
                value={draftFilters.brand}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, brand: event.target.value }))
                }
              >
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="shop-filter-group">
              <label htmlFor="shop-availability-filter">Availability</label>
              <select
                id="shop-availability-filter"
                value={draftFilters.availability}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, availability: event.target.value }))
                }
              >
                <option value="all">All</option>
                <option value="in_stock">In Stock</option>
                <option value="ready_dispatch">Ready Dispatch</option>
              </select>
            </div>

            <div className="shop-filter-group">
              <label htmlFor="shop-product-type-filter">Product Type</label>
              <select
                id="shop-product-type-filter"
                value={draftFilters.productType}
                onChange={(event) =>
                  setDraftFilters((current) => ({ ...current, productType: event.target.value }))
                }
              >
                {productTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <button type="button" className="shop-filter-apply" onClick={applyFilters}>
              Apply Filters
            </button>
          </aside>

          <div className="shop-products-main">
            <div className="shop-products-toolbar">
              <div>
                <h2>Category: {activeCategoryLabel}</h2>
                {!loading ? <p>{filteredProducts.length} items found</p> : null}
              </div>

              <label>
                Sort
                <select
                  value={draftFilters.sort}
                  onChange={(event) =>
                    setDraftFilters((current) => ({ ...current, sort: event.target.value }))
                  }
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {loading ? (
              <div className="shop-state-box">
                <p>Loading products...</p>
              </div>
            ) : null}

            {!loading && error ? (
              <div className="shop-state-box">
                <h3>Unable to load products</h3>
                <p>{error}</p>
              </div>
            ) : null}

            {!loading && !error && filteredProducts.length ? (
              <div className="shop-product-grid">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="shop-product-card">
                    <Link to={`/products/${product.id}`} className="shop-product-image-wrap">
                      <ProductImage
                        src={product.image}
                        fallbackSrc={product.fallbackImage}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>

                    <div className="shop-product-content">
                      <p className="shop-product-brand">{product.brand}</p>
                      <h3 className="shop-product-title">{product.name}</h3>
                      <p className="shop-product-model">Model Number: {product.modelNumber || "-"}</p>
                      <p className="shop-product-quote-note">Available for Business Quotation</p>

                      <div className="shop-product-actions">
                        <button
                          type="button"
                          className="shop-product-action-btn"
                          onClick={() => setQuoteProduct(product)}
                        >
                          Request Quote
                        </button>
                        <Link to={`/products/${product.id}`} className="shop-product-action-btn">
                          View Details
                        </Link>
                        <a
                          href={`${contactInfo.whatsappHref}?text=${getWhatsAppQuoteMessage(product)}`}
                          className="shop-product-action-btn"
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp Enquiry
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {!loading && !error && !filteredProducts.length ? (
              <div className="shop-state-box">
                <h3>No products found</h3>
                <p>Try changing category, brand, availability, or product type filters.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {quoteProduct ? <EnquiryModal product={quoteProduct} onClose={() => setQuoteProduct(null)} /> : null}
    </main>
  );
}
