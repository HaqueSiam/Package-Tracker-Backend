// === File: server/models/Package.js ===
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  status: String,
  lat: Number,
  lon: Number,
  note: String,
  event_timestamp: Date,
  received_at: Date,
});

const PackageSchema = new mongoose.Schema({
  package_id: { type: String, unique: true, required: true },
  current_status: String,
  lat: Number,
  lon: Number,
  eta: Date,
  events: [EventSchema],
  last_updated: Date,
  is_stuck: { type: Boolean, default: false },
});

module.exports = mongoose.model('Package', PackageSchema);