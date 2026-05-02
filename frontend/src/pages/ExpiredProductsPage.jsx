import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api, formatDate } from "../api/client";

export function ExpiredProductsPage({ shopId, onLogout }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [totalLoss, setTotalLoss] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fetchExpired = useCallback(() => {
    if (!shopId) return;
    setLoading(true);
    api.getExpiredProducts(shopId, { currentDate: new Date().toISOString() })
      .then((data) => {
        setProducts(data.products || []);
        setTotalLoss(data.totalLoss || 0);
      })
      .catch((err) => toast.error(err?.message || "Could not load expired products"))
      .finally(() => setLoading(false));
  }, [shopId]);

  useEffect(() => {
    const timer = setTimeout(() => fetchExpired(), 0);
    return () => clearTimeout(timer);
  }, [fetchExpired]);

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Expired products</h1>
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
              <button className="menu-item" onClick={() => { navigate("/dashboard"); setShowMenu(false); }}>Dashboard</button>
              <button className="menu-item" onClick={() => { navigate("/search"); setShowMenu(false); }}>Search</button>
              <button className="menu-item" onClick={() => { navigate("/orders"); setShowMenu(false); }}>Orders</button>
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
            <h3 style={{ marginBottom: 4 }}>Total loss (cost price)</h3>
            <p className="muted" style={{ margin: 0 }}>Calculated as cost price × quantity.</p>
          </div>
          <div className="pill" style={{ fontSize: "1.05rem" }}>₹{Math.round(totalLoss)}</div>
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3>Expired inventory</h3>
          <span className="muted">{products.length} items</span>
        </div>

        {loading ? (
          <p className="muted">Loading expired products...</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Cost price</th>
                  <th>Expiry</th>
                  <th>Loss</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted">No expired products found.</td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const loss = (product.quantity || 0) * (() => {
                        const cleaned = String(product.costPrice || "").replace(/[^0-9.-]/g, "");
                        const p = Number.parseFloat(cleaned);
                        return Number.isFinite(p) ? p : 0;
                    })();
                    return (
                      <tr key={product._id}>
                        <td data-label="Title">{product.title}</td>
                        <td data-label="Category">{product.category}</td>
                        <td data-label="Quantity">{product.quantity}</td>
                        <td data-label="Cost price">{product.costPrice ?? "-"}</td>
                        <td data-label="Expiry">{formatDate(product.expiryDate)}</td>
                        <td data-label="Loss">₹{Math.round(loss)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
