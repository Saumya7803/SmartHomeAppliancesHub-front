import bajajAirCoolerImage from "../assets/products/coolers/bajaj-shield-series-elevate-90l.webp";
import ifbWashingMachineImage from "../assets/products/ifb-7kg-washer.webp";
import lgRefrigeratorImage from "../assets/products/lg-260l-refrigerator.webp";
import samsungAcImage from "../assets/products/samsung-1-5-ton-ac.webp";
import sony55TvImage from "../assets/products/sony-55-4k-tv.webp";
import voltasAcImage from "../assets/products/voltas-1-5-ac.webp";
import { resolveCategoryName } from "../data/categoryTaxonomy";
import { getProductFallbackImage } from "./productImageFallbacks";

const DEFAULT_PRODUCT_IMAGE = lgRefrigeratorImage;

const PRODUCT_IMAGE_FALLBACK = Object.freeze({
  "lg dual inverter split ac 1.5 ton": samsungAcImage,
  "voltas window ac": voltasAcImage,
  "voltas adjustable inverter ac 1.5 ton": voltasAcImage,
  "bajaj personal air cooler": bajajAirCoolerImage,
  "bajaj platini personal air cooler": bajajAirCoolerImage,
  "ifb solo microwave": "https://upload.wikimedia.org/wikipedia/commons/e/ef/LG_Microwave_oven.jpg",
  "ifb solo microwave oven 23l": "https://upload.wikimedia.org/wikipedia/commons/e/ef/LG_Microwave_oven.jpg",
  "lg double door refrigerator": lgRefrigeratorImage,
  "lg double door refrigerator 260l": lgRefrigeratorImage,
  "lg front load washing machine": ifbWashingMachineImage,
  "lg front load washing machine 7kg": ifbWashingMachineImage,
  "sony bravia pro display 55-inch": sony55TvImage,
  "samsung uhd commercial tv 50-inch": sony55TvImage,
  "lg digital signage tv 43-inch": sony55TvImage,
  "panasonic provision display 65-inch": sony55TvImage,
});

const CATEGORY_IMAGE_FALLBACK = {
  Refrigerator: lgRefrigeratorImage,
  "Air Conditioner": samsungAcImage,
  "Air Cooler": bajajAirCoolerImage,
  "Washing Machine": ifbWashingMachineImage,
  Microwave: "https://upload.wikimedia.org/wikipedia/commons/e/ef/LG_Microwave_oven.jpg",
  TV: sony55TvImage,
  LCD: sony55TvImage,
};

const DEFAULT_ENTERPRISE_PROFILE = {
  solutionCluster: "Enterprise Utility Systems",
  deploymentEnvironment: "Corporate and institutional deployment environments",
  procurementModel: "Project-based B2B procurement",
  leadTimeRange: "7-12 business days",
  warrantyPlan: "Manufacturer warranty with optional service plan",
  supportSla: "Response SLA as per service region",
  complianceStandards: "Standard electrical and safety compliance",
  moqGuideline: "2 units (project scope may vary)",
  implementationWindow: "Flexible deployment scheduling",
};

function parsePublishedValue(value) {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }
  }

  return Boolean(value);
}

function normalizeTechnicalSpecifications(product) {
  const specifications =
    typeof product.specifications === "object" && product.specifications !== null
      ? product.specifications
      : {};

  if (Object.keys(specifications).length) {
    return specifications;
  }

  return {
    Model: product.model || product.modelNumber || "-",
    Category: product.category || "-",
    Brand: product.brand || "-",
  };
}

export function normalizePublicProduct(product) {
  const rawCategoryId = product.category_id ?? product.categoryId ?? null;
  const categoryId = rawCategoryId === null || rawCategoryId === undefined || rawCategoryId === ""
    ? null
    : Number(rawCategoryId);

  const canonicalCategory = resolveCategoryName(product.category);
  const normalizedName = String(product.name || "")
    .trim()
    .toLowerCase();

  return {
    id: String(product.id),
    categoryId: Number.isNaN(categoryId) ? null : categoryId,
    name: product.name || "Unnamed Product",
    category: canonicalCategory || product.category || "General",
    brand: product.brand || "Unknown",
    modelNumber: product.model || product.modelNumber || "-",
    price: Number(product.price || 0),
    stockQuantity: Number(product.stock_quantity ?? product.stockQuantity ?? 0),
    shortDescription:
      product.shortDescription || product.description || "Enterprise appliance solution.",
    longDescription:
      product.longDescription || product.description || "Enterprise appliance solution.",
    applicationUse:
      product.applicationUse || "Commercial procurement and enterprise deployment use cases.",
    technicalSpecifications: normalizeTechnicalSpecifications(product),
    enterpriseProfile: product.enterpriseProfile || DEFAULT_ENTERPRISE_PROFILE,
    brochureUrl: product.brochure_url || product.brochureUrl || null,
    image:
      product.image_url ||
      product.imageUrl ||
      product.image ||
      PRODUCT_IMAGE_FALLBACK[normalizedName] ||
      CATEGORY_IMAGE_FALLBACK[canonicalCategory || product.category] ||
      DEFAULT_PRODUCT_IMAGE,
    fallbackImage: getProductFallbackImage({
      name: product.name,
      category: canonicalCategory || product.category,
    }),
    status: product.status || "approved",
    published: parsePublishedValue(product.published ?? product.is_published ?? product.isPublished),
    createdAt: product.created_at || product.createdAt || product.created || null,
  };
}

export function getMockApprovedProducts() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem("smarthome_admin_products");
    if (!rawValue) {
      return [];
    }

    const products = JSON.parse(rawValue);
    if (!Array.isArray(products)) {
      return [];
    }

    return products
      .filter((product) => String(product.status || "").trim().toLowerCase() === "approved")
      .filter((product) => parsePublishedValue(product.published ?? product.is_published ?? product.isPublished))
      .map(normalizePublicProduct);
  } catch {
    return [];
  }
}
