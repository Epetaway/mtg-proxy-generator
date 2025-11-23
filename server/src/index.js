require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./db');
const { syncScryfallCards } = require('./scryfallSync');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'TCG Portfolio API running.' });
});

// Basic catalog endpoints
app.get('/api/sets', (req, res) => {
  db.all(`SELECT code, name, released_at FROM sets ORDER BY date(released_at) DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/cards', (req, res) => {
  const { name = '', set = '', limit = 50 } = req.query;
  const q = `%${name}%`;
  const sql = `SELECT id, name, set_code, collector_number, rarity, lang, image_uri
               FROM cards
               WHERE name LIKE ? AND (? = '' OR set_code = ?)
               ORDER BY name LIMIT ?`;
  db.all(sql, [q, set, set, Number(limit)], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Manual sync trigger
app.post('/api/sync/scryfall', async (req, res) => {
  try {
    const result = await syncScryfallCards();
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Kick off sync on startup and schedule daily at 05:00 UTC
(async () => {
  try {
    const result = await syncScryfallCards();
    console.log('Scryfall sync on startup:', result);
  } catch (e) {
    console.error('Startup sync failed:', e.message);
  }
})();

cron.schedule('0 5 * * *', async () => {
  try {
    const result = await syncScryfallCards();
    console.log('Scryfall sync via cron:', result);
  } catch (e) {
    console.error('Cron sync failed:', e.message);
  }
}, { timezone: 'UTC' });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
