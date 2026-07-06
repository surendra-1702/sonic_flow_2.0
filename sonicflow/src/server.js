require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`ERROR: ${key} is not set in environment variables`);
    process.exit(1);
  }
}

async function start() {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');

    if (process.env.NODE_ENV !== 'production') {
      const { syncFromFile } = require('./services/syncService');
      const result = await syncFromFile();
      if (result.summary) {
        const s = result.summary;
        console.log(`[sync] ${s.total} records | ${s.imported} new | ${s.updated} updated | ${s.skipped} skipped | ${s.invalid} invalid`);
      } else if (result.skipped) {
        console.log(`[sync] No changes detected (last sync: ${result.lastSyncAt})`);
      }
    }

    app.listen(PORT, () => {
      console.log(`SonicFlow running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
