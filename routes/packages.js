// === File: server/routes/packages.js ===
const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
// const dotenv = require('dotenv');
// dotenv.config();

// POST: Ingest courier update
router.post('/update', async (req, res) => {
  const { package_id, status, lat, lon, note, eta, secret } = req.body;

  if (!package_id || !status || !secret) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (secret !== process.env.SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid secret' });
  }

  const timestamp = new Date();
  const event = {
    status,
    lat,
    lon,
    note,
    event_timestamp: timestamp,
    received_at: new Date(),
  };

  try {
    let pkg = await Package.findOne({ package_id });

    if (!pkg) {
      pkg = new Package({
        package_id,
        current_status: status,
        lat,
        lon,
        eta: eta ? new Date(eta) : null,
        events: [event],
        last_updated: timestamp,
      });
    } else {
      const isDuplicate = pkg.events.some(
        (e) => new Date(e.event_timestamp).getTime() === timestamp.getTime() && e.status === status
      );
      if (!isDuplicate) pkg.events.push(event);
      if (timestamp > new Date(pkg.last_updated)) {
        pkg.current_status = status;
        pkg.lat = lat;
        pkg.lon = lon;
        pkg.eta = eta ? new Date(eta) : pkg.eta;
        pkg.last_updated = timestamp;
      }
    }

    await pkg.save();
    res.status(200).json({ message: 'Update successful' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const packages = await Package.find({
      last_updated: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pkg = await Package.findOne({ package_id: req.params.id });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch package' });
  }
});

module.exports = router;