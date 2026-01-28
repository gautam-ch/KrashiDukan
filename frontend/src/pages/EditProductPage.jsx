import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api } from "../api/client";
import { ProductForm } from "../components/ProductForm";

export function EditProductPage({ shopId }) {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (shopId && productId) {
      api.getProduct(shopId, productId)
        .then((data) => setProduct(data.product))
        .catch((err) => toast.error(err?.message || "Could not load product"));
    }
  }, [shopId, productId]);

  const handleSubmit = async (productData) => {
    try {
      await api.updateProduct(shopId, productId, productData);
      toast.success("Product updated");
      navigate("/products");
    } catch (err) {
      toast.error(err?.message || "Could not update product");
    }
  };

  if (!product) {
    return <p>Loading...</p>;
  }

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Edit Product</h1>
        </div>
        <div className="row header-actions">
          <button className="ghost" onClick={() => navigate("/products")}>Back to Products</button>
        </div>
      </div>
      <div className="card-container">
        <ProductForm
          value={product}
          onChange={setProduct}
          onSubmit={handleSubmit}
          isEditMode={true}
        />
      </div>
    </div>
  );
}
