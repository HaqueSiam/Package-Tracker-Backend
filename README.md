
---

### ✅ `SERVER/README.md` (Backend)

```markdown
# 🛠️ Aamira Package Tracker – Backend

This is the **backend** for the Aamira Package Tracker system built with **Node.js**, **Express**, and **MongoDB**. It provides APIs to:

- Create new packages (Dispatcher)
- Update existing packages (Courier)
- Retrieve package data and history
- Enforce status order rules
- Alert if a package hasn't been updated in 30+ mins

---

## 🚀 How to Run

1. Clone the Repository
```bash
git clone https://github.com/HaqueSiam/Package-Tracker-Backend.git
cd server

2. Install Dependencies
npm install

3. Set Up .env File
PORT=5000
MONGO_URI=< Your mongo uri >
SECRET_KEY=mysecret

4. Start the Server
npm run dev
