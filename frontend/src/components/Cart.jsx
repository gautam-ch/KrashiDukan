export function Cart({ items, onQtyChange, onRemove, total, showHeader = true }) {
  return (
    <div className="card stack cart-card">
      {showHeader && (
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Cart</h3>
          <span className="muted">{items.length} items</span>
        </div>
      )}
      {items.length === 0 && <p className="muted">Add items from product list.</p>}
      {items.map((item) => (
        <div key={item.product._id} className="cart-item">
          <div className="cart-meta">
            <strong>{item.product.title}</strong>
            <span className="muted">{item.product.category}</span>
          </div>
          <div className="cart-controls">
            <input
              className="cart-qty"
              type="number"
              min={1}
              max={Number(item.product?.quantity ?? 0) || 1}
              value={item.quantity}
              onChange={(e) => onQtyChange?.(item.product._id, e.target.value)}
            />
            <span className="cart-price">₹{Number(item.product.sellingPrice) * item.quantity}</span>
            <button className="ghost cart-remove" onClick={() => onRemove?.(item.product._id)}>Remove</button>
          </div>
        </div>
      ))}
      <hr className="divider" />
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong>Total</strong>
        <strong>₹{total}</strong>
      </div>
    </div>
  );
}
