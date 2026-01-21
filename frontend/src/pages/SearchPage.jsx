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
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const runSearch = useCallback(async ({ nextPage = 1, nextFilters = appliedFilters } = {}) => {
    if (!shopId) return;
    setLoading(true);
    try {
      const data = await api.searchProducts(shopId, {
        ...nextFilters,
        page: nextPage,
        limit: 20,
      });
      setProducts(data.products || []);
      setPagination(data.pagination || { currentPage: nextPage, totalPages: 1, totalCount: 0, limit: 20 });
    } catch (err) {
      toast.error(err?.message || "Could not fetch products");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, shopId]);

  useEffect(() => {
    runSearch({ nextPage: page, nextFilters: appliedFilters });
  }, [page, appliedFilters, runSearch]);

  const handleSearch = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
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
        <div className="row">
          <button className="ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button className="ghost" onClick={() => navigate("/orders")}>Orders</button>
          <button className="ghost" onClick={onLogout}>Logout</button>
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
          page={pagination.currentPage || page}
          totalPages={pagination.totalPages || 1}
          onPageChange={setPage}
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
