let inventory = [
  { id: 1,  name: "Arduino Kit",    category: "Hardware",   quantity: 5,  status: "Available"   },
  { id: 2,  name: "Figma License",  category: "Software",   quantity: 20, status: "Available"   },
  { id: 3,  name: "USB Cable",      category: "Hardware",   quantity: 12, status: "Available"   },
  { id: 4,  name: "Raspberry Pi",   category: "Hardware",   quantity: 2,  status: "Available"   },
  { id: 5,  name: "Soldering Iron", category: "Equipment",  quantity: 3,  status: "Available"   },
  { id: 6,  name: "GitHub Pro",     category: "Software",   quantity: 8,  status: "Available"   },
  { id: 7,  name: "Breadboard",     category: "Hardware",   quantity: 15, status: "Available"   },
  { id: 8,  name: "Multimeter",     category: "Equipment",  quantity: 1,  status: "Unavailable" },
  { id: 9,  name: "Solder Wire",    category: "Consumable", quantity: 2,  status: "Available"   },
  { id: 10, name: "Notion License", category: "Software",   quantity: 0,  status: "Unavailable" },
];
let nextId = 11;

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json(inventory);
  }

  if (req.method === "POST") {
    const { name, category, quantity, status } = req.body;
    if (!name || !category || quantity === undefined || !status) {
      return res.status(400).json({ error: "All fields required: name, category, quantity, status" });
    }
    const newItem = { id: nextId++, name, category, quantity: Number(quantity), status };
    inventory.push(newItem);
    return res.status(201).json(newItem);
  }

  if (req.method === "DELETE") {
    const id = Number(req.query.id);
    inventory = inventory.filter((item) => item.id !== id);
    return res.status(200).json({ message: "Deleted" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
