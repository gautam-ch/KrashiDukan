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
];

export function ProductFilters({ filters, onChange, onExportCSV, onExportPDF, onSearch, showSearchButton = false, showExports = true }) {
  const update = (field, val) => onChange?.({ ...filters, [field]: val });
  return (
    <div className="row">
      <input placeholder="Search by title, specifications..." value={filters.search} onChange={(e) => update("search", e.target.value)} />
      <p className="field-note">For multiple specifications, use commas (e.g. specA, specB)</p>
      <select value={filters.category} onChange={(e) => update("category", e.target.value)} style={{ maxWidth: 180 }}>
        <option value="all">All categories</option>
        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={filters.sprayCount} onChange={(e) => update("sprayCount", e.target.value)} style={{ maxWidth: 160 }}>
        <option value="">Any spray</option>
        {sprayCounts.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {showSearchButton && <button type="button" onClick={onSearch}>Search</button>}
      {showExports && (
        <div className="row">
          <button type="button" className="ghost" onClick={onExportCSV}>Export CSV</button>
          <button type="button" className="ghost" onClick={onExportPDF}>Export PDF</button>
        </div>
      )}
    </div>
  );
}
