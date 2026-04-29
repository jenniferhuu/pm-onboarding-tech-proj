# Open Project — Inventory Dashboard

Full-stack inventory dashboard deployed entirely on Vercel (no separate backend needed).

## Project structure

```
inventory-vercel/
├── api/
│   └── inventory.js   ← serverless function (replaces Express backend)
├── src/
│   ├── App.js
│   ├── index.js
│   └── index.css
├── public/
│   └── index.html
├── package.json
└── vercel.json
```

## Deploy to Vercel (step by step)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/inventory-dashboard.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Leave all settings as default (Vercel auto-detects React)
4. Click **Deploy**

That's it — frontend and backend deploy together. No environment variables needed.

## Run locally

```bash
npm install
npm start   # React dev server on localhost:3000
```

> Note: the `/api/inventory` serverless function only runs on Vercel.
> For local testing of the API, install the Vercel CLI:
> `npm i -g vercel && vercel dev`

## Live URL

_Add your Vercel URL here after deploying_
