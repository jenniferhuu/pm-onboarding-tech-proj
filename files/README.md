# Open Project — Inventory Management Dashboard

Full-stack inventory dashboard built for the OP PM onboarding workshop.
Covers Modules 1–5: React frontend, Node/Express backend, and Python data science/ML layer.

---

## Project structure

```
inventory-project/
├── backend/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   └── package.json
└── data-science/
    └── analysis.py
```

---

## Quick start

### 1. Backend (Node + Express)

```bash
cd backend
npm install
npm start
# → runs on http://localhost:3001
```

**Endpoints:**
- `GET  /inventory`     — returns all inventory items
- `POST /inventory`     — adds a new item `{ name, category, quantity, status }`
- `PUT  /inventory/:id` — updates an item
- `DELETE /inventory/:id` — removes an item

---

### 2. Frontend (React)

```bash
cd frontend
npm install
npm start
# → runs on http://localhost:3000
```

The frontend fetches from `http://localhost:3001` by default.
To point it at a deployed backend, set:

```bash
REACT_APP_API_URL=https://your-backend.onrender.com npm start
```

---

### 3. Data science layer (Python)

```bash
cd data-science
pip install pandas matplotlib requests
python analysis.py
```

This script:
- Summarises inventory with Pandas (total items, by category, low/out-of-stock)
- Applies the confidence threshold policy (Module 2)
- Runs reconciliation between ML predictions and the inventory DB (Module 3)
- Writes `audit_log.jsonl`
- Generates `inventory_analysis.png` (3-panel chart)

---

## Deployment

### Backend → Render

1. Push `backend/` to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Copy the public URL (e.g. `https://inventory-api-xxxx.onrender.com`)

### Frontend → Vercel / Netlify / GitHub Pages

```bash
cd frontend
REACT_APP_API_URL=https://your-backend.onrender.com npm run build
# deploy the build/ folder
```

---

## Live URLs

| Service  | URL |
|----------|-----|
| Frontend | _add after deploy_ |
| Backend  | _add after deploy_ |
