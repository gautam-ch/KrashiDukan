# KrashiDukan

**KrashiDukan** is a web app for an Agricultural Supply Store, built to help shop owners manage their shop inventory and daily sales workflow.

It provides a simple interface to:
- set up a shop,
- manage products and stock,
- take customer orders,
- view sales/analytics insights.

---

## What it does (High-level)

### Authentication & access
- Shop owners can create an account and sign in.
- Session-based authentication is used so users stay logged in securely.

### Shop setup
- Create your shop profile
- Add additional owners (so multiple people can manage the same shop)

### Product & inventory management
- Add products with pricing and quantity
- Update product details and stock
- Remove products when needed
- View expired products separately
- Export product lists (for reporting/record keeping)

### Orders / billing workflow
- Search products and add items to a cart
- Create customer orders with basic customer details
- View past orders (order history)

### Analytics
- View sales analytics to understand performance over time

---

## Tech (brief)
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB

---

## Repository Structure
- `frontend/` — React (Vite) client
- `backend/` — Express API + MongoDB

---

## Run locally (quick)

### Backend
```bash
cd backend
npm install
node src/server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Deployment
The project includes deployment config for Vercel (frontend and backend).
