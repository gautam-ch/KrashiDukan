import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderHistory } from "../components/OrderHistory";
import { api } from "../api/client";
import { toast } from "react-hot-toast";
import { Pagination } from "../components/Pagination";

export function OrdersPage({ shopId, onLogout }) {
  const navigate = useNavigate();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ nextCursor: null, hasNextPage: false, totalCount: 0, limit: 20 });
  const [cursorStack, setCursorStack] = useState([]);
  const [activeCursor, setActiveCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const loadOrders = useCallback(async ({ cursor = null, nextSearch = search, includeTotal = false } = {}) => {
    if (!shopId) return;
    setLoading(true);
    try {
      const params = { limit: 20, search: nextSearch };
      if (cursor?.cursor && cursor?.cursorId) {
        params.cursor = cursor.cursor;
        params.cursorId = cursor.cursorId;
      }
      if (includeTotal) {
        params.includeTotal = true;
      }
      const data = await api.getOrders(shopId, params);
      setOrders(data.orders || []);
      setPagination((prev) => ({
        limit: data.pagination?.limit ?? prev.limit,
        hasNextPage: Boolean(data.pagination?.hasNextPage),
        nextCursor: data.pagination?.nextCursor ?? null,
        totalCount: data.pagination?.totalCount ?? prev.totalCount,
      }));
    } catch (err) {
      toast.error(err?.message || "Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [shopId, search]);

  useEffect(() => {
    loadOrders({ cursor: activeCursor, nextSearch: search, includeTotal: !activeCursor });
  }, [activeCursor, search, loadOrders]);

  const handleNext = () => {
    if (!pagination?.nextCursor) return;
    setCursorStack((prev) => [...prev, activeCursor]);
    setActiveCursor(pagination.nextCursor);
    setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCursorStack((prev) => {
      if (prev.length === 0) return prev;
      const nextStack = [...prev];
      const prevCursor = nextStack.pop();
      setActiveCursor(prevCursor || null);
      setPage((prevPage) => Math.max(1, prevPage - 1));
      return nextStack;
    });
  };

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Order history</h1>
        </div>
        <div className="row header-actions">
          <button className="ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="ghost" onClick={() => navigate("/search")}>Search</button>
          <button className="ghost" onClick={onLogout}>Logout</button>
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
              <button className="menu-item" onClick={() => { onLogout?.(); setShowMenu(false); }}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0 }}>Search orders</h3>
            <p className="muted" style={{ margin: 0 }}>Search by name, contact, or village.</p>
          </div>
        </div>
        <div className="row">
          <input
            placeholder="e.g., Rahul / 98765 / Manpura"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              setSearch(searchDraft.trim());
              setPage(1);
              setActiveCursor(null);
              setCursorStack([]);
            }}
          >
            Search
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              setSearchDraft("");
              setSearch("");
              setPage(1);
              setActiveCursor(null);
              setCursorStack([]);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? <p className="muted">Loading orders...</p> : <OrderHistory orders={orders} />}

      <Pagination
        page={page}
        hasNext={pagination.hasNextPage}
        hasPrev={cursorStack.length > 0}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </div>
  );
}
