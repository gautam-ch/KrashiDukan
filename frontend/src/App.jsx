import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import "./App.css";
import { api } from "./api/client";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { OrdersPage } from "./pages/OrdersPage";

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

  const [cart, setCart] = useState([]);
  const [orderForm, setOrderForm] = useState({ name: "", contact: "", village: "" });

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
        // no-op: search page fetches products on demand
      }
    } catch (err) {
      console.error(err);
      setAuthed(false);
      setShop(null);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      toast.success("Product added");
    } catch (err) {
      notifyError(err, "Could not add product");
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
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
      toast.success("Order placed");
    } catch (err) {
      notifyError(err, "Could not place order");
    }
  };

  const dashboardProps = {
    shop,
    productForm,
    onProductChange: setProductForm,
    onProductSubmit: handleAddProduct,
    onAddToCart: addToCart,
    cart,
    onCartQty: updateCartQuantity,
    onCartRemove: removeFromCart,
    cartTotal,
    orderForm,
    onOrderChange: setOrderForm,
    onOrderSubmit: handleCreateOrder,
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
          path="/search"
          element={!authed ? <Navigate to="/auth" /> : !shop ? <Navigate to="/" /> : (
            <SearchPage shopId={shop?._id} onAddToCart={addToCart} onLogout={handleLogout} />
          )}
        />
        <Route
          path="/orders"
          element={!authed ? <Navigate to="/auth" /> : !shop ? <Navigate to="/" /> : (
            <OrdersPage shopId={shop?._id} onLogout={handleLogout} />
          )}
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
