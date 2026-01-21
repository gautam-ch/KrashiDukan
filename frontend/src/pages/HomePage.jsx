import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api } from "../api/client";

export function HomePage({ authed, shop, onCreateShop, onLogout }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [shopName, setShopName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const salesByMonth = useMemo(() => analytics?.metrics?.salesByMonth || [], [analytics]);
  const maxSales = useMemo(() => {
    return salesByMonth.reduce((max, item) => Math.max(max, item.total), 0) || 1;
  }, [salesByMonth]);

  const openModal = () => {
    if (!authed) {
      navigate("/auth");
      return;
    }
    setShowModal(true);
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    const name = shopName.trim();
    if (!name) {
      toast.error("Please enter a shop name");
      return;
    }
    setCreating(true);
    try {
      await onCreateShop(name);
      setShopName("");
      setShowModal(false);
    } catch (err) {
      // toast handled upstream
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!authed || !shop?._id) return;
    setLoadingAnalytics(true);
    api.getShopAnalytics(shop._id)
      .then((data) => setAnalytics(data))
      .catch((err) => toast.error(err?.message || "Could not load analytics"))
      .finally(() => setLoadingAnalytics(false));
  }, [authed, shop?._id]);

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Pesticide shop assistant</h1>
        </div>
        <div className="row header-actions" style={{ position: "relative" }}>
          {authed ? (
            <>
              {shop && <button className="ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>}
              {!shop && <button className="ghost" onClick={openModal}>Create shop</button>}
              <button
                className="avatar"
                onClick={() => setShowMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={showMenu}
              >
                {"You".charAt(0)}
              </button>
              {showMenu && (
                <div className="menu" role="menu">
                  {shop ? (
                    <button className="menu-item" onClick={() => { navigate("/dashboard"); setShowMenu(false); }}>
                      Dashboard
                    </button>
                  ) : (
                    <button className="menu-item" onClick={() => { openModal(); setShowMenu(false); }}>
                      Create shop
                    </button>
                  )}
                  <button className="menu-item" onClick={() => { onLogout(); setShowMenu(false); }}>
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
        {authed && (
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
                {shop ? (
                  <button className="menu-item" onClick={() => { navigate("/dashboard"); setShowMenu(false); }}>
                    Dashboard
                  </button>
                ) : (
                  <button className="menu-item" onClick={() => { openModal(); setShowMenu(false); }}>
                    Create shop
                  </button>
                )}
                <button className="menu-item" onClick={() => { onLogout(); setShowMenu(false); }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {authed && shop ? (
        <div className="card stack">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0 }}>{shop.name}</h2>
              <p className="muted" style={{ margin: 0 }}>Shop summary and recent sales.</p>
            </div>
            <button onClick={() => navigate("/dashboard")}>Open full analytics</button>
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
            </>
          )}
        </div>
      ) : (
        <div className="card hero">
          <div className="stack" style={{ gap: 12 }}>
            <span className="pill">Multi-tenant · Offline-friendly</span>
            <h2 style={{ margin: 0 }}>Track stock, owners, expiry, and orders in one clean console.</h2>
            <p className="muted" style={{ lineHeight: 1.5 }}>
              Sign up, invite owners by email, add pesticide inventory with spray count and category tags, see expiry colors,
              and export CSV/PDF backups for compliance.
            </p>
            <div className="row">
              {authed ? (
                shop ? (
                  <button onClick={() => navigate("/dashboard")}>Open dashboard</button>
                ) : (
                  <button onClick={openModal}>Create your shop</button>
                )
              ) : (
                <button onClick={openModal}>Create your shop</button>
              )}
            </div>
          </div>

          <div className="stack home-panel">
            <div className="chip-row">
              <span className="tag">Expiry colors</span>
              <span className="tag">CSV/PDF backup</span>
              <span className="tag">Owners by email</span>
              <span className="tag">Order history</span>
            </div>
            <ul className="muted feature-list">
              <li>Filter products by spray count or category to find the right fit fast.</li>
              <li>Export order history and product inventory to CSV or PDF for backups.</li>
              <li>Invite shop owners by email—everyone works from the same dashboard.</li>
            </ul>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal card stack">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Name your shop</h3>
              <button className="ghost" type="button" onClick={() => setShowModal(false)}>Close</button>
            </div>
            <form className="stack" onSubmit={handleCreateShop}>
              <label>
                Shop name
                <input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g., Green Field Agro"
                  autoFocus
                />
              </label>
              <button type="submit" disabled={creating}>{creating ? "Creating..." : "Create and go to dashboard"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
