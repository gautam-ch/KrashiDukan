import { formatDate, monthsUntil } from "../api/client";

export function ProductList({ products, onAddToCart }) {
  const expiryStatus = (product) => {
    const months = monthsUntil(product.expiryDate);
    if (months < 6) return "status-red";
    if (months <= 12) return "status-yellow";
    return "status-green";
  };

  return (
    <div className="list compact-list">
      {products.map((p) => (
        <div key={p._id} className={`product-card compact-card ${expiryStatus(p)}`}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="stack" style={{ gap: 4 }}>
              <strong className="product-title">{p.title}</strong>
              <span className="muted" style={{ fontSize: 12 }}>{p.description}</span>
            </div>
            <span className="tag">{p.category || "uncategorized"}</span>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="muted">Spray: {p.sprayCount || "-"}</span>
            <span className="muted">Qty: {p.quantity}</span>
          </div>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <strong>₹{p.sellingPrice}</strong>
            <span className="muted">Expiry: {formatDate(p.expiryDate)}</span>
          </div>
          <div className="chip-row">
            {(p.tags || []).slice(0, 2).map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
          <button className="btn-small" onClick={() => onAddToCart?.(p)}>Add to cart</button>
        </div>
      ))}
      {products.length === 0 && <p className="muted">No products found.</p>}
    </div>
  );
}
