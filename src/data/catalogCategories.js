const HOME_APPLIANCE_CATEGORIES = Object.freeze([
  {
    id: 1,
    category_name: "Air Conditioner",
    icon: "❄️",
    legacyMatches: ["AC"],
    previewProducts: ["Inverter Split AC", "Cassette AC", "Window AC"],
    subcategories: ["Inverter AC", "Window AC", "Commercial AC"],
  },
  {
    id: 2,
    category_name: "Refrigerator",
    icon: "🧊",
    legacyMatches: ["Refrigerator"],
    previewProducts: ["Double Door", "Side-by-Side", "Convertible"],
    subcategories: ["Single Door", "Double Door", "Side-by-Side"],
  },
  {
    id: 3,
    category_name: "Air Cooler",
    icon: "🌬️",
    legacyMatches: ["Cooler"],
    previewProducts: ["Desert Cooler", "Tower Cooler", "Window Cooler"],
    subcategories: ["Desert Cooler", "Tower Cooler", "Personal Cooler"],
  },
  {
    id: 4,
    category_name: "Washing Machine",
    icon: "🧺",
    legacyMatches: ["Washing Machine"],
    previewProducts: ["Front Load", "Top Load", "Semi-Automatic"],
    subcategories: ["Front Load", "Top Load", "Semi Automatic"],
  },
  {
    id: 5,
    category_name: "Microwave Oven",
    icon: "🔥",
    legacyMatches: ["Microwave Oven"],
    previewProducts: ["Solo Microwave", "Grill Microwave", "Convection Microwave"],
    subcategories: ["Solo", "Grill", "Convection"],
  },
  {
    id: 6,
    category_name: "LED TV",
    icon: "📺",
    legacyMatches: ["TV", "LCD"],
    previewProducts: ["Full HD TV", "4K TV", "Smart TV"],
    subcategories: ["32 Inch", "43 Inch", "55 Inch+"],
  },
  {
    id: 7,
    category_name: "Water Heater",
    icon: "🚿",
    legacyMatches: ["Water Heater", "Geyser"],
    previewProducts: ["Storage Geyser", "Instant Geyser", "Heat Pump"],
    subcategories: ["Storage", "Instant", "Solar Compatible"],
  },
  {
    id: 8,
    category_name: "Air Purifier",
    icon: "🍃",
    legacyMatches: ["Air Purifier"],
    previewProducts: ["HEPA Purifier", "UV Purifier", "Smart Purifier"],
    subcategories: ["HEPA", "UV", "Smart Connected"],
  },
]);

function normalizeCategoryText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function buildCategoryProductsPath(category) {
  const params = new URLSearchParams({
    category_id: String(category.id),
    category: category.category_name,
  });
  return `/products?${params.toString()}`;
}

export function getCategoryById(categoryId) {
  return HOME_APPLIANCE_CATEGORIES.find((category) => String(category.id) === String(categoryId)) || null;
}

export function getCategoryMatchTokens(categoryId, fallbackCategoryName = "") {
  const category = getCategoryById(categoryId);
  const tokens = new Set();

  if (category) {
    tokens.add(normalizeCategoryText(category.category_name));
    for (const item of category.legacyMatches || []) {
      tokens.add(normalizeCategoryText(item));
    }
  }

  if (fallbackCategoryName) {
    tokens.add(normalizeCategoryText(fallbackCategoryName));
  }

  tokens.delete("");
  return [...tokens];
}

export { HOME_APPLIANCE_CATEGORIES };
