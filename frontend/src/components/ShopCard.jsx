import { useState } from "react";

export function ShopCard({ shop, onCreate, onAddOwner }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (shop) {
    return (
      <div className="card stack">
        <h3>Shop</h3>
        <p className="muted">{shop.name}</p>
        <form className="stack" onSubmit={(e) => { e.preventDefault(); onAddOwner?.(email); }}>
          <label>
            Add owner by email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@example.com" required />
          </label>
          <button type="submit">Add owner</button>
        </form>
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
