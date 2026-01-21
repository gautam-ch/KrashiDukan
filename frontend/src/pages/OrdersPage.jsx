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
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 20 });
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async ({ nextPage = 1, nextSearch = search } = {}) => {
    if (!shopId) return;
    setLoading(true);
    try {
      const data = await api.getOrders(shopId, { page: nextPage, limit: 20, search: nextSearch });
      setOrders(data.orders || []);
      setPagination(data.pagination || { currentPage: nextPage, totalPages: 1, totalCount: 0, limit: 20 });
    } catch (err) {
      toast.error(err?.message || "Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [shopId, search]);

  useEffect(() => {
    loadOrders({ nextPage: page, nextSearch: search });
  }, [page, search, loadOrders]);

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Order history</h1>
        </div>
        <div className="row">
          <button className="ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="ghost" onClick={() => navigate("/search")}>Search</button>
          <button className="ghost" onClick={onLogout}>Logout</button>
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
          <button type="button" onClick={() => { setSearch(searchDraft.trim()); setPage(1); }}>Search</button>
          <button
            type="button"
            className="ghost"
            onClick={() => { setSearchDraft(""); setSearch(""); setPage(1); }}
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? <p className="muted">Loading orders...</p> : <OrderHistory orders={orders} />}

      <Pagination
        page={pagination.currentPage || page}
        totalPages={pagination.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}
