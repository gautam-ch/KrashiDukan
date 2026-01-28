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
    try {
      await onProductSubmit?.(productData);
    } catch {
      // Error is already handled by the global error handler in App.jsx
      // We catch it here to prevent the form from clearing on failure
      return;
    }

    // Clear form only on successful submission
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
