import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductFilters } from "../components/ProductFilters";
import { ProductList } from "../components/ProductList";
import { api } from "../api/client";
import { toast } from "react-hot-toast";
import { Pagination } from "../components/Pagination";
import { AddToCartModal } from "../components/AddToCartModal";
import { downloadBlob } from "../utils/exporters";

export function SearchPage({ shopId, onAddToCart, onLogout }) {
  const navigate = useNavigate();
  const [draftFilters, setDraftFilters] = useState({ sprayCount: "", category: "all", search: "" });
  const [appliedFilters, setAppliedFilters] = useState({ sprayCount: "", category: "all", search: "" });
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ nextCursor: null, hasNextPage: false, totalCount: 0, limit: 20 });
  const [cursorStack, setCursorStack] = useState([]);
  const [activeCursor, setActiveCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showMenu, setShowMenu] = useState(false);

  const runSearch = useCallback(async ({ cursor = null, nextFilters = appliedFilters, includeTotal = false } = {}) => {
    if (!shopId) return;
    setLoading(true);
    try {
      const params = {
        ...nextFilters,
        limit: 20,
      };
      if (cursor?.cursor && cursor?.cursorId) {
        params.cursor = cursor.cursor;
        params.cursorId = cursor.cursorId;
      }
      if (includeTotal) {
        params.includeTotal = true;
      }
      const data = await api.searchProducts(shopId, params);
      setProducts(data.products || []);
      setPagination((prev) => ({
        limit: data.pagination?.limit ?? prev.limit,
        hasNextPage: Boolean(data.pagination?.hasNextPage),
        nextCursor: data.pagination?.nextCursor ?? null,
        totalCount: data.pagination?.totalCount ?? prev.totalCount,
      }));
    } catch (err) {
      toast.error(err?.message || "Could not fetch products");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, shopId]);

  useEffect(() => {
    runSearch({ cursor: activeCursor, nextFilters: appliedFilters, includeTotal: !activeCursor });
  }, [activeCursor, appliedFilters, runSearch]);

  const handleSearch = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
    setActiveCursor(null);
    setCursorStack([]);
  };

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

  const handleExportCSV = async () => {
    if (!shopId) return;
    try {
      const blob = await api.exportProductsCSV(shopId, appliedFilters);
      downloadBlob(blob, "products.csv");
    } catch (err) {
      toast.error(err?.message || "Could not export CSV");
    }
  };

  const handleExportPDF = async () => {
    if (!shopId) return;
    try {
      const blob = await api.exportProductsPDF(shopId, appliedFilters);
      downloadBlob(blob, "products.pdf");
    } catch (err) {
      toast.error(err?.message || "Could not export PDF");
    }
  };

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Search products</h1>
        </div>
        <div className="row header-actions">
          <button className="ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="ghost" onClick={() => navigate("/orders")}>Orders</button>
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
              <button className="menu-item" onClick={() => { navigate("/orders"); setShowMenu(false); }}>Orders</button>
              <button className="menu-item" onClick={() => { onLogout?.(); setShowMenu(false); }}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <div className="card stack">
        <h3>Search filters</h3>
        <ProductFilters
          filters={draftFilters}
          onChange={setDraftFilters}
          onSearch={handleSearch}
          showSearchButton
          showExports
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
        />
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3>Results</h3>
          <span className="muted">{pagination.totalCount} items</span>
        </div>
        {loading ? <p className="muted">Loading products...</p> : (
          <ProductList
            products={products}
            onAddToCart={(product) => {
              setSelectedProduct(product);
              setQuantity(1);
            }}
          />
        )}
        <Pagination
          page={page}
          hasNext={pagination.hasNextPage}
          hasPrev={cursorStack.length > 0}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </div>

      <AddToCartModal
        product={selectedProduct}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onClose={() => setSelectedProduct(null)}
        onConfirm={(qty) => {
          onAddToCart?.(selectedProduct, qty);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}
