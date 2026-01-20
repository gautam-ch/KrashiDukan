import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import "./App.css";
import { api } from "./api/client";
import { downloadCSV, downloadPrintPDF } from "./utils/exporters";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";

function App() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [shop, setShop] = useState(null);

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    img: "",
    category: "",
    sprayCount: 5,
    costPrice: "",
    sellingPrice: "",
    tags: "",
    expiryDate: "",
    quantity: "",
  });

  const [filters, setFilters] = useState({ sprayCount: "", category: "all", search: "" });
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderForm, setOrderForm] = useState({ name: "", contact: "", village: "" });
  const [orders, setOrders] = useState([]);

  const notifyError = (err, fallback) => {
    const message = err?.response?.data?.message || err?.message || fallback || "Something went wrong";
    toast.error(message);
  };

  const bootstrap = async () => {
    try {
      const data = await api.authMe();
      setAuthed(true);
      setShop(data.shop || null);
      if (data.shop?._id) {
        await Promise.all([loadProducts(data.shop._id), loadOrders(data.shop._id)]);
      }
    } catch (err) {
      setAuthed(false);
      setShop(null);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const handleSignin = async (email, password, { silentToast } = {}) => {
    try {
      await api.signin({ email, password });
      await bootstrap();
      if (!silentToast) toast.success("Signed in");
      navigate("/");
    } catch (err) {
      notifyError(err, "Could not sign in");
    }
  };

  const handleSignup = async (name, email, password) => {
    try {
      await api.signup({ name, email, password });
      toast.success("Account created. Redirecting to home");
      await handleSignin(email, password, { silentToast: true });
    } catch (err) {
      notifyError(err, "Could not sign up");
    }
  };

  const handleLogout = async () => {
    try {
      await api.signout();
      setAuthed(false);
      setShop(null);
      setProducts([]);
      setOrders([]);
      setCart([]);
      toast.success("Signed out");
      navigate("/");
    } catch (err) {
      notifyError(err, "Could not sign out");
    }
  };

  const handleCreateShop = async (name) => {
    try {
      const data = await api.createShop(name);
      setShop(data.shop);
      toast.success("Shop created");
      return data.shop;
    } catch (err) {
      notifyError(err, "Could not create shop");
      throw err;
    }
  };

  const handleAddOwner = async (email) => {
    try {
      await api.addOwner(email);
      toast.success("Owner added");
    } catch (err) {
      notifyError(err, "Could not add owner");
    }
  };

  const loadProducts = async (shopId) => {
    const data = await api.getProducts(shopId);
    setProducts(data.products || []);
  };

  const handleAddProduct = async () => {
    if (!shop?._id) return;
    try {
      const payload = {
        ...productForm,
        sprayCount: Number(productForm.sprayCount),
        sellingPrice: Number(productForm.sellingPrice),
        quantity: Number(productForm.quantity),
        tags: productForm.tags
          ? productForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };
      await api.addProduct(shop._id, payload);
      setProductForm({
        title: "",
        description: "",
        img: "",
        category: "",
        sprayCount: 5,
        costPrice: "",
        sellingPrice: "",
        tags: "",
        expiryDate: "",
        quantity: "",
      });
      await loadProducts(shop._id);
      toast.success("Product added");
    } catch (err) {
      notifyError(err, "Could not add product");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSpray = filters.sprayCount ? Number(p.sprayCount) === Number(filters.sprayCount) : true;
      const matchesCategory = filters.category === "all" ? true : (p.category || "").toLowerCase() === filters.category;
      const matchesSearch = filters.search
        ? (p.title || "").toLowerCase().includes(filters.search.toLowerCase())
        : true;
      return matchesSpray && matchesCategory && matchesSearch;
    });
  }, [products, filters]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    setCart((prev) => prev.map((item) =>
      item.product._id === productId ? { ...item, quantity: Number(quantity) } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * Number(item.product.sellingPrice || 0), 0);
  }, [cart]);

  const loadOrders = async (shopId) => {
    const data = await api.getOrders(shopId);
    setOrders(data.orders || []);
  };

  const handleCreateOrder = async () => {
    if (!shop?._id || cart.length === 0) return;
    try {
      const items = cart.map((c) => ({
        product: c.product._id,
        productName: c.product.title,
        quantity: Number(c.quantity),
        price: Number(c.product.sellingPrice),
        category: c.product.category || "",
      }));

      await api.createOrder({
        name: orderForm.name,
        contact: orderForm.contact,
        village: orderForm.village,
        items,
        totalAmount: cartTotal,
        shopId: shop._id,
      });

      setCart([]);
      setOrderForm({ name: "", contact: "", village: "" });
      await loadOrders(shop._id);
      toast.success("Order placed");
    } catch (err) {
      notifyError(err, "Could not place order");
    }
  };

  const exportOrdersCSV = () => {
    if (!orders.length) return;
    const headers = ["name", "contact", "village", "total", "items"];
    const rows = orders.map((o) => ({
      name: o.name,
      contact: o.contact,
      village: o.village,
      total: o.totalAmount,
      items: o.items?.map((i) => `${i.productName} x${i.quantity}`).join(";")
    }));
    downloadCSV(rows, headers, "orders.csv");
  };

  const exportOrdersPDF = () => {
    if (!orders.length) return;
    const rows = orders.map((o) => `
      <tr>
        <td>${o.name}</td>
        <td>${o.contact}</td>
        <td>${o.village || ""}</td>
        <td>${o.totalAmount || 0}</td>
        <td>${(o.items || []).map((i) => `${i.productName} x${i.quantity}`).join("; ")}</td>
      </tr>
    `).join("\n");
    const table = `<table><thead><tr><th>Name</th><th>Contact</th><th>Village</th><th>Total</th><th>Items</th></tr></thead><tbody>${rows}</tbody></table>`;
    downloadPrintPDF("Order history", table);
  };

  const exportProductsCSV = () => {
    if (!products.length) return;
    const headers = ["title", "category", "sprayCount", "expiryDate", "quantity", "sellingPrice", "costPrice"];
    const rows = products.map((p) => ({
      title: p.title,
      category: p.category,
      sprayCount: p.sprayCount,
      expiryDate: new Date(p.expiryDate).toLocaleDateString(),
      quantity: p.quantity,
      sellingPrice: p.sellingPrice,
      costPrice: p.costPrice,
    }));
    downloadCSV(rows, headers, "products.csv");
  };

  const exportProductsPDF = () => {
    if (!products.length) return;
    const rows = products.map((p) => `
      <tr>
        <td>${p.title}</td>
        <td>${p.category || ""}</td>
        <td>${p.sprayCount || ""}</td>
        <td>${new Date(p.expiryDate).toLocaleDateString()}</td>
        <td>${p.quantity}</td>
      </tr>
    `).join("\n");
    const table = `<table><thead><tr><th>Title</th><th>Category</th><th>Spray</th><th>Expiry</th><th>Qty</th></tr></thead><tbody>${rows}</tbody></table>`;
    downloadPrintPDF("Products backup", table);
  };

  const dashboardProps = {
    shop,
    productForm,
    onProductChange: setProductForm,
    onProductSubmit: handleAddProduct,
    filters,
    onFilterChange: setFilters,
    filteredProducts,
    onExportProductsCSV: exportProductsCSV,
    onExportProductsPDF: exportProductsPDF,
    onAddToCart: addToCart,
    cart,
    onCartQty: updateCartQuantity,
    onCartRemove: removeFromCart,
    cartTotal,
    orderForm,
    onOrderChange: setOrderForm,
    onOrderSubmit: handleCreateOrder,
    orders,
    onLogout: handleLogout,
    onAddOwner: handleAddOwner,
  };

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/auth"
          element={authed ? <Navigate to="/" /> : <AuthPage onSignin={handleSignin} onSignup={handleSignup} />}
        />
        <Route
          path="/dashboard"
          element={!authed ? <Navigate to="/auth" /> : !shop ? <Navigate to="/" /> : <DashboardPage {...dashboardProps} />}
        />
        <Route
          path="/shop"
          element={<Navigate to="/" />}
        />
        <Route
          path="/"
          element={
            authed && shop ? (
              <Navigate to="/dashboard" />
            ) : (
              <HomePage
                authed={authed}
                shop={shop}
                onCreateShop={(name) => handleCreateShop(name).then(() => navigate("/dashboard"))}
                onAddOwner={handleAddOwner}
                onLogout={handleLogout}
              />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
