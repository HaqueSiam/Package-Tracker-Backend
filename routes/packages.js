const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const auth = require('../middleware/auth');

// POST: Courier Update (Protected)
router.post('/update', auth, async (req, res) => {
  const { package_id, status, lat, lon, timestamp, note, eta } = req.body;

  if (!package_id || !status || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const parsedTimestamp = new Date(timestamp);
  const event = {
    status,
    lat,
    lon,
    note,
    event_timestamp: parsedTimestamp,
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
        last_updated: parsedTimestamp,
      });
    } else {
      const isDuplicate = pkg.events.some(
        e => new Date(e.event_timestamp).getTime() === parsedTimestamp.getTime() && e.status === status
      );

      if (!isDuplicate) pkg.events.push(event);

      if (parsedTimestamp > new Date(pkg.last_updated)) {
        pkg.current_status = status;
        pkg.lat = lat;
        pkg.lon = lon;
        pkg.eta = eta ? new Date(eta) : pkg.eta;
        pkg.last_updated = parsedTimestamp;
      }
    }

    // Alert if stuck
    const minutesSinceUpdate = (Date.now() - new Date(pkg.last_updated).getTime()) / 60000;
    if (minutesSinceUpdate > 30 && !pkg.alerts.some(a => a.message.includes('stuck'))) {
      pkg.is_stuck = true;
      pkg.alerts.push({
        package_id,
        triggered_at: new Date(),
        message: `Package ${package_id} might be stuck (no update for >30 mins)`,
      });
    }

    await pkg.save();
    res.status(200).json({ message: 'Update successful' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: Packages
router.get('/', async (req, res) => {
  const recent = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const packages = await Package.find({ last_updated: { $gte: recent } });
  res.json(packages);
});

// GET: Package Detail
router.get('/:id', async (req, res) => {
  const pkg = await Package.findOne({ package_id: req.params.id });
  if (!pkg) return res.status(404).json({ error: 'Not found' });
  res.json(pkg);
});

module.exports = router;
