// === File: server/routes/packages.js ===
const express = require('express');
const router = express.Router();
const Package = require('../models/Package');

// POST: Courier update existing package
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
    const allowedStatuses = ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status for courier' });
    }

    let pkg = await Package.findOne({ package_id });
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const statusOrder = [
      'CREATED',
      'PICKED_UP',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'EXCEPTION',
      'CANCELLED'
    ];

    const currentIndex = statusOrder.indexOf(pkg.current_status);
    const nextIndex = statusOrder.indexOf(status);

    if (nextIndex <= currentIndex) {
      return res.status(400).json({ error: 'Invalid status progression' });
    }

    const isDuplicate = pkg.events.some(
      (e) => new Date(e.event_timestamp).getTime() === timestamp.getTime() && e.status === status
    );

    if (!isDuplicate) pkg.events.push(event);

    pkg.current_status = status;
    pkg.lat = lat;
    pkg.lon = lon;
    pkg.eta = eta ? new Date(eta) : pkg.eta;
    pkg.last_updated = timestamp;

    await pkg.save();
    res.status(200).json({ message: 'Update successful' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// POST: Dispatcher creates new package
router.post('/create', async (req, res) => {
  const { package_id, lat, lon, eta, secret } = req.body;

  if (!package_id || !secret) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (secret !== process.env.SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid secret' });
  }

  try {
    const exists = await Package.findOne({
      package_id,
      current_status: { $in: ['CREATED', 'DELIVERED', 'CANCELLED'] }
    });
    if (exists) {
      return res.status(400).json({ error: 'Package with this ID already exists' });
    }

    const timestamp = new Date();
    const event = {
      status: 'CREATED',
      lat,
      lon,
      note: 'Package created',
      event_timestamp: timestamp,
      received_at: new Date(),
    };

    const newPkg = new Package({
      package_id,
      current_status: 'CREATED',
      lat,
      lon,
      eta: eta ? new Date(eta) : null,
      events: [event],
      last_updated: timestamp,
    });

    await newPkg.save();
    res.status(201).json({ message: 'Package created successfully' });
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: All packages from last 24 hours
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