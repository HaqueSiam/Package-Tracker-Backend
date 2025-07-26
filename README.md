
---

## 📌 Key Features

### ✅ Secure Dispatcher Package Creation
- Endpoint: `POST /api/packages/create`
- Dispatcher can create a new package by providing:
  - Unique `package_id`
  - Latitude & Longitude of origin
  - Optional ETA & Note
  - **Secret Key** for authentication
- Prevents duplicate creation if a package with the same ID already exists in status: `CREATED`, `DELIVERED`, or `CANCELLED`.

### 🔄 Secure Courier Status Updates
- Endpoint: `POST /api/packages/update`
- Couriers can update status only if:
  - Provided secret key matches backend `.env` key
  - Package ID matches exactly (case-sensitive)
  - Status follows strict valid transitions:
    - `PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED`
    - `EXCEPTION` and `CANCELLED` may switch freely
- Auto-generates `timestamp` at server-side.
- Validates and rejects out-of-order or duplicate events.
- Updates `current_status`, `lat`, `lon`, and `last_updated` based on the latest event.

### 🧠 Idempotency & Out-of-Order Handling
- Event is de-duplicated using `timestamp + status`.
- Out-of-order events are appended to history but **do not overwrite** the current status if timestamp is older.

### 📦 Full Package History & Live Status
- Each package stores a timeline (`events[]`) of all status updates.
- Latest status info is always stored at the root level (`current_status`, `last_updated`, `lat`, `lon`, etc.).

### ⚠️ Stuck Detection (for Frontend)
- `last_updated` is used on frontend to detect "stuck" packages (inactive for 30+ minutes).
- No backend cron job is needed — detection is client-driven.

### 🔐 Environment Variables (`.env`)
- `PORT`: server port (default 5000)
- `MONGO_URI`: connection string for MongoDB
- `SECRET_KEY`: used to validate access to protected routes


---


## 🧪 Project Structure
```
SERVER/
├── index.js
├── models/
│ └── Package.js
├── routes/
│ └── packages.js
├── .env
└── package.json

```


---

## ⚙️ How to Run Backend Locally

### 1. Clone the Repository

```bash
git clone https://github.com/HaqueSiam/Package-Tracker-Backend.git
cd Package-Tracker-Frontend
```
### 2. Install dependencies

```bash
npm install
```

### 3. Set Up .env File

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/courier-tracker
SECRET_KEY=mysecret

```


### 4. Start the Frontend

```
npm run dev
```

## API Endpoints

POST /api/packages/create-
Dispatcher creates a new package
Required: package_id, lat, lon, secret

POST /api/packages/update-
Courier updates status
Required: package_id, status, lat, lon, secret

GET /api/packages-
Fetch all packages updated in last 24h

GET /api/packages/:id-
Fetch full history of a package
