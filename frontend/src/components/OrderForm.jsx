export function OrderForm({ value, onChange, onSubmit, disabled }) {
  const update = (field, val) => onChange?.({ ...value, [field]: val });
  return (
    <div className="card stack">
      <h3>Create order</h3>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}>
        <label>Name<input value={value.name} onChange={(e) => update("name", e.target.value)} required /></label>
        <label>Mobile<input value={value.contact} onChange={(e) => update("contact", e.target.value)} required /></label>
        <label>Village<input value={value.village} onChange={(e) => update("village", e.target.value)} /></label>
        <button type="submit" disabled={disabled}>{disabled ? "Saving..." : "Save order"}</button>
      </form>
    </div>
  );
}
