# HarvestFresh — Organic Produce Delivery Platform

**Stack:** React (Vite + Tailwind CSS) · Python FastAPI · MongoDB (Motor + Beanie ODM)  
**Design System:** Terra & Vine (Forest Green `#163821`, Sage `#4a6549`, Carrot Orange `#4e2700`/`#ffa04c`, Surface `#fafaf5`)

---

## 🌟 Overview & Key Features

HarvestFresh is a full-stack, farm-to-table organic produce delivery platform that connects conscious urban consumers directly with local certified organic growers.

- **Design System ("Terra & Vine"):** Strict implementation of typography (`Hanken Grotesk` & `Plus Jakarta Sans`), 8px/24px rounded scales, organic leaf bullet lists, and "Sun-Kissed" warm hover shadows.
- **Specialty Components:** Interactive Freshness Gauge, Delivery Slot Picker, 60-Minute Pincode Serviceability Checker, and Quantity Stepper.
- **Phone OTP Authentication:** Fast, passwordless auth with JWT access tokens and role-based access (`customer` & `admin`).
- **Subscription Management:** Monthly & weekly pass subscriptions with automated background recurring order generation powered by APScheduler.
- **Extensible Payments:** Abstract `PaymentGateway` architecture with working Cash on Delivery (COD) and stub gateway ready for Razorpay/Stripe drop-in.
- **Admin Console (`/admin`):** Real-time sales analytics, product inventory CRUD, low-stock alerts, customer order status pipeline, and subscription oversight.

---

## 📁 Directory Structure

```
harvestfresh/
├── frontend/                  # React Vite App
│   ├── src/
│   │   ├── components/        # Navbar, Footer, ProductCard, Chip, FreshnessGauge, QuantityStepper, PincodeChecker, Toast
│   │   ├── pages/              # Home, Shop, ProductDetail, MonthlyPass, Login, Cart, Checkout, OrderConfirmation, OrderHistory, Account, SubscriptionManagement, DeliveryCoverage, Admin/*
│   │   ├── layouts/             # CustomerLayout, AdminLayout
│   │   ├── services/               # Axios API client (api.js)
│   │   ├── store/                 # Zustand store (useStore.js)
│   │   ├── styles/                  # Tailwind config & Terra & Vine CSS
│   │   └── App.jsx / main.jsx
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                    # FastAPI App
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint
│   │   ├── core/               # Security (JWT, OTP hash), Config
│   │   ├── db/                 # MongoDB connection & Seed script
│   │   ├── models/             # Beanie Document models (User, Product, Order, Subscription...)
│   │   ├── schemas/            # Pydantic v2 schemas
│   │   ├── routers/            # Auth, Products, Categories, Cart, DeliveryZones, Orders, Subscriptions, Payments, Admin
│   │   ├── services/           # Subscription order generator
│   │   └── tasks/              # APScheduler background runner
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

---

## 🚀 Setup & Launch Instructions

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- MongoDB Server running at `mongodb://localhost:27017`

### 1. Backend Setup (FastAPI)
```bash
cd harvestfresh/backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*API interactive documentation will be available at `http://localhost:8000/docs`.*

### 2. Frontend Setup (React Vite)
```bash
cd harvestfresh/frontend
npm install
npm run dev
```
*Frontend application will run locally at `http://localhost:3000`.*

---

## 🔑 Demo & Admin Credentials

- **Customer Login:** Enter any 10-digit mobile number (e.g. `9876543210`). The debug OTP will be displayed on screen in dev mode.
- **Admin Access:** Enter phone number ending in `9999` or `9999999999` (e.g. `9999999999`). Verify OTP to access the `/admin` console.
