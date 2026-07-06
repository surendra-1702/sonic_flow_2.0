require('dotenv').config();
const mongoose = require('mongoose');

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('ERROR: MONGODB_URI is not set in .env');
    process.exit(1);
  }
  await mongoose.connect(uri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log('Connected to MongoDB\n');
}

async function seed() {
  console.log('=== SonicFlow Song Sync ===\n');

  await connect();

  const { syncFromFile } = require('../src/services/syncService');
  const result = await syncFromFile();

  if (result.error) {
    console.error(`ERROR: ${result.error}`);
    process.exit(1);
  }

  if (result.skipped) {
    console.log('No changes detected — songs.url hash matches last sync.\n');
  } else {
    const s = result.summary;
    console.log('=== Sync Summary ===');
    console.log(`  Total records processed:   ${s.total}`);
    console.log(`  New songs imported:        ${s.imported}`);
    console.log(`  Existing songs updated:    ${s.updated}`);
    console.log(`  Duplicate songs skipped:   ${s.skipped}`);
    console.log(`  Invalid records skipped:   ${s.invalid}`);
    console.log(`  Artists created:           ${s.artistsCreated}`);
    console.log(`  Albums created:            ${s.albumsCreated}`);
    console.log('');
  }

  await mongoose.disconnect();
  console.log('Sync complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
