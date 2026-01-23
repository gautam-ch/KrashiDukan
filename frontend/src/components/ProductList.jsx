import { formatDate, monthsUntil } from "../api/client";

export function ProductList({ products, onAddToCart }) {
  const expiryStatus = (product) => {
    const months = monthsUntil(product.expiryDate);
    if (months < 6) return "status-red";
    if (months <= 12) return "status-yellow";
    return "status-green";
  };

  return (
    <div className="list">
      {products.map((p) => (
        <div key={p._id} className={`standard-card ${expiryStatus(p)}`}>
          {/* Title - Always at top */}
          <h3 className="card-title">{p.title}</h3>
          
          {/* Price - Prominently displayed */}
          <div className="card-price">₹{p.sellingPrice}</div>
          
          {/* Category Badge */}
          <div className="card-category">
            <span className="tag">{p.category || "uncategorized"}</span>
          </div>
          
          {/* Contents */}
          <p className="card-description">{p.contents ?? p.description}</p>
          
          {/* Product Details */}
          <div className="card-details">
            <div className="detail-item">
              <span className="detail-label">Quantity</span>
              <span className="detail-value">{p.quantity}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Spray Count</span>
              <span className="detail-value">{p.sprayCount || "-"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Expiry</span>
              <span className="detail-value" style={{ fontSize: "1.05rem" }}><strong>{formatDate(p.expiryDate)}</strong></span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Cost Price</span>
              <span className="detail-value">₹{p.costPrice}</span>
            </div>
          </div>
          
          {/* Tags */}
          {p.tags && p.tags.length > 0 && (
            <div className="chip-row">
              {p.tags.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
          )}
          
          {/* Action Button */}
          <button
            className="card-button"
            onClick={() => onAddToCart?.(p)}
            disabled={Number(p.quantity ?? 0) <= 0}
          >
            {Number(p.quantity ?? 0) <= 0 ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      ))}
      {products.length === 0 && <p className="muted">No products found.</p>}
    </div>
  );
}
