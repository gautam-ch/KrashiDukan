import { Cart } from "../components/Cart";
import { OrderForm } from "../components/OrderForm";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductForm } from "../components/ProductForm";
import { api } from "../api/client";
import { toast } from "react-hot-toast";

export function DashboardPage({
  shop,
  cart,
  onCartQty,
  onCartRemove,
  cartTotal,
  orderForm,
  onOrderChange,
  onOrderSubmit,
  onLogout,
  onAddOwner,
}) {
  const navigate = useNavigate();
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const salesByMonth = useMemo(() => analytics?.metrics?.salesByMonth || [], [analytics]);
  const maxSales = useMemo(() => {
    return salesByMonth.reduce((max, item) => Math.max(max, item.total), 0) || 1;
  }, [salesByMonth]);

  const fetchAnalytics = useCallback((refresh = false) => {
    if (!shop?._id) return;
    setLoadingAnalytics(true);
    api.getShopAnalytics(shop._id, refresh ? { refresh: true } : {})
      .then((data) => setAnalytics(data))
      .catch((err) => toast.error(err?.message || "Could not load analytics"))
      .finally(() => setLoadingAnalytics(false));
  }, [shop]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnalytics(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAnalytics]);
  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Pesticide shop console</h1>
        </div>
        <div className="row header-actions">
          <button className="ghost" onClick={() => navigate("/search")}>Search</button>
          <button className="ghost" onClick={() => navigate("/orders")}>Orders</button>
          <button className="ghost" onClick={() => navigate("/products")}>Products</button>
          <button className="ghost" onClick={() => navigate("/add-product")}>Add product</button>
          <button className="ghost" onClick={() => setShowCart(true)}>Cart ({cart.length})</button>
          <button className="ghost" onClick={() => setShowOwnerModal(true)}>Add owner</button>
          {onLogout && <button className="ghost" onClick={onLogout}>Logout</button>}
        </div>
        <div className="header-menu">
          <button
            className="hamburger"
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={showMenu}
            aria-label="Open navigation menu"
          >
            ☰
          </button>
          {showMenu && (
            <div className="mobile-menu" role="menu">
              <button className="menu-item" onClick={() => { navigate("/search"); setShowMenu(false); }}>Search</button>
              <button className="menu-item" onClick={() => { navigate("/orders"); setShowMenu(false); }}>Orders</button>
              <button className="menu-item" onClick={() => { navigate("/products"); setShowMenu(false); }}>Products</button>
              <button className="menu-item" onClick={() => { navigate("/add-product"); setShowMenu(false); }}>Add product</button>
              <button className="menu-item" onClick={() => { setShowCart(true); setShowMenu(false); }}>Cart ({cart.length})</button>
              <button className="menu-item" onClick={() => { setShowOwnerModal(true); setShowMenu(false); }}>Add owner</button>
              {onLogout && (
                <button className="menu-item" onClick={() => { onLogout(); setShowMenu(false); }}>Logout</button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0 }}>Analytics overview</h3>
            <p className="muted" style={{ margin: 0 }}>Full analytics snapshot for your shop.</p>
          </div>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <button className="ghost" onClick={() => fetchAnalytics(true)} disabled={loadingAnalytics}>
              {loadingAnalytics ? "Refreshing..." : "Refresh"}
            </button>
            <span className="pill">{shop?.name}</span>
          </div>
        </div>
        {loadingAnalytics ? (
          <p className="muted">Loading analytics...</p>
        ) : (
          <>
            <div className="analytics-grid">
              <div className="stat-card">
                <span className="muted">Total products</span>
                <strong>{analytics?.metrics?.totalProducts ?? 0}</strong>
              </div>
              <div className="stat-card">
                <span className="muted">Total sales</span>
                <strong>₹{Math.round(analytics?.metrics?.totalSales ?? 0)}</strong>
              </div>
              <div className="stat-card">
                <span className="muted">Total orders</span>
                <strong>{analytics?.metrics?.totalOrders ?? 0}</strong>
              </div>
              <div className="stat-card">
                <span className="muted">Avg order value</span>
                <strong>₹{Math.round(analytics?.metrics?.averageOrderValue ?? 0)}</strong>
              </div>
            </div>
            <div className="chart-card">
              <h4>Sales (last 6 months)</h4>
              <div className="chart">
                {salesByMonth.map((item) => (
                  <div key={item.label} className="chart-bar">
                    <div
                      className="bar"
                      style={{ height: `${Math.max(8, (item.total / maxSales) * 120)}px` }}
                      title={`₹${Math.round(item.total)}`}
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {salesByMonth.map((item) => (
                    <tr key={item.label}>
                      <td>{item.label}</td>
                      <td>₹{Math.round(item.total)}</td>
                    </tr>
                  ))}
                  {salesByMonth.length === 0 && (
                    <tr><td colSpan={2} className="muted">No sales data yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {showCart && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal card stack" style={{ maxWidth: 560 }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Cart</h3>
              <button className="ghost" type="button" onClick={() => setShowCart(false)}>Close</button>
            </div>
            <Cart
              items={cart}
              onQtyChange={onCartQty}
              onRemove={onCartRemove}
              total={cartTotal}
              showHeader={false}
            />
            <OrderForm
              value={orderForm}
              onChange={onOrderChange}
              onSubmit={onOrderSubmit}
              disabled={cart.length === 0}
            />
          </div>
        </div>
      )}

      {showOwnerModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal card stack">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Add owner</h3>
              <button className="ghost" type="button" onClick={() => setShowOwnerModal(false)}>Close</button>
            </div>
            <form
              className="stack"
              onSubmit={async (e) => {
                e.preventDefault();
                await onAddOwner?.(ownerEmail);
                setOwnerEmail("");
                setShowOwnerModal(false);
              }}
            >
              <label>
                Owner email
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="owner@example.com"
                  required
                />
              </label>
              <button type="submit">Send invite</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
