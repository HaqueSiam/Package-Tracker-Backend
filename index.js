// === File: server/index.js ===
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const packageRoutes = require('./routes/packages');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ MongoDB Connected from index.js'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

app.use('/api/packages', packageRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

