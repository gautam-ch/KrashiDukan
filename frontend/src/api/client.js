const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const fetchJSON = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || "Request failed";
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return data;
};

const fetchBlob = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...(options || {}),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data?.message || "Request failed";
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return res.blob();
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
  getShopAnalytics: (shopId) => fetchJSON(`/shops/${shopId}/analytics`),
  getProducts: (shopId, params = {}) => fetchJSON(`/shops/${shopId}/products${buildQuery(params)}`),
  searchProducts: (shopId, params = {}) => fetchJSON(`/shops/${shopId}/products${buildQuery(params)}`),
  addProduct: (shopId, body) => fetchJSON(`/shops/${shopId}/product`, { method: "POST", body: JSON.stringify(body) }),
  getOrders: (shopId, params = {}) => fetchJSON(`/order/${shopId}${buildQuery(params)}`),
  createOrder: (body) => fetchJSON("/order", { method: "POST", body: JSON.stringify(body) }),
  exportProductsCSV: (shopId, params = {}) => fetchBlob(`/shops/${shopId}/products/export/csv${buildQuery(params)}`),
  exportProductsPDF: (shopId, params = {}) => fetchBlob(`/shops/${shopId}/products/export/pdf${buildQuery(params)}`),
};

export const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

export const monthsUntil = (dateString) => {
  const now = new Date();
  const expiry = new Date(dateString);
  const diffMs = expiry.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 30);
};
