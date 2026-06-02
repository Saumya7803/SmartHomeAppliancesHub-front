const USERS_KEY = "smarthome_admin_users";
const PRODUCTS_KEY = "smarthome_admin_products";
const CHANGES_KEY = "smarthome_admin_product_changes";
const LOGS_KEY = "smarthome_admin_logs";

const SEED_USERS = [
  {
    id: 1,
    name: "Super Admin",
    email: "admin@smarthomeb2b.com",
    password: "Admin@123",
    role: "admin",
    active: true,
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: 2,
    name: "Data Entry Operator",
    email: "operator@smarthomeb2b.com",
    password: "Operator@123",
    role: "operator",
    active: true,
    createdAt: "2026-01-12T09:30:00.000Z",
  },
];

const SEED_PRODUCTS = [
  {
    id: 101,
    name: "LG Smart Inverter Refrigerator 420L",
    model: "LG-RF420-B2B",
    category: "Refrigerator",
    brand: "LG",
    description: "Energy-efficient multi-door refrigerator for office pantry and hospitality usage.",
    specifications: { capacity: "420L", cooling: "Inverter", energyRating: "4 Star" },
    imageUrl: "",
    status: "approved",
    published: true,
    createdBy: "admin@smarthomeb2b.com",
    updatedBy: "admin@smarthomeb2b.com",
    createdAt: "2026-01-15T07:00:00.000Z",
    updatedAt: "2026-02-01T07:00:00.000Z",
  },
  {
    id: 102,
    name: "Samsung Digital Display 55\"",
    model: "SAM-DS55-CORP",
    category: "TV",
    brand: "Samsung",
    description: "Commercial display panel for boardrooms and briefing halls.",
    specifications: { size: "55 inch", resolution: "4K", usage: "16/7" },
    imageUrl: "",
    status: "approved",
    published: true,
    createdBy: "admin@smarthomeb2b.com",
    updatedBy: "admin@smarthomeb2b.com",
    createdAt: "2026-01-18T07:00:00.000Z",
    updatedAt: "2026-02-05T07:00:00.000Z",
  },
  {
    id: 103,
    name: "Voltas Split AC 2.0 Ton",
    model: "VOLT-AC20-INV",
    category: "AC",
    brand: "Voltas",
    description: "High-capacity split AC for enterprise floor cooling requirements.",
    specifications: { capacity: "2.0 Ton", compressor: "Inverter" },
    imageUrl: "",
    status: "approved",
    published: false,
    createdBy: "operator@smarthomeb2b.com",
    updatedBy: "operator@smarthomeb2b.com",
    createdAt: "2026-01-20T07:00:00.000Z",
    updatedAt: "2026-02-07T07:00:00.000Z",
  },
];

const SEED_CHANGES = [
  {
    id: 1001,
    productId: 103,
    changeType: "update",
    changeData: {
      name: "Voltas Split AC 2.0 Ton Pro",
      model: "VOLT-AC20-PRO",
      category: "AC",
      brand: "Voltas",
      description: "Updated model details with optimized airflow control.",
      specifications: { capacity: "2.0 Ton", compressor: "Inverter", airflow: "High Throw" },
      imageUrl: "",
    },
    requestedBy: "operator@smarthomeb2b.com",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    createdAt: "2026-03-02T11:00:00.000Z",
  },
];

