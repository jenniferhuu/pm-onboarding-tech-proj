const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ── In-memory inventory store ──────────────────────────────────────────────
let inventory = [
  { id: 1,  name: "Arduino Kit",     category: "Hardware",    quantity: 5,  status: "Available"   },
  { id: 2,  name: "Figma License",   category: "Software",    quantity: 20, status: "Available"   },
  { id: 3,  name: "USB Cable",       category: "Hardware",    quantity: 12, status: "Available"   },
  { id: 4,  name: "Raspberry Pi",    category: "Hardware",    quantity: 2,  status: "Available"   },
  { id: 5,  name: "Soldering Iron",  category: "Equipment",   quantity: 3,  status: "Available"   },
  { id: 6,  name: "GitHub Pro",      category: "Software",    quantity: 8,  status: "Available"   },
  { id: 7,  name: "Breadboard",      category: "Hardware",    quantity: 15, status: "Available"   },
  { id: 8,  name: "Multimeter",      category: "Equipment",   quantity: 1,  status: "Unavailable" },
  { id: 9,  name: "Solder Wire",     category: "Consumable",  quantity: 2,  status: "Available"   },
  { id: 10, name: "Notion License",  category: "Software",    quantity: 0,  status: "Unavailable" },
];
let nextId = 11;

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /inventory — return all items
app.get("/inventory", (req, res) => {
  res.json(inventory);
});

// POST /inventory — add a new item
app.post("/inventory", (req, res) => {
  const { name, category, quantity, status } = req.body;

  if (!name || !category || quantity === undefined || !status) {
    return res.status(400).json({ error: "All fields are required: name, category, quantity, status" });
  }

  const newItem = {
    id: nextId++,
    name,
    category,
    quantity: Number(quantity),
    status,
  };

  inventory.push(newItem);
  res.status(201).json(newItem);
});

// DELETE /inventory/:id — remove an item
app.delete("/inventory/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = inventory.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Item not found" });
  }

  inventory.splice(index, 1);
  res.json({ message: "Item deleted" });
});

// PUT /inventory/:id — update an item
app.put("/inventory/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = inventory.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Item not found" });
  }

  inventory[index] = { ...inventory[index], ...req.body, id };
  res.json(inventory[index]);
});

app.listen(PORT, () => {
  console.log(`Inventory server running at http://localhost:${PORT}`);
});
