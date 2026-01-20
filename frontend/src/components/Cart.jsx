export function Cart({ items, onQtyChange, onRemove, total }) {
  return (
    <div className="card stack">
      <h3>Cart</h3>
      {items.length === 0 && <p className="muted">Add items from product list.</p>}
      {items.map((item) => (
        <div key={item.product._id} className="row" style={{ justifyContent: "space-between", width: "100%" }}>
          <div className="stack" style={{ flex: 1 }}>
            <strong>{item.product.title}</strong>
            <span className="muted">{item.product.category}</span>
          </div>
          <input
            type="number"
            min={1}
            style={{ width: 90 }}
            value={item.quantity}
            onChange={(e) => onQtyChange?.(item.product._id, e.target.value)}
          />
          <span>₹{Number(item.product.sellingPrice) * item.quantity}</span>
          <button className="ghost" onClick={() => onRemove?.(item.product._id)}>Remove</button>
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
