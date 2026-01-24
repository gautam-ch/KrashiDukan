import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductForm } from "../components/ProductForm";

export function AddProductPage({ onProductSubmit }) {
  const navigate = useNavigate();
  const [productForm, setProductForm] = useState({
    title: "",
    contents: "",
    img: "",
    category: "",
    customCategory: "",
    sprayCount: 5,
    tags: "",
  });

  const handleSubmit = async (productData) => {
    await onProductSubmit?.(productData);
    setProductForm({
      title: "",
      contents: "",
      img: "",
      category: "",
      customCategory: "",
      sprayCount: 5,
      tags: "",
    });
  };

  return (
    <div className="app-shell">
       <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Add New Product</h1>
        </div>
        <div className="row header-actions">
          <button className="ghost" onClick={() => navigate("/dashboard")}>Dashboard</button>
        </div>
      </div>
      <div className="card-container">
        <ProductForm
          value={productForm}
          onChange={setProductForm}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
