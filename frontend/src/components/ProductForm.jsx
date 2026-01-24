import { useState } from "react";

const sprayCounts = [2, 5, 10, 20];
const categories = [
  "fertilizer",
  "insecticide (sucking)",
  "insecticide (chewing)",
  "pesticide",
  "fungicide",
  "chipko",
  "tonic",
  "fungicide+Insecticide",
  "insecticide(sucking+chewing)",
   "herbicide",
  "other",
];

export function ProductForm({ value, onChange, onSubmit }) {
  const [variants, setVariants] = useState([
    { costPrice: "", sellingPrice: "", expiryDate: "", quantity: "" },
  ]);

  const update = (field, val) => onChange?.({ ...value, [field]: val });

  const handleVariantChange = (index, field, val) => {
    const newVariants = [...variants];
    newVariants[index][field] = val;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { costPrice: "", sellingPrice: "", expiryDate: "", quantity: "" },
    ]);
  };

  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    variants.forEach((variant) => {
      const productData = {
        ...value,
        ...variant,
        tags: value.tags.split(",").map((tag) => tag.trim()),
      };
      onSubmit?.(productData);
    });
  };

  return (
    <div className="card stack">
      <h3>Add product</h3>
      <form className="stack" onSubmit={handleSubmit}>
        <label>Title<input value={value.title} onChange={(e) => update("title", e.target.value)} required /></label>
        <label>Contents<textarea value={value.contents} onChange={(e) => update("contents", e.target.value)} required /></label>
        <div className="row">
          <label style={{ flex: 1 }}>Category
            <select value={value.category} onChange={(e) => update("category", e.target.value)} required>
              <option value="">Select</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label style={{ width: 140 }}>Spray count
            <select value={value.sprayCount} onChange={(e) => update("sprayCount", e.target.value)} required>
              {sprayCounts.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        {value.category === "other" && (
          <label>Custom category
            <input value={value.customCategory} onChange={(e) => update("customCategory", e.target.value)} required />
          </label>
        )}

        {variants.map((variant, index) => (
          <div key={index} className="variant-group">
            <div className="row">
              <label style={{ flex: 1 }}>Cost price (text)
                <input value={variant.costPrice} onChange={(e) => handleVariantChange(index, "costPrice", e.target.value)} required />
              </label>
              <label style={{ flex: 1 }}>Selling price
                <input type="number" value={variant.sellingPrice} onChange={(e) => handleVariantChange(index, "sellingPrice", e.target.value)} required />
              </label>
            </div>
            <div className="row">
              <label style={{ flex: 1 }}>Expiry date
                <input type="date" value={variant.expiryDate} onChange={(e) => handleVariantChange(index, "expiryDate", e.target.value)} required />
              </label>
              <label style={{ flex: 1 }}>Quantity
                <input type="number" value={variant.quantity} onChange={(e) => handleVariantChange(index, "quantity", e.target.value)} required />
              </label>
            </div>
            {variants.length > 1 && (
              <button type="button" onClick={() => removeVariant(index)}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addVariant}>Add another variant</button>

        <label>Specifications (comma separated)
          <input value={value.tags} onChange={(e) => update("tags", e.target.value)} required />
        </label>
        <label>Image URL (optional)
          <input value={value.img} onChange={(e) => update("img", e.target.value)} />
        </label>
        <button type="submit">Save products</button>
      </form>
    </div>
  );
}

