# System Restart & Resume Guide

This repository has been cleanly committed on branch `feat/research-protocol-admin`.
All modified files, newly registered admin routes, bundle disaggregation logic, and storefront features are saved and ready.

---

## 1. Quick Start After Reboot

From the project root (`/Users/m5/Projects/serverless-commerce-compound-family`):

### Step 1: Ensure PostgreSQL is Running
```bash
pg_isready
# If not accepting connections:
brew services start postgresql@16
```
* **Database Name:** `pepstack_phase4_test_20260825`
* **Local Connection String:** `postgresql://localhost/pepstack_phase4_test_20260825`

### Step 2: Start Services

**Option A: Start Both Backend and Storefront via Turbo (Recommended)**
```bash
npm run dev
```

**Option B: Start Individually in Separate Terminal Tabs**
* **Terminal 1 (Medusa Backend):**
  ```bash
  npm run backend:dev
  ```
  * Running on: `http://localhost:9000`
  * Medusa Admin URL: `http://localhost:9000/app`

* **Terminal 2 (Next.js Storefront):**
  ```bash
  npm run storefront:dev
  ```
  * Running on: `http://localhost:8000`
  * Storefront URL: `http://localhost:8000/ph`

---

## 2. Admin & Storefront Credentials

* **Medusa Admin Email:** `jerwinmancenido@gmail.com` (or `jerwinmancenido@icloud.com`)
* **Password:** `supersecret`

---

## 3. Key URLs & Active Features

| Destination | URL | Description |
| :--- | :--- | :--- |
| **Founder Command Center** | `http://localhost:9000/app/dashboard` | Modernized KPI rail, emerald sales chart, orders feed |
| **Research Bundles Admin** | `http://localhost:9000/app/bundles` | 5 Multi-compound synergy stacks with constituent breakdowns |
| **Manual Payment Proofs** | `http://localhost:9000/app/manual-payment-proofs` | Proof audit queue with mobile zoom receipt inspector |
| **Storefront Catalog** | `http://localhost:8000/ph/store` | Unified 27 research compounds catalog |
| **Multi-Compound Bundles** | `http://localhost:8000/ph/categories/multi-compound-research-bundles` | Curated multi-vial synergy stacks |
| **Clinical Research Hub** | `http://localhost:8000/ph/account/research-tracking` | Adherence heatmap, routines, protocols, journal |

---

## 4. Git State

* **Branch:** `feat/research-protocol-admin`
* **Status:** Clean working tree (all changes committed).
* **Package Manager:** `npm` (`npm@11.5.2`)
