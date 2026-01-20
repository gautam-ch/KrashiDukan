import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export function HomePage({ authed, shop, onCreateShop, onLogout }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [shopName, setShopName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Pesticide shop assistant</h1>
        </div>
        <div className="row" style={{ position: "relative" }}>
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
      </div>

      <div className="card hero">
        <div className="stack" style={{ gap: 12 }}>
          <span className="pill">Multi-tenant · Offline-friendly</span>
          <h2 style={{ margin: 0 }}>Track stock, owners, expiry, and orders in one clean console.</h2>
          <p className="muted" style={{ lineHeight: 1.5 }}>
            Sign up, invite owners by email, add pesticide inventory with spray count and category tags, see expiry colors,
            take cart orders with customer village and contact, and export CSV/PDF backups for compliance.
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
            <li>Cart + checkout collects name, contact, and village for every buyer.</li>
            <li>Export order history and product inventory to CSV or PDF for backups.</li>
            <li>Invite shop owners by email—everyone works from the same dashboard.</li>
          </ul>
        </div>
      </div>

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
