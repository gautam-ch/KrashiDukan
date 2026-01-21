import { ProductForm } from "../components/ProductForm";
import { Cart } from "../components/Cart";
import { OrderForm } from "../components/OrderForm";
import { ShopCard } from "../components/ShopCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function DashboardPage({
  shop,
  productForm,
  onProductChange,
  onProductSubmit,
  cart,
  onCartQty,
  onCartRemove,
  cartTotal,
  orderForm,
  onOrderChange,
  onOrderSubmit,
  onLogout,
  onAddOwner,
}) {
  const navigate = useNavigate();
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [showCart, setShowCart] = useState(false);
  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Pesticide shop console</h1>
        </div>
        <div className="row">
          <button className="ghost" onClick={() => navigate("/search")}>Search</button>
          <button className="ghost" onClick={() => navigate("/orders")}>Orders</button>
          <button className="ghost" onClick={() => setShowCart(true)}>Cart ({cart.length})</button>
          <button className="ghost" onClick={() => setShowOwnerModal(true)}>Add owner</button>
          {onLogout && <button className="ghost" onClick={onLogout}>Logout</button>}
        </div>
      </div>

      <div className="grid">
        <ShopCard shop={shop} onAddOwner={onAddOwner} inline />
        <ProductForm value={productForm} onChange={onProductChange} onSubmit={onProductSubmit} />
      </div>


      {showCart && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal card stack" style={{ maxWidth: 560 }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Cart</h3>
              <button className="ghost" type="button" onClick={() => setShowCart(false)}>Close</button>
            </div>
            <Cart
              items={cart}
              onQtyChange={onCartQty}
              onRemove={onCartRemove}
              total={cartTotal}
              showHeader={false}
            />
            <OrderForm
              value={orderForm}
              onChange={onOrderChange}
              onSubmit={onOrderSubmit}
              disabled={cart.length === 0}
            />
          </div>
        </div>
      )}

      {showOwnerModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal card stack">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Add owner</h3>
              <button className="ghost" type="button" onClick={() => setShowOwnerModal(false)}>Close</button>
            </div>
            <form
              className="stack"
              onSubmit={async (e) => {
                e.preventDefault();
                await onAddOwner?.(ownerEmail);
                setOwnerEmail("");
                setShowOwnerModal(false);
              }}
            >
              <label>
                Owner email
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="owner@example.com"
                  required
                />
              </label>
              <button type="submit">Send invite</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
