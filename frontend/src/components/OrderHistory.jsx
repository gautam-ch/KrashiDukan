import { formatDate } from "../api/client";
import { downloadCSV, downloadPrintPDF } from "../utils/exporters";

export function OrderHistory({ orders }) {
  const exportCSV = () => {
    if (!orders.length) return;
    const headers = ["name", "contact", "village", "total", "items"];
    const rows = orders.map((o) => ({
      name: o.name,
      contact: o.contact,
      village: o.village,
      total: o.totalAmount,
      items: o.items?.map((i) => `${i.productName} x${i.quantity}`).join(";")
    }));
    downloadCSV(rows, headers, "orders.csv");
  };

  const exportPDF = () => {
    if (!orders.length) return;
    const rows = orders.map((o) => `
      <tr>
        <td>${o.name}</td>
        <td>${o.contact}</td>
        <td>${o.village || ""}</td>
        <td>${o.totalAmount || 0}</td>
        <td>${(o.items || []).map((i) => `${i.productName} x${i.quantity}`).join("; ")}</td>
      </tr>
    `).join("\n");
    const table = `<table><thead><tr><th>Name</th><th>Contact</th><th>Village</th><th>Total</th><th>Items</th></tr></thead><tbody>${rows}</tbody></table>`;
    downloadPrintPDF("Order history", table);
  };

  return (
    <div className="card stack">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h3>Order history</h3>
        <div className="row">
          <button className="ghost" onClick={exportCSV}>Download CSV</button>
          <button className="ghost" onClick={exportPDF}>Download PDF</button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Village</th>
              <th>Total</th>
              <th>Items</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.name}</td>
                <td>{o.contact}</td>
                <td>{o.village}</td>
                <td>{o.totalAmount}</td>
                <td>{(o.items || []).map((i) => `${i.productName} x${i.quantity}`).join(", ")}</td>
                <td>{formatDate(o.createdAt)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="muted">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
