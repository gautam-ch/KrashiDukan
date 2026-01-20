const sprayCounts = [5, 10, 15];
const categories = ["chipko", "toxic", "pesticide", "fungicide", "insecticide"];

export function ProductForm({ value, onChange, onSubmit }) {
  const update = (field, val) => onChange?.({ ...value, [field]: val });

  return (
    <div className="card stack">
      <h3>Add product</h3>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}>
        <label>Title<input value={value.title} onChange={(e) => update("title", e.target.value)} required /></label>
        <label>Description<textarea value={value.description} onChange={(e) => update("description", e.target.value)} required /></label>
        <div className="row">
          <label style={{ flex: 1 }}>Category
            <select value={value.category} onChange={(e) => update("category", e.target.value)}>
              <option value="">Select</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label style={{ width: 140 }}>Spray count
            <select value={value.sprayCount} onChange={(e) => update("sprayCount", e.target.value)}>
              {sprayCounts.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div className="row">
          <label style={{ flex: 1 }}>Cost price (text)
            <input value={value.costPrice} onChange={(e) => update("costPrice", e.target.value)} required />
          </label>
          <label style={{ flex: 1 }}>Selling price
            <input type="number" value={value.sellingPrice} onChange={(e) => update("sellingPrice", e.target.value)} required />
          </label>
        </div>
        <div className="row">
          <label style={{ flex: 1 }}>Expiry date
            <input type="date" value={value.expiryDate} onChange={(e) => update("expiryDate", e.target.value)} required />
          </label>
          <label style={{ flex: 1 }}>Quantity
            <input type="number" value={value.quantity} onChange={(e) => update("quantity", e.target.value)} required />
          </label>
        </div>
        <label>Tags (comma separated)
          <input value={value.tags} onChange={(e) => update("tags", e.target.value)} />
        </label>
        <label>Image URL (optional)
          <input value={value.img} onChange={(e) => update("img", e.target.value)} />
        </label>
        <button type="submit">Save product</button>
      </form>
    </div>
  );
}
