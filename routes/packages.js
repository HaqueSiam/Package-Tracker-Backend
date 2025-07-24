const express = require('express');
const router = express.Router();
const Package = require('../models/Package');

// POST: Ingest courier update
router.post('/update', async (req, res) => {
  const { package_id, status, lat, lon, timestamp, note, eta } = req.body;

  if (!package_id || !status || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const event = {
    status,
    lat,
    lon,
    note,
    event_timestamp: new Date(timestamp),
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
        last_updated: new Date(timestamp),
      });
    } else {
      if (new Date(timestamp) > new Date(pkg.last_updated)) {
        pkg.current_status = status;
        pkg.lat = lat;
        pkg.lon = lon;
        pkg.eta = eta ? new Date(eta) : pkg.eta;
        pkg.last_updated = new Date(timestamp);
      }
      pkg.events.push(event);
    }

    await pkg.save();
    res.status(200).json({ message: 'Update successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: All active packages
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

// GET: Package detail
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
