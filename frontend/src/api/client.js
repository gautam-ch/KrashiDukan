// Prefer same-origin /api so Vite can proxy in dev (better cookies/auth reliability).
// You can override with VITE_API_BASE when deploying.
const API_BASE = import.meta.env.VITE_API_BASE
  || `${window.location.origin}/api`;

const notifyLoader = (eventName) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(eventName));
};

let refreshPromise = null;

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const message = data?.message || "Session refresh failed";
          const error = new Error(message);
          error.status = res.status;
          throw error;
        }
        return res;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const fetchJSON = async (path, options = {}) => {
  const { skipAuthRefresh, ...fetchOptions } = options;
  notifyLoader("global-loader:begin");
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(fetchOptions.headers || {}),
      },
      ...fetchOptions,
    });

    if ((res.status === 401 || res.status === 403) && !skipAuthRefresh && path !== "/auth/refresh") {
      await refreshSession();
      return fetchJSON(path, { ...options, skipAuthRefresh: true });
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data?.message || "Request failed";
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }
    return data;
  } finally {
    notifyLoader("global-loader:end");
  }
};

const fetchBlob = async (path, options = {}) => {
  const { skipAuthRefresh, ...fetchOptions } = options;
  notifyLoader("global-loader:begin");
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      ...(fetchOptions || {}),
    });

    if ((res.status === 401 || res.status === 403) && !skipAuthRefresh && path !== "/auth/refresh") {
      await refreshSession();
      return fetchBlob(path, { ...options, skipAuthRefresh: true });
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = data?.message || "Request failed";
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }
    return res.blob();
  } finally {
    notifyLoader("global-loader:end");
  }
};

const buildQuery = (params = {}) => {
  const clean = Object.entries(params).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === "") return acc;
    acc[key] = value;
    return acc;
  }, {});
  const qs = new URLSearchParams(clean).toString();
  return qs ? `?${qs}` : "";
};

export const api = {
  signup: (body) => fetchJSON("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  signin: (body) => fetchJSON("/auth/signin", { method: "POST", body: JSON.stringify(body) }),
  signout: () => fetchJSON("/auth/signout", { method: "POST" }),
  authMe: () => fetchJSON("/auth/me"),
  getMyShop: () => fetchJSON("/shop/me"),
  createShop: (name) => fetchJSON("/createShop", { method: "POST", body: JSON.stringify({ name }) }),
  addOwner: (email) => fetchJSON("/addOwner", { method: "POST", body: JSON.stringify({ email }) }),
  getShopAnalytics: (shopId, options = {}) => (
    fetchJSON(`/shops/${shopId}/analytics${buildQuery(options)}`)
  ),
  getProducts: (shopId, params = {}) => fetchJSON(`/shops/${shopId}/products${buildQuery(params)}`),
  searchProducts: (shopId, params = {}) => fetchJSON(`/shops/${shopId}/products${buildQuery(params)}`),
  addProduct: (shopId, body) => fetchJSON(`/shops/${shopId}/product`, { method: "POST", body: JSON.stringify(body) }),
  getProduct: (shopId, productId) => fetchJSON(`/shops/${shopId}/product/${productId}`),
  updateProduct: (shopId, productId, body) => fetchJSON(`/shops/${shopId}/product/${productId}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (shopId, productId) => fetchJSON(`/shops/${shopId}/product/${productId}`, { method: "DELETE" }),
  getOrders: (shopId, params = {}) => fetchJSON(`/order/${shopId}${buildQuery(params)}`),
  createOrder: (body) => fetchJSON("/order", { method: "POST", body: JSON.stringify(body) }),
  exportProductsCSV: (shopId, params = {}) => fetchBlob(`/shops/${shopId}/products/export/csv${buildQuery(params)}`),
  exportProductsPDF: (shopId, params = {}) => fetchBlob(`/shops/${shopId}/products/export/pdf${buildQuery(params)}`),
};

export const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-GB");

export const monthsUntil = (dateString) => {
  const now = new Date();
  const expiry = new Date(dateString);
  const diffMs = expiry.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 30);
};
