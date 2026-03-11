import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { toast } from "react-hot-toast";

export function SalesPage({ shop }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    if (!shop?._id) return;
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const res = await api.getSalesAnalytics(shop._id, params);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error(err?.message || "Could not load sales analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [shop]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <p className="muted" style={{ margin: 0 }}>Krashi Dukan</p>
          <h1 className="title">Sales Analytics</h1>
        </div>
        <div className="row header-actions">
          <button className="ghost" onClick={() => navigate("/")}>Dashboard</button>
        </div>
      </div>

      <div className="card stack" style={{ marginBottom: 16 }}>
        <form className="row wrap" style={{ alignItems: "flex-end" }} onSubmit={handleFilter}>
          <label className="stack" style={{ gap: 4 }}>
            <span>Start Date</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </label>
          <label className="stack" style={{ gap: 4 }}>
            <span>End Date</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Filter"}
          </button>
        </form>
      </div>

      {loading && !data ? (
        <p>Loading analytics data...</p>
      ) : data ? (
        <div className="stack" style={{ gap: 24 }}>
          {/* Total KPI */}
          <div className="row wrap" style={{ gap: 16 }}>
            <div className="card" style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              <h3 className="muted" style={{ margin: 0 }}>Total Sales</h3>
              <div style={{ fontSize: 32, fontWeight: 600, color: "#16a34a" }}>₹{data.total?.sales}</div>
            </div>
            <div className="card" style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              <h3 className="muted" style={{ margin: 0 }}>Total Profit</h3>
              <div style={{ fontSize: 32, fontWeight: 600, color: "#2563eb" }}>₹{data.total?.profit}</div>
            </div>
          </div>

          <div className="row wrap" style={{ gap: 24 }}>
            {/* Last Week Overview */}
            <div className="card stack" style={{ flex: 1, minWidth: 300 }}>
              <h3>Last 7 Days</h3>
              <div style={{ overflowX: "auto" }}>
                {data.lastWeek && data.lastWeek.length > 0 ? (
                  <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th align="left">Date</th>
                        <th align="right">Sales (₹)</th>
                        <th align="right">Profit (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lastWeek.map((item) => (
                        <tr key={item.date}>
                          <td>{item.date}</td>
                          <td align="right">{item.sales}</td>
                          <td align="right">{item.profit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="muted">No data in last 7 days</p>
                )}
              </div>
            </div>

            {/* Last 6 Months Overview */}
            <div className="card stack" style={{ flex: 1, minWidth: 300 }}>
              <h3>Last 6 Months</h3>
              <div style={{ overflowX: "auto" }}>
                {data.last6Months && data.last6Months.length > 0 ? (
                  <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th align="left">Month</th>
                        <th align="right">Sales (₹)</th>
                        <th align="right">Profit (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.last6Months.map((item) => (
                        <tr key={item.month}>
                          <td>{item.month}</td>
                          <td align="right">{item.sales}</td>
                          <td align="right">{item.profit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="muted">No data in last 6 months</p>
                )}
              </div>
            </div>
          </div>

          {/* Month Wise Extended Tool */}
          <div className="card stack">
            <h3>Month Wise Sales (All time)</h3>
            <div style={{ overflowX: "auto" }}>
              {data.monthWise && data.monthWise.length > 0 ? (
                <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th align="left">Month</th>
                      <th align="right">Sales (₹)</th>
                      <th align="right">Profit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthWise.map((item) => (
                      <tr key={item.month}>
                        <td>{item.month}</td>
                        <td align="right">{item.sales}</td>
                        <td align="right">{item.profit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="muted">No monthly data available</p>
              )}
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="card stack">
            <h3>Top Selling Products</h3>
            <div style={{ overflowX: "auto" }}>
              {data.topProducts && data.topProducts.length > 0 ? (
                <table className="table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                  <thead>
                    <tr>
                      <th align="left">Product</th>
                      <th align="right">Qty Sold</th>
                      <th align="right">Total Sales (₹)</th>
                      <th align="right">Total Profit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((prod) => (
                      <tr key={prod.name}>
                        <td>{prod.name}</td>
                        <td align="right">{prod.quantity}</td>
                        <td align="right">{prod.sales.toFixed(2)}</td>
                        <td align="right">{prod.profit.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="muted">No product data available</p>
              )}
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
