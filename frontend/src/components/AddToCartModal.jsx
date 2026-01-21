export function AddToCartModal({ product, quantity, onQuantityChange, onClose, onConfirm }) {
  if (!product) return null;
  const maxQty = Math.max(0, Number(product.quantity ?? 0));
  const safeMax = Math.max(1, maxQty);
  const safeQuantity = Math.min(Math.max(Number(quantity || 1), 1), safeMax);

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
              max={safeMax}
              value={safeQuantity}
              onChange={(e) => {
                const next = Math.min(Math.max(Number(e.target.value) || 1, 1), safeMax);
                onQuantityChange?.(next);
              }}
            />
          </label>
          <button onClick={() => onConfirm?.(safeQuantity)} disabled={maxQty <= 0}>
            {maxQty <= 0 ? "Out of stock" : "Add to cart"}
          </button>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Total: ₹{Number(product.sellingPrice || 0) * Number(safeQuantity || 1)}
        </p>
      </div>
    </div>
  );
}
