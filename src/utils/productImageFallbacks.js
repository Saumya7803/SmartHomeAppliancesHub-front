import bajajAirCoolerImage from "../assets/products/coolers/bajaj-shield-series-elevate-90l.webp";
import ifbWashingMachineImage from "../assets/products/ifb-7kg-washer.webp";
import lgRefrigeratorImage from "../assets/products/lg-260l-refrigerator.webp";
import samsungAcImage from "../assets/products/samsung-1-5-ton-ac.webp";
import sony55TvImage from "../assets/products/sony-55-4k-tv.webp";

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function escapeSvgText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createPlaceholderDataUri(label, accentColor = "#1f4fd6") {
  const safeLabel = escapeSvgText(label || "Product image");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="${safeLabel}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f5f8ff" />
          <stop offset="100%" stop-color="#dbe7ff" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" rx="36" fill="url(#bg)" />
      <rect x="92" y="92" width="616" height="416" rx="28" fill="white" fill-opacity="0.6" />
      <circle cx="400" cy="252" r="84" fill="${accentColor}" fill-opacity="0.12" />
      <path d="M356 294l30-34 40 42 26-30 48 56H300z" fill="${accentColor}" fill-opacity="0.78" />
      <circle cx="346" cy="226" r="18" fill="${accentColor}" fill-opacity="0.7" />
      <text x="400" y="408" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#183153">${safeLabel}</text>
      <text x="400" y="446" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#4c6286">Image unavailable</text>
    </svg>
  `
    .replace(/\s+/g, " ")
    .trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const FALLBACKS_BY_NAME = Object.freeze({
  "bajaj personal air cooler": bajajAirCoolerImage,
  "bajaj platini personal air cooler": bajajAirCoolerImage,
  "bajaj shield series elevate desert air cooler 90l": bajajAirCoolerImage,
  "symphony maxwind 80 xl+ desert air cooler": bajajAirCoolerImage,
  "crompton optimus wac 70 window air cooler": bajajAirCoolerImage,
  "havells koolmaster 105 l desert air cooler": bajajAirCoolerImage,
  "lg double door refrigerator": lgRefrigeratorImage,
  "lg double door refrigerator 260l": lgRefrigeratorImage,
  "lg front load washing machine": ifbWashingMachineImage,
  "lg front load washing machine 7kg": ifbWashingMachineImage,
  "sony bravia pro display 55-inch": sony55TvImage,
  "samsung uhd commercial tv 50-inch": sony55TvImage,
  "lg digital signage tv 43-inch": sony55TvImage,
  "panasonic provision display 65-inch": sony55TvImage,
});

const FALLBACKS_BY_CATEGORY = Object.freeze({
  TV: sony55TvImage,
  LCD: sony55TvImage,
  "Air Conditioner": samsungAcImage,
  "Air Cooler": bajajAirCoolerImage,
  Refrigerator: lgRefrigeratorImage,
  "Washing Machine": ifbWashingMachineImage,
  Microwave: createPlaceholderDataUri("Microwave"),
  "Microwave Oven": createPlaceholderDataUri("Microwave"),
});

export function getProductFallbackImage(product) {
  const normalizedName = normalizeText(product?.name);
  const categoryName = String(product?.category || "").trim();

  return (
    FALLBACKS_BY_NAME[normalizedName] ||
    FALLBACKS_BY_CATEGORY[categoryName] ||
    createPlaceholderDataUri(categoryName || product?.name || "Product")
  );
}
