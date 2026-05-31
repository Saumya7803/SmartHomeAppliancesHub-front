const CART_STORAGE_KEY = "smarthome_cart_items";

function normalizeCartItem(item) {
  return {
    id: String(item.id),
    name: String(item.name || "Unnamed Product"),
    brand: String(item.brand || "Unknown"),
    image: String(item.image || ""),
    price: Number(item.price || 0),
    quantity: Math.max(1, Number(item.quantity || 1)),
  };
}

export function readStoredCartItems() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.map(normalizeCartItem).filter((item) => item.id);
  } catch {
    return [];
  }
}

export function writeStoredCartItems(items) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function addCartItem(items, product) {
  const existingItem = items.find((item) => String(item.id) === String(product.id));

  if (existingItem) {
    return items.map((item) =>
      String(item.id) === String(product.id)
        ? { ...item, quantity: Number(item.quantity || 0) + 1 }
        : item
    );
  }

  return [
    ...items,
    normalizeCartItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      image: product.image,
      price: product.price,
      quantity: 1,
    }),
  ];
}

export function incrementCartItem(items, itemId) {
  return items.map((item) =>
    String(item.id) === String(itemId)
      ? { ...item, quantity: Number(item.quantity || 0) + 1 }
      : item
  );
}

export function decrementCartItem(items, itemId) {
  return items
    .map((item) =>
      String(item.id) === String(itemId)
        ? { ...item, quantity: Number(item.quantity || 0) - 1 }
        : item
    )
    .filter((item) => Number(item.quantity || 0) > 0);
}

export function removeCartItem(items, itemId) {
  return items.filter((item) => String(item.id) !== String(itemId));
}

export function getCartItemCount(items) {
  return items.reduce((total, item) => total + Number(item.quantity || 0), 0);
}

export function getCartSubtotal(items) {
  return items.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
}
