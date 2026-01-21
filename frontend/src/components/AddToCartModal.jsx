export function AddToCartModal({ product, quantity, onQuantityChange, onClose, onConfirm }) {
  if (!product) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal card stack modal-compact">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="muted" style={{ margin: 0 }}>Add to cart</p>
            <h3 style={{ margin: 0 }}>{product.title}</h3>
          </div>
          <button className="ghost" type="button" onClick={onClose}>Close</button>
        </div>
        <p className="muted" style={{ margin: 0 }}>{product.description}</p>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="tag">{product.category || "uncategorized"}</span>
          <strong>₹{product.sellingPrice}</strong>
        </div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <label className="inline">
            Qty
            <input
              className="compact-input"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => onQuantityChange?.(Number(e.target.value) || 1)}
            />
          </label>
          <button onClick={() => onConfirm?.(quantity)}>Add to cart</button>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Total: ₹{Number(product.sellingPrice || 0) * Number(quantity || 1)}
        </p>
      </div>
    </div>
  );
}
