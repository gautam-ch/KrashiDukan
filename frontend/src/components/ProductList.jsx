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
        <div key={p._id} className={`product-card ${expiryStatus(p)}`}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>{p.title}</strong>
            <span className="tag">{p.category || "uncategorized"}</span>
          </div>
          <p className="muted">{p.description}</p>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span>Spray: {p.sprayCount || "-"}</span>
            <span>Qty: {p.quantity}</span>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span>Sell: {p.sellingPrice}</span>
            <span className="muted">Expiry: {formatDate(p.expiryDate)}</span>
          </div>
          <div className="chip-row">
            {(p.tags || []).map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
          <button onClick={() => onAddToCart?.(p)}>Add to cart</button>
        </div>
      ))}
      {products.length === 0 && <p className="muted">No products found.</p>}
    </div>
  );
}
