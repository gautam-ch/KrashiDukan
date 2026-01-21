import { useState } from "react";

export function ShopCard({ shop, onCreate, onAddOwner, inline }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  if (inline) {
    return null;
  }

  if (shop) {
    return (
      <div className="card stack">
        <h3>Shop</h3>
        <p className="muted">{shop.name}</p>
        <button type="button" onClick={() => setShowOwnerModal(true)}>Add owner</button>
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
                  await onAddOwner?.(email);
                  setEmail("");
                  setShowOwnerModal(false);
                }}
              >
                <label>
                  Owner email
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@example.com" required />
                </label>
                <button type="submit">Send invite</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Create your shop</h3>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); onCreate?.(name); }}>
        <label>
          Shop name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <button type="submit">Create shop</button>
      </form>
    </div>
  );
}
