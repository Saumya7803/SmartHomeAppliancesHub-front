const CATEGORY_GROUPS = Object.freeze([
  {
    key: "cooling",
    title: "Cooling Appliances",
    categories: ["Air Conditioner", "Air Cooler"],
  },
  {
    key: "kitchen",
    title: "Kitchen Appliances",
    categories: ["Microwave", "Refrigerator"],
  },
  {
    key: "entertainment",
    title: "Entertainment Appliances",
    categories: ["TV"],
  },
  {
    key: "laundry",
    title: "Laundry Appliances",
    categories: ["Washing Machine"],
  },
]);

const CATEGORY_ALIASES = Object.freeze({
  "air conditioner": "Air Conditioner",
  ac: "Air Conditioner",
  "air cooler": "Air Cooler",
  cooler: "Air Cooler",
  microwave: "Microwave",
  "microwave oven": "Microwave",
  refrigerator: "Refrigerator",
  fridge: "Refrigerator",
  tv: "TV",
  lcd: "TV",
  "lcd tv": "TV",
  "led tv": "TV",
  "smart tv": "TV",
  television: "TV",
  "washing machine": "Washing Machine",
  washer: "Washing Machine",
});

function normalizeCategoryValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function resolveCategoryName(rawValue) {
  const normalized = normalizeCategoryValue(rawValue);
  return CATEGORY_ALIASES[normalized] || null;
}

export function isAllowedCategory(rawValue) {
  return Boolean(resolveCategoryName(rawValue));
}

export function getCategoryGroups() {
  return CATEGORY_GROUPS;
}

export function getAllCanonicalCategories() {
  return CATEGORY_GROUPS.flatMap((group) => group.categories);
}
