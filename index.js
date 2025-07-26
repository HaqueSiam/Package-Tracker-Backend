// === File: server/index.js ===
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const packageRoutes = require('./routes/packages');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log('✅ MongoDB Connected'))
//   .catch((err) => console.error('❌ MongoDB Error:', err));

// app.use('/api/packages', packageRoutes);

// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
//upre ager code

// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const packageRoutes = require('./routes/packages');
// require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

app.use('/api/packages', packageRoutes);

module.exports = app; // ✅ just export the app

