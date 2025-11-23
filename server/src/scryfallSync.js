const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const db = require('./db');

async function getBulkDefaultCardsUrl() {
  const res = await fetch('https://api.scryfall.com/bulk-data');
  if (!res.ok) throw new Error('Failed to fetch Scryfall bulk-data index');
  const data = await res.json();
  const def = data.data.find((d) => d.type === 'default_cards');
  if (!def) throw new Error('Scryfall default_cards bulk not found');
  return { download_uri: def.download_uri, updated_at: def.updated_at };
}

function setSyncState(key, value) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO sync_state(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
      [key, value],
      (err) => (err ? reject(err) : resolve())
    );
  });
}

function getSyncState(key) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT value FROM sync_state WHERE key=?`, [key], (err, row) => {
      if (err) return reject(err);
      resolve(row?.value || null);
    });
  });
}

async function syncScryfallCards() {
  const { download_uri, updated_at } = await getBulkDefaultCardsUrl();
  const lastUpdated = await getSyncState('scryfall_default_updated_at');
  if (lastUpdated && lastUpdated === updated_at) {
    return { skipped: true, reason: 'Up to date' };
  }

  const res = await fetch(download_uri);
  if (!res.ok) throw new Error('Failed to download Scryfall default_cards');
  const cards = await res.json();

  await new Promise((resolve, reject) => db.run('BEGIN', (e) => (e ? reject(e) : resolve())));
  try {
    // Build set cache
    const setMap = new Map();
    for (const c of cards) {
      const setId = c.set_id;
      if (!setMap.has(setId)) {
        setMap.set(setId, { id: c.set_id, code: c.set, name: c.set_name, released_at: c.released_at });
      }
    }
    await new Promise((resolve, reject) => {
      const stmt = db.prepare(`INSERT INTO sets(id, code, name, released_at) VALUES(?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET code=excluded.code, name=excluded.name, released_at=excluded.released_at`);
      for (const s of setMap.values()) {
        stmt.run([s.id, s.code, s.name, s.released_at]);
      }
      stmt.finalize((err) => (err ? reject(err) : resolve()));
    });

    await new Promise((resolve, reject) => {
      const stmt = db.prepare(`INSERT INTO cards(id, name, set_id, set_code, collector_number, rarity, lang, image_uri)
        VALUES(?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, set_id=excluded.set_id, set_code=excluded.set_code,
          collector_number=excluded.collector_number, rarity=excluded.rarity, lang=excluded.lang, image_uri=excluded.image_uri`);
      for (const c of cards) {
        const image = c.image_uris?.normal || c.image_uris?.small || '';
        stmt.run([
          c.id,
          c.name,
          c.set_id,
          c.set,
          c.collector_number,
          c.rarity,
          c.lang || 'en',
          image,
        ]);
      }
      stmt.finalize((err) => (err ? reject(err) : resolve()));
    });

    await setSyncState('scryfall_default_updated_at', updated_at);
    await new Promise((resolve, reject) => db.run('COMMIT', (e) => (e ? reject(e) : resolve())));
    return { skipped: false, updated_at };
  } catch (e) {
    await new Promise((resolve) => db.run('ROLLBACK', () => resolve()));
    throw e;
  }
}

module.exports = { syncScryfallCards };
