import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Monitor,
  Shirt,
  Snowflake,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { getCategoryGroups, resolveCategoryName } from "../../data/categoryTaxonomy";
import { buildApiUrl } from "../../utils/apiBase";

const CLOSE_DELAY_MS = 320;
const MOBILE_BREAKPOINT_PX = 920;
const FEATURED_MENU_IMAGE =
  "https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=900&q=80";

const GROUP_ICON_BY_KEY = Object.freeze({
  cooling: Snowflake,
  kitchen: UtensilsCrossed,
  entertainment: Monitor,
  laundry: Shirt,
});

function toCategoryRows(payload) {
  const rows = Array.isArray(payload?.categories) ? payload.categories : [];

  return rows
    .map((row) => ({
      id: Number(row?.id),
      name: String(row?.name || "").trim(),
    }))
    .filter((row) => Number.isInteger(row.id) && row.id > 0 && row.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildCategoryPath(category) {
  const params = new URLSearchParams();
  if (Number.isInteger(category.id) && category.id > 0) {
    params.set("category_id", String(category.id));
  }
  params.set("category", category.canonicalName);
  return `/products?${params.toString()}`;
}

function groupCategoryRows(categories) {
  const categoryByCanonicalName = new Map();

  categories.forEach((category) => {
    const canonicalName = resolveCategoryName(category.name);
    if (!canonicalName || categoryByCanonicalName.has(canonicalName)) {
      return;
    }
    categoryByCanonicalName.set(canonicalName, {
      ...category,
      canonicalName,
    });
  });

  return getCategoryGroups().map((group) => ({
    ...group,
    Icon: GROUP_ICON_BY_KEY[group.key],
    categories: group.categories.map((name) => {
      const fromApi = categoryByCanonicalName.get(name);
      return fromApi || { id: null, name, canonicalName: name };
    }),
  }));
}

export default function CategoryDropdownMenu({ onNavigate }) {
  const location = useLocation();
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const wasMobileRef = useRef(false);
  const interactionStateRef = useRef({
    trigger: false,
    panel: false,
    focusWithin: false,
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    cooling: true,
    kitchen: true,
    laundry: true,
  });

  const activeSearch = location.search;
  const activeCategoryId = useMemo(
    () => String(new URLSearchParams(activeSearch).get("category_id") || "").trim(),
    [activeSearch]
  );
  const activeCategoryName = useMemo(
    () => resolveCategoryName(new URLSearchParams(activeSearch).get("category")),
    [activeSearch]
  );

  const groupedCategories = useMemo(() => groupCategoryRows(categories), [categories]);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const closeMenu = useCallback(() => {
    clearCloseTimeout();
    interactionStateRef.current = {
      trigger: false,
      panel: false,
      focusWithin: false,
    };
    setIsOpen(false);
  }, [clearCloseTimeout]);

  const openMenu = useCallback(() => {
    clearCloseTimeout();
    setIsOpen(true);
  }, [clearCloseTimeout]);

  const scheduleClose = useCallback(() => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      const { trigger, panel, focusWithin } = interactionStateRef.current;
      if (!trigger && !panel && !focusWithin) {
        setIsOpen(false);
      }
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimeout]);

  const setInteractionState = useCallback(
    (key, value) => {
      interactionStateRef.current[key] = value;
      if (value) {
        openMenu();
      } else {
        scheduleClose();
      }
    },
    [openMenu, scheduleClose]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
    const applyMatch = (matches) => {
      setIsMobileView(matches);
    };

    applyMatch(mediaQuery.matches);

    const handleChange = (event) => applyMatch(event.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }

    mediaQuery.addListener(handleChange);
    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }, []);

  useEffect(() => {
    if (isMobileView && !wasMobileRef.current) {
      setExpandedSections({
        cooling: true,
        kitchen: false,
        laundry: false,
      });
    }

    if (!isMobileView && wasMobileRef.current) {
      setExpandedSections({
        cooling: true,
        kitchen: true,
        laundry: true,
      });
    }

    wasMobileRef.current = isMobileView;
  }, [isMobileView]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function fetchCategories() {
      setCategoriesLoading(true);
      try {
        const response = await fetch(buildApiUrl("/categories"), { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch categories (${response.status})`);
        }

        const payload = await response.json();
        const rows = toCategoryRows(payload);

        if (!ignore) {
          setCategories(rows);
        }
      } catch (requestError) {
        if (requestError.name === "AbortError") {
          return;
        }

        if (!ignore) {
          setCategories([]);
        }
      } finally {
        if (!ignore) {
          setCategoriesLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, closeMenu]);

  useEffect(
    () => () => {
      clearCloseTimeout();
    },
    [clearCloseTimeout]
  );

  const handleBlurCapture = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setInteractionState("focusWithin", false);
    }
  };

  const handleCategoryClick = () => {
    closeMenu();
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleTriggerClick = () => {
    clearCloseTimeout();
    setIsOpen((current) => {
      const next = !current;
      if (!next) {
        interactionStateRef.current = {
          trigger: false,
          panel: false,
          focusWithin: false,
        };
      }
      return next;
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      closeMenu();
      triggerRef.current?.focus();
    }
  };

  const toggleSection = (sectionKey) => {
    if (!isMobileView) {
      return;
    }

    setExpandedSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  };

  return (
    <div
      ref={menuRef}
      className={`category-menu ${isOpen ? "open" : ""}`}
      onFocusCapture={() => setInteractionState("focusWithin", true)}
      onBlurCapture={handleBlurCapture}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        className="category-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onMouseEnter={() => {
          if (!isMobileView) {
            setInteractionState("trigger", true);
          }
        }}
        onMouseLeave={() => {
          if (!isMobileView) {
            setInteractionState("trigger", false);
          }
        }}
        onClick={handleTriggerClick}
      >
        <span className="category-menu-badge" aria-hidden="true">
          <Menu size={16} strokeWidth={2.2} />
        </span>
        <span>ALL CATEGORY</span>
        <span className="category-menu-arrow" aria-hidden="true">
          <ChevronDown size={14} strokeWidth={2.1} />
        </span>
      </button>

      <div
        className="category-mega-panel"
        role="menu"
        aria-label="All categories"
        onMouseEnter={() => {
          if (!isMobileView) {
            setInteractionState("panel", true);
          }
        }}
        onMouseLeave={() => {
          if (!isMobileView) {
            setInteractionState("panel", false);
          }
        }}
      >
        {categoriesLoading ? <p className="category-mega-empty">Loading categories...</p> : null}

        {!categoriesLoading && !categories.length ? (
          <p className="category-mega-empty">No categories found.</p>
        ) : null}

        {!categoriesLoading && categories.length ? (
          <>
            <div className="category-mega-grid">
              <div className="category-mega-groups">
                {groupedCategories.map((group) => {
                  const isExpanded = !isMobileView || Boolean(expandedSections[group.key]);
                  const GroupIcon = group.Icon || Sparkles;

                  return (
                    <section className={`category-group ${isExpanded ? "expanded" : ""}`} key={group.key}>
                      <button
                        type="button"
                        className={`category-group-toggle ${isExpanded ? "expanded" : ""}`}
                        onClick={() => toggleSection(group.key)}
                        aria-expanded={isExpanded}
                      >
                        <span className="category-group-heading">
                          <span className="category-group-icon" aria-hidden="true">
                            <GroupIcon size={16} strokeWidth={2} />
                          </span>
                          <span className="category-group-title">{group.title}</span>
                        </span>
                        <span className="category-group-arrow" aria-hidden="true">
                          <ChevronDown size={14} strokeWidth={2} />
                        </span>
                      </button>

                      {isExpanded ? (
                        <div className="category-group-body">
                          <div className="category-group-list">
                            {group.categories.length ? (
                              group.categories.map((category) => {
                                const isActive =
                                  String(category.id) === activeCategoryId ||
                                  category.canonicalName === activeCategoryName;

                                return (
                                  <Link
                                    key={category.id}
                                    to={buildCategoryPath(category)}
                                    className={`category-group-item ${isActive ? "active" : ""}`}
                                    role="menuitem"
                                    onClick={handleCategoryClick}
                                  >
                                    <span>{category.canonicalName}</span>
                                  </Link>
                                );
                              })
                            ) : (
                              <p className="category-group-empty">No categories available.</p>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </div>

              <aside className="category-featured-card">
                <img
                  src={FEATURED_MENU_IMAGE}
                  alt="Latest Smart Appliances"
                  className="category-featured-image"
                />
                <div className="category-featured-content">
                  <p className="category-featured-eyebrow">Featured Appliance</p>
                  <h4>Latest Smart Appliances</h4>
                  <p>Discover cooling, kitchen and laundry solutions.</p>
                  <Link to="/products" className="category-featured-cta" onClick={handleCategoryClick}>
                    <Sparkles size={15} strokeWidth={2} />
                    <span>Explore</span>
                  </Link>
                </div>
              </aside>
            </div>

            <div className="category-mega-footer">
              <Link to="/products" className="category-view-all-btn" onClick={handleCategoryClick}>
                <span>View All Products</span>
                <ArrowRight size={15} strokeWidth={2.1} />
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
