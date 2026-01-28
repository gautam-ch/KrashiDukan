import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api } from "../api/client";

export function ProductListPage({ shopId }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCursors, setPageCursors] = useState([null]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(null);
  const pageSize = 10;

  const fetchProducts = useCallback((pageIndex, cursorInfo = null) => {
    if (!shopId) return;
    setLoading(true);
    api.getProducts(shopId, {
      limit: pageSize,
      cursor: cursorInfo?.cursor,
      cursorId: cursorInfo?.cursorId,
      includeTotal: pageIndex === 1,
      title: searchTerm.trim() || undefined,
    })
      .then((data) => {
        setProducts(data.products || []);
        setHasNextPage(Boolean(data.pagination?.hasNextPage));
        if (typeof data.pagination?.totalCount === "number") {
          setTotalCount(data.pagination.totalCount);
        } else if (pageIndex === 1) {
          setTotalCount(null);
        }
        if (pageIndex > 1) {
          setPageCursors((prev) => {
            const next = [...prev];
            next[pageIndex] = cursorInfo;
            return next;
          });
        }
      })
      .catch((err) => toast.error(err?.message || "Could not load products"))
      .finally(() => setLoading(false));
  }, [shopId, pageSize, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, null);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const totalPages = totalCount ? Math.max(1, Math.ceil(totalCount / pageSize)) : null;

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString();
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.deleteProduct(shopId, productId);
        toast.success("Product deleted");
        const shouldGoBack = products.length === 1 && currentPage > 1;
        const targetPage = shouldGoBack ? currentPage - 1 : currentPage;
        const cursorInfo = pageCursors[targetPage] || null;
        setCurrentPage(targetPage);
        fetchProducts(targetPage, cursorInfo);
      } catch (err) {
        toast.error(err?.message || "Could not delete product");
      }
    }
  };

  const handleSearch = () => {
    const nextCursors = [null];
    setPageCursors(nextCursors);
    setCurrentPage(1);
    setHasNextPage(false);
    setTotalCount(null);
    setSearchTerm(searchInput.trim());
    fetchProducts(1, null);
  };

  const handleNext = () => {
    if (!hasNextPage || products.length === 0) return;
    const last = products[products.length - 1];
    if (!last) return;
    const nextCursor = {
      cursor: last.expiryDate,
      cursorId: last._id,
    };
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchProducts(nextPage, nextCursor);
  };

  const handlePrev = () => {
    if (currentPage === 1) return;
    const prevPage = currentPage - 1;
    const cursorInfo = pageCursors[prevPage] || null;
    setCurrentPage(prevPage);
    fetchProducts(prevPage, cursorInfo);
  };

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Manage Products</h1>
        </div>
        <div className="row header-actions">
          <button className="ghost" onClick={() => fetchProducts(true)} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
        </div>
      </div>
      <div className="card filter-bar">
        <label style={{ minWidth: 220, flex: 1 }}>
          Search by title
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Type product title"
          />
        </label>
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <span className="muted">
            {totalCount === null
              ? `Showing ${products.length}`
              : `Showing ${products.length} of ${totalCount}`}
          </span>
          <button className="ghost" type="button" onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
      <div className="card-container">
        {loading && products.length === 0 ? (
          <p>Loading products...</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Expiry</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted">No products found.</td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td data-label="Title">{product.title}</td>
                      <td data-label="Category">{product.category}</td>
                      <td data-label="Quantity">{product.quantity}</td>
                      <td data-label="Price">{product.sellingPrice}</td>
                      <td data-label="Expiry">{formatDate(product.expiryDate)}</td>
                      <td data-label="Actions">
                        <div className="row" style={{ gap: "0.5rem" }}>
                          <button className="ghost" onClick={() => navigate(`/products/${product._id}/edit`)}>Edit</button>
                          <button className="ghost danger" onClick={() => handleDelete(product._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {(totalPages === null ? hasNextPage || currentPage > 1 : totalPages > 1) && (
          <div className="pagination">
            <button
              className="ghost page-button"
              onClick={handlePrev}
              disabled={currentPage === 1 || loading}
            >
              Prev
            </button>
            <button className="ghost page-button active" disabled>
              {totalPages ? `${currentPage} / ${totalPages}` : `Page ${currentPage}`}
            </button>
            <button
              className="ghost page-button"
              onClick={handleNext}
              disabled={!hasNextPage || loading}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
