const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const Song = require('../models/Song');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const SyncMetadata = require('../models/SyncMetadata');

const SONGS_URL_PATH = process.env.SONGS_URL_PATH || path.join(__dirname, '../../songs.url');

function computeHash(content) {
  return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

function parseLine(line, lineNum) {
  const parts = line.split('|').map((p) => p.trim());
  if (parts.length < 7) {
    return { error: `Line ${lineNum}: expected at least 7 pipe-delimited fields, got ${parts.length}` };
  }

  const entry = {
    title: parts[0],
    artist: parts[1],
    album: parts[2],
    genre: parts[3],
    duration: parseInt(parts[4], 10),
    coverImage: parts[5],
    cloudinaryAudioUrl: parts[6],
    releaseYear: parts[7] ? parseInt(parts[7], 10) : null,
  };

  if (!entry.title) return { error: `Line ${lineNum}: title is required` };
  if (!entry.artist) return { error: `Line ${lineNum}: artist is required` };
  if (!entry.cloudinaryAudioUrl) return { error: `Line ${lineNum}: audio URL is required` };
  if (isNaN(entry.duration) || entry.duration < 1) {
    return { error: `Line ${lineNum}: duration must be a positive number, got "${parts[4]}"` };
  }

  return entry;
}

function cleanTitle(title) {
  return title.trim();
}

async function upsertArtist(name) {
  let artist = await Artist.findOne({ name });
  if (artist) return { artist, created: false };
  artist = await Artist.create({ name, image: '', genre: 'Unknown' });
  return { artist, created: true };
}

async function upsertAlbum(title, artistId, coverImage, releaseYear) {
  let album = await Album.findOne({ title, artist: artistId });
  if (album) return { album, created: false };
  album = await Album.create({
    title,
    artist: artistId,
    coverImage: coverImage || '',
    releaseYear: releaseYear || null,
  });
  return { album, created: true };
}

async function upsertSong(entry, artistId, albumId) {
  const clean = cleanTitle(entry.title);
  const existing = await Song.findOne({ title: clean, artist: artistId }).lean();

  const fields = {
    title: clean,
    artist: artistId,
    album: albumId,
    genre: entry.genre || 'Unknown',
    duration: entry.duration,
    coverImage: entry.coverImage || '',
    cloudinaryAudioUrl: entry.cloudinaryAudioUrl,
    releaseYear: entry.releaseYear || null,
  };

  if (existing) {
    const changed =
      existing.genre !== fields.genre ||
      existing.duration !== fields.duration ||
      existing.coverImage !== fields.coverImage ||
      existing.cloudinaryAudioUrl !== fields.cloudinaryAudioUrl ||
      existing.releaseYear !== fields.releaseYear ||
      (existing.album && existing.album.toString() !== albumId.toString());

    if (changed) {
      await Song.updateOne({ _id: existing._id }, { $set: fields });
      return { action: 'updated' };
    }
    return { action: 'skipped' };
  }

  await Song.create(fields);
  return { action: 'imported' };
}

async function syncFromFile() {
  if (!fs.existsSync(SONGS_URL_PATH)) {
    return { error: `songs.url not found at ${SONGS_URL_PATH}` };
  }

  const content = fs.readFileSync(SONGS_URL_PATH, 'utf8');
  const hash = computeHash(content);

  const meta = await SyncMetadata.findById('sync-state');
  if (meta && meta.fileHash === hash) {
    return { skipped: true, hash, lastSyncAt: meta.lastSyncAt, message: 'No changes detected' };
  }

  const summary = {
    total: 0,
    imported: 0,
    updated: 0,
    skipped: 0,
    invalid: 0,
    artistsCreated: 0,
    albumsCreated: 0,
    previousHash: meta ? meta.fileHash : null,
    newHash: hash,
  };

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw || raw.startsWith('#')) continue;

    summary.total++;

    const result = parseLine(raw, i + 1);
    if (result.error) {
      summary.invalid++;
      console.warn(`[sync] ${result.error}`);
      continue;
    }

    const entry = result;

    try {
      const { artist, created: artistCreated } = await upsertArtist(entry.artist);
      if (artistCreated) summary.artistsCreated++;

      const { album, created: albumCreated } = await upsertAlbum(
        entry.album, artist._id, entry.coverImage, entry.releaseYear
      );
      if (albumCreated) summary.albumsCreated++;

      const result = await upsertSong(entry, artist._id, album._id);

      if (result.action === 'imported') summary.imported++;
      else if (result.action === 'updated') summary.updated++;
      else summary.skipped++;
    } catch (err) {
      summary.invalid++;
      console.warn(`[sync] Error processing "${entry.title}": ${err.message}`);
    }
  }

  await SyncMetadata.findOneAndUpdate(
    { _id: 'sync-state' },
    {
      $set: {
        fileHash: hash,
        lastSyncAt: new Date(),
        totalSongs: summary.imported + summary.updated + summary.skipped,
      },
    },
    { upsert: true }
  );

  return { summary };
}

module.exports = { syncFromFile };
