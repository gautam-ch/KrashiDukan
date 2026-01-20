import { ShopCard } from "../components/ShopCard";

export function ShopPage({ shop, onCreate, onAddOwner, onLogout }) {
  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Set up your shop</h1>
        </div>
        {onLogout && <button className="ghost" onClick={onLogout}>Logout</button>}
      </div>
      <ShopCard shop={shop} onCreate={onCreate} onAddOwner={onAddOwner} />
    </div>
  );
}
