import { ProductForm } from "../components/ProductForm";
import { ProductFilters } from "../components/ProductFilters";
import { ProductList } from "../components/ProductList";
import { Cart } from "../components/Cart";
import { OrderForm } from "../components/OrderForm";
import { OrderHistory } from "../components/OrderHistory";
import { ShopCard } from "../components/ShopCard";

export function DashboardPage({
  shop,
  productForm,
  onProductChange,
  onProductSubmit,
  filters,
  onFilterChange,
  filteredProducts,
  onExportProductsCSV,
  onExportProductsPDF,
  onAddToCart,
  cart,
  onCartQty,
  onCartRemove,
  cartTotal,
  orderForm,
  onOrderChange,
  onOrderSubmit,
  orders,
  onLogout,
  onAddOwner,
}) {
  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Pesticide shop console</h1>
        </div>
        {onLogout && <button className="ghost" onClick={onLogout}>Logout</button>}
      </div>

      <div className="grid">
        <ShopCard shop={shop} onAddOwner={onAddOwner} />
        <ProductForm value={productForm} onChange={onProductChange} onSubmit={onProductSubmit} />
      </div>

      <div className="card stack">
        <h3>Products</h3>
        <ProductFilters
          filters={filters}
          onChange={onFilterChange}
          onExportCSV={onExportProductsCSV}
          onExportPDF={onExportProductsPDF}
        />
        <ProductList products={filteredProducts} onAddToCart={onAddToCart} />
      </div>

      <div className="grid">
        <Cart
          items={cart}
          onQtyChange={onCartQty}
          onRemove={onCartRemove}
          total={cartTotal}
        />
        <OrderForm
          value={orderForm}
          onChange={onOrderChange}
          onSubmit={onOrderSubmit}
          disabled={cart.length === 0}
        />
      </div>

      <OrderHistory orders={orders} />
    </div>
  );
}