function readJson(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function getNextId(items) {
  if (!items.length) {
    return 1;
  }

  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
}

function nowIso() {
  return new Date().toISOString();
}

function withoutPassword(user) {
  const { password: _password, ...rest } = user;
  return rest;
}

function appendLog(action, actorEmail, details) {
  const logs = readJson(LOGS_KEY, []);
  const nextLog = {
    id: getNextId(logs),
    action,
    actorEmail,
    details,
    createdAt: nowIso(),
  };

  writeJson(LOGS_KEY, [nextLog, ...logs]);
}

export function seedAdminMockData() {
  const users = readJson(USERS_KEY, null);
  const products = readJson(PRODUCTS_KEY, null);
  const changes = readJson(CHANGES_KEY, null);
  const logs = readJson(LOGS_KEY, null);

  if (!users) {
    writeJson(USERS_KEY, SEED_USERS);
  }

  if (!products) {
    writeJson(PRODUCTS_KEY, SEED_PRODUCTS);
  }

  if (!changes) {
    writeJson(CHANGES_KEY, SEED_CHANGES);
  }

  if (!logs) {
    writeJson(LOGS_KEY, []);
  }
}

function getUsersInternal() {
  return readJson(USERS_KEY, []);
}

function setUsersInternal(users) {
  writeJson(USERS_KEY, users);
}

function getProductsInternal() {
  return readJson(PRODUCTS_KEY, []);
}

function setProductsInternal(products) {
  writeJson(PRODUCTS_KEY, products);
}

function getChangesInternal() {
  return readJson(CHANGES_KEY, []);
}

function setChangesInternal(changes) {
  writeJson(CHANGES_KEY, changes);
}

function getLogsInternal() {
  return readJson(LOGS_KEY, []);
}

function normalizeProductInput(input) {
  return {
    name: input.name,
    model: input.model,
    category: input.category,
    brand: input.brand,
    description: input.description,
    specifications: input.specifications || {},
    imageUrl: input.imageUrl || "",
  };
}

const wait = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

export const adminMockApi = {
  async login({ email, password }) {
    seedAdminMockData();

    const users = getUsersInternal();
    const matchedUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser || !matchedUser.active || matchedUser.password !== password) {
      throw new Error("Invalid email or password");
    }

    appendLog("login", matchedUser.email, { role: matchedUser.role });

    return wait({
      token: btoa(`${matchedUser.id}:${Date.now()}`),
      user: withoutPassword(matchedUser),
    });
  },

  async getDashboardStats(user) {
    seedAdminMockData();

    const users = getUsersInternal();
    const products = getProductsInternal();
    const changes = getChangesInternal();

    if (user.role === "admin") {
      return wait({
        totalProducts: products.length,
        pendingApprovals: changes.filter((change) => change.status === "pending").length,
        approvedProducts: products.filter((product) => product.status === "approved").length,
        totalUsers: users.filter((row) => row.active).length,
      });
    }

    const ownProducts = products.filter((product) => product.createdBy === user.email);
    const ownChanges = changes.filter((change) => change.requestedBy === user.email);

    return wait({
      totalProducts: ownProducts.length,
      pendingApprovals: ownChanges.filter((change) => change.status === "pending").length,
      approvedProducts: ownChanges.filter((change) => change.status === "approved").length,
      totalUsers: null,
    });
  },

  async getProducts() {
    seedAdminMockData();
    const products = getProductsInternal().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    return wait(products);
  },

  async createProduct(productInput, actor) {
    seedAdminMockData();

    const products = getProductsInternal();
    const now = nowIso();

    if (actor.role === "admin") {
      const nextProduct = {
        id: getNextId(products),
        ...normalizeProductInput(productInput),
        status: "approved",
        published: true,
        createdBy: actor.email,
        updatedBy: actor.email,
        createdAt: now,
        updatedAt: now,
      };

      setProductsInternal([...products, nextProduct]);
      appendLog("admin_create_product", actor.email, { productId: nextProduct.id });

      return wait({ message: "Product created", type: "success" });
    }

    const changes = getChangesInternal();
    const nextChange = {
      id: getNextId(changes),
      productId: null,
      changeType: "create",
      changeData: normalizeProductInput(productInput),
      requestedBy: actor.email,
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      createdAt: now,
    };

    setChangesInternal([...changes, nextChange]);
    appendLog("operator_request_create", actor.email, { changeId: nextChange.id });

    return wait({ message: "Create request submitted for approval", type: "success" });
  },

  async updateProduct(productId, productInput, actor) {
    seedAdminMockData();

    const products = getProductsInternal();
    const targetProduct = products.find((product) => Number(product.id) === Number(productId));

    if (!targetProduct) {
      throw new Error("Product not found");
    }

    const now = nowIso();

    if (actor.role === "admin") {
      const updatedProducts = products.map((product) =>
        Number(product.id) === Number(productId)
          ? {
              ...product,
              ...normalizeProductInput(productInput),
              status: "approved",
              updatedBy: actor.email,
              updatedAt: now,
            }
          : product
      );

      setProductsInternal(updatedProducts);
      appendLog("admin_update_product", actor.email, { productId: Number(productId) });

      return wait({ message: "Product updated", type: "success" });
    }

    if (targetProduct.createdBy !== actor.email) {
      throw new Error("Operators can edit only their own products");
    }

    const changes = getChangesInternal();
    const hasPendingRequest = changes.some(
      (change) =>
        Number(change.productId) === Number(productId) &&
        change.status === "pending" &&
        change.changeType === "update"
    );

    if (hasPendingRequest) {
      throw new Error("Pending update request already exists for this product");
    }

    const nextChange = {
      id: getNextId(changes),
      productId: Number(productId),
      changeType: "update",
      changeData: normalizeProductInput(productInput),
      requestedBy: actor.email,
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      createdAt: now,
    };

    setChangesInternal([...changes, nextChange]);
    appendLog("operator_request_update", actor.email, {
      changeId: nextChange.id,
      productId: Number(productId),
    });

    return wait({ message: "Update request submitted for approval", type: "success" });
  },

  async deleteProduct(productId, actor, reason = "") {
    seedAdminMockData();

    const products = getProductsInternal();
    const targetProduct = products.find((product) => Number(product.id) === Number(productId));

    if (!targetProduct) {
      throw new Error("Product not found");
    }

    if (actor.role === "admin") {
      setProductsInternal(products.filter((product) => Number(product.id) !== Number(productId)));
      appendLog("admin_delete_product", actor.email, { productId: Number(productId) });
      return wait({ message: "Product deleted", type: "success" });
    }

    if (targetProduct.createdBy !== actor.email) {
      throw new Error("Operators can request delete only for their own products");
    }

    const changes = getChangesInternal();
    const hasPendingDelete = changes.some(
      (change) =>
        Number(change.productId) === Number(productId) &&
        change.status === "pending" &&
        change.changeType === "delete"
    );

    if (hasPendingDelete) {
      throw new Error("Pending delete request already exists for this product");
    }

    const nextChange = {
      id: getNextId(changes),
      productId: Number(productId),
      changeType: "delete",
      changeData: { reason: reason || "Delete requested by operator" },
      requestedBy: actor.email,
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      createdAt: nowIso(),
    };

    setChangesInternal([...changes, nextChange]);
    appendLog("operator_request_delete", actor.email, {
      changeId: nextChange.id,
      productId: Number(productId),
    });

    return wait({ message: "Delete request submitted for approval", type: "success" });
  },

  async togglePublish(productId, actor) {
    seedAdminMockData();

    if (actor.role !== "admin") {
      throw new Error("Only admin can publish or unpublish");
    }

    const products = getProductsInternal();
    const targetProduct = products.find((product) => Number(product.id) === Number(productId));

    if (!targetProduct) {
      throw new Error("Product not found");
    }

    const updatedProducts = products.map((product) =>
      Number(product.id) === Number(productId)
        ? {
            ...product,
            published: !product.published,
            updatedBy: actor.email,
            updatedAt: nowIso(),
          }
        : product
    );

    setProductsInternal(updatedProducts);
    appendLog("admin_toggle_publish", actor.email, {
      productId: Number(productId),
      published: !targetProduct.published,
    });

    return wait({
      message: targetProduct.published ? "Product unpublished" : "Product published",
      type: "success",
    });
  },

  async getPendingChanges() {
    seedAdminMockData();

    const changes = getChangesInternal();
    const products = getProductsInternal();

    const pending = changes
      .filter((change) => change.status === "pending")
      .map((change) => ({
        ...change,
        productName:
          change.productId === null
            ? change.changeData?.name || "New Product"
            : products.find((product) => Number(product.id) === Number(change.productId))?.name ||
              "Unknown Product",
      }))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return wait(pending);
  },

  async approveChange(changeId, actor) {
    seedAdminMockData();

    if (actor.role !== "admin") {
      throw new Error("Only admin can approve changes");
    }

    const changes = getChangesInternal();
    const products = getProductsInternal();

    const changeIndex = changes.findIndex((change) => Number(change.id) === Number(changeId));

    if (changeIndex < 0) {
      throw new Error("Change request not found");
    }

    const targetChange = changes[changeIndex];

    if (targetChange.status !== "pending") {
      throw new Error("Only pending requests can be reviewed");
    }

    let nextProducts = [...products];

    if (targetChange.changeType === "create") {
      const now = nowIso();
      const nextProduct = {
        id: getNextId(nextProducts),
        ...normalizeProductInput(targetChange.changeData || {}),
        status: "approved",
        published: true,
        createdBy: targetChange.requestedBy,
        updatedBy: actor.email,
        createdAt: now,
        updatedAt: now,
      };

      nextProducts.push(nextProduct);
      targetChange.productId = nextProduct.id;
    }

    if (targetChange.changeType === "update") {
      nextProducts = nextProducts.map((product) =>
        Number(product.id) === Number(targetChange.productId)
          ? {
              ...product,
              ...normalizeProductInput(targetChange.changeData || {}),
              status: "approved",
              updatedBy: actor.email,
              updatedAt: nowIso(),
            }
          : product
      );
    }

    if (targetChange.changeType === "delete") {
      nextProducts = nextProducts.filter(
        (product) => Number(product.id) !== Number(targetChange.productId)
      );
    }

    const reviewedChanges = [...changes];
    reviewedChanges[changeIndex] = {
      ...targetChange,
      status: "approved",
      reviewedBy: actor.email,
      reviewedAt: nowIso(),
    };

    setProductsInternal(nextProducts);
    setChangesInternal(reviewedChanges);
    appendLog("admin_approve_change", actor.email, {
      changeId: Number(changeId),
      changeType: targetChange.changeType,
    });

    return wait({ message: "Request approved", type: "success" });
  },

  async rejectChange(changeId, actor, reason = "") {
    seedAdminMockData();

    if (actor.role !== "admin") {
      throw new Error("Only admin can reject changes");
    }

    const changes = getChangesInternal();
    const changeIndex = changes.findIndex((change) => Number(change.id) === Number(changeId));

    if (changeIndex < 0) {
      throw new Error("Change request not found");
    }

    if (changes[changeIndex].status !== "pending") {
      throw new Error("Only pending requests can be reviewed");
    }

    const reviewedChanges = [...changes];
    reviewedChanges[changeIndex] = {
      ...reviewedChanges[changeIndex],
      status: "rejected",
      reviewedBy: actor.email,
      reviewedAt: nowIso(),
      changeData: {
        ...(reviewedChanges[changeIndex].changeData || {}),
        rejectionReason: reason || "Rejected by admin",
      },
    };

    setChangesInternal(reviewedChanges);
    appendLog("admin_reject_change", actor.email, {
      changeId: Number(changeId),
      reason,
    });

    return wait({ message: "Request rejected", type: "success" });
  },

  async getOwnSubmissions(email) {
    seedAdminMockData();
    const submissions = getChangesInternal()
      .filter((change) => change.requestedBy === email)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return wait(submissions);
  },

  async getUsers() {
    seedAdminMockData();
    return wait(getUsersInternal().map(withoutPassword));
  },

  async addOperator(userInput, actor) {
    seedAdminMockData();

    if (actor.role !== "admin") {
      throw new Error("Only admin can add users");
    }

    const users = getUsersInternal();
    const exists = users.some((user) => user.email.toLowerCase() === userInput.email.toLowerCase());

    if (exists) {
      throw new Error("Email already exists");
    }

    const nextUser = {
      id: getNextId(users),
      name: userInput.name,
      email: userInput.email,
      password: userInput.password,
      role: "operator",
      active: true,
      createdAt: nowIso(),
    };

    setUsersInternal([...users, nextUser]);
    appendLog("admin_add_user", actor.email, { userId: nextUser.id, email: nextUser.email });

    return wait({ message: "Operator created", type: "success" });
  },

  async changeUserRole(userId, role, actor) {
    seedAdminMockData();

    if (actor.role !== "admin") {
      throw new Error("Only admin can change roles");
    }

    const users = getUsersInternal();
    const userIndex = users.findIndex((user) => Number(user.id) === Number(userId));

    if (userIndex < 0) {
      throw new Error("User not found");
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      role,
    };

    setUsersInternal(updatedUsers);
    appendLog("admin_change_role", actor.email, { userId: Number(userId), role });

    return wait({ message: "User role updated", type: "success" });
  },

  async deactivateUser(userId, actor) {
    seedAdminMockData();

    if (actor.role !== "admin") {
      throw new Error("Only admin can deactivate users");
    }

    const users = getUsersInternal();
    const userIndex = users.findIndex((user) => Number(user.id) === Number(userId));

    if (userIndex < 0) {
      throw new Error("User not found");
    }

    if (users[userIndex].email === actor.email) {
      throw new Error("You cannot deactivate your own account");
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      active: false,
    };

    setUsersInternal(updatedUsers);
    appendLog("admin_deactivate_user", actor.email, { userId: Number(userId) });

    return wait({ message: "User deactivated", type: "success" });
  },

  async getLogs() {
    seedAdminMockData();
    return wait(getLogsInternal());
  },
};
