import React, { useState, useEffect, useCallback } from "react";

const API_URL = "/api/inventory";
const LOW_STOCK_THRESHOLD = 3;

const categoryClass = {
  Hardware:   "badge-hardware",
  Software:   "badge-software",
  Equipment:  "badge-equipment",
  Consumable: "badge-consumable",
};

const categoryColor = {
  Hardware:   "#3b82f6",
  Software:   "#8b5cf6",
  Equipment:  "#10b981",
  Consumable: "#ec4899",
};

function getStatusBadge(item) {
  if (item.quantity === 0)                        return ["Unavailable", "badge-unavailable"];
  if (item.quantity <= LOW_STOCK_THRESHOLD)       return ["Low stock",   "badge-low"];
  return ["Available", "badge-available"];
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="metric-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

function AddItemForm({ onAdd }) {
  const [form, setForm]       = useState({ name: "", category: "Hardware", quantity: "", status: "Available" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim())                              { setError("Name is required.");          return; }
    if (form.quantity === "" || Number(form.quantity) < 0) { setError("Enter a valid quantity."); return; }
    setError("");
    setLoading(true);
    try {
      await onAdd({ ...form, quantity: Number(form.quantity) });
      setForm({ name: "", category: "Hardware", quantity: "", status: "Available" });
    } catch (err) {
      setError(err.message || "Failed to add item.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header"><h2>Add inventory item</h2></div>
      <div className="card-body">
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="e.g. Arduino Kit" />
            </div>
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={form.category} onChange={handleChange}>
                <option>Hardware</option>
                <option>Software</option>
                <option>Equipment</option>
                <option>Consumable</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="quantity">Quantity</label>
              <input id="quantity" name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} placeholder="0" />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                <option>Available</option>
                <option>Unavailable</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Adding…" : "+ Add item"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InventoryTable({ items, onDelete }) {
  const [filterCat,    setFilterCat]    = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = items.filter(
    (i) => (!filterCat || i.category === filterCat) && (!filterStatus || i.status === filterStatus)
  );

  return (
    <div className="card">
      <div className="card-header">
        <h2>Inventory items ({filtered.length})</h2>
        <div className="filters">
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">All categories</option>
            <option>Hardware</option><option>Software</option><option>Equipment</option><option>Consumable</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option>Available</option><option>Unavailable</option>
          </select>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th>Category</th><th>Qty</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" className="empty">No items match your filters.</td></tr>
            ) : (
              filtered.map((item, idx) => {
                const [label, badgeClass] = getStatusBadge(item);
                return (
                  <tr key={item.id}>
                    <td style={{ color: "#aaa", fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td><span className={`badge ${categoryClass[item.category] || ""}`}>{item.category}</span></td>
                    <td>{item.quantity}</td>
                    <td><span className={`badge ${badgeClass}`}>{label}</span></td>
                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "4px 10px", fontSize: 11 }}
                        onClick={() => onDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryChart({ items }) {
  const counts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = sorted.length ? sorted[0][1] : 1;

  return (
    <div className="card">
      <div className="card-header"><h2>Items by category</h2></div>
      <div className="card-body">
        <div className="bar-rows">
          {sorted.map(([cat, count]) => (
            <div className="bar-row" key={cat}>
              <div className="bar-label">{cat}</div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${Math.round((count / max) * 100)}%`, background: categoryColor[cat] || "#888" }} />
              </div>
              <div className="bar-count">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Server error");
      setInventory(await res.json());
      setError("");
    } catch {
      setError("Could not load inventory. If running locally, make sure the dev server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  async function handleAdd(item) {
    const res = await fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(item),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to add item"); }
    await fetchInventory();
  }

  async function handleDelete(id) {
    await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
    await fetchInventory();
  }

  const total      = inventory.length;
  const available  = inventory.filter((i) => i.status === "Available").length;
  const lowStock   = inventory.filter((i) => i.quantity > 0 && i.quantity <= LOW_STOCK_THRESHOLD).length;
  const outOfStock = inventory.filter((i) => i.quantity === 0).length;
  const categories = [...new Set(inventory.map((i) => i.category))].length;

  return (
    <div className="app">
      <div className="app-header">
        <h1>Open Project — Inventory Dashboard</h1>
        <p>Full-stack inventory management · React + Vercel Serverless · Modules 1–4</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="metrics">
        <MetricCard label="Total items"  value={total}      />
        <MetricCard label="Available"    value={available}  sub={`of ${total}`} />
        <MetricCard label="Low stock"    value={lowStock}   sub={`≤ ${LOW_STOCK_THRESHOLD} units`} />
        <MetricCard label="Out of stock" value={outOfStock} sub="qty = 0" />
        <MetricCard label="Categories"   value={categories} sub="unique" />
      </div>

      <AddItemForm onAdd={handleAdd} />

      {loading ? (
        <div className="loading">Loading inventory…</div>
      ) : (
        <InventoryTable items={inventory} onDelete={handleDelete} />
      )}

      {!loading && <CategoryChart items={inventory} />}
    </div>
  );
}
