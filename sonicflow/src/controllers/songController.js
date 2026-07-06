const Song = require('../models/Song');
const Artist = require('../models/Artist');
const Album = require('../models/Album');
const asyncHandler = require('express-async-handler');

const POPULATE_ARTIST = { path: 'artist', select: 'name image' };
const POPULATE_ALBUM = { path: 'album', select: 'title coverImage' };

exports.getAll = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [songs, total] = await Promise.all([
    Song.find()
      .populate(POPULATE_ARTIST)
      .populate(POPULATE_ALBUM)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Song.countDocuments(),
  ]);

  res.json({ songs, total, page, pages: Math.ceil(total / limit) });
});

exports.getById = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id)
    .populate('artist', 'name image bio')
    .populate('album', 'title coverImage releaseYear')
    .lean();

  if (!song) {
    return res.status(404).json({ error: 'Song not found' });
  }

  res.json({ song });
});

exports.search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();

  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [songs, artists, albums] = await Promise.all([
    Song.find({ title: regex })
      .populate(POPULATE_ARTIST)
      .populate(POPULATE_ALBUM)
      .limit(20)
      .lean(),
    Artist.find({ name: regex }).limit(10).lean(),
    Album.find({ title: regex })
      .populate('artist', 'name image')
      .limit(10)
      .lean(),
  ]);

  let artistSongs = [];
  if (artists.length > 0) {
    const artistIds = artists.map(a => a._id);
    artistSongs = await Song.find({ artist: { $in: artistIds } })
      .populate(POPULATE_ARTIST)
      .populate(POPULATE_ALBUM)
      .limit(50)
      .lean();
  }

  res.json({ songs, artists, albums, artistSongs });
});

exports.getTrending = asyncHandler(async (req, res) => {
  const songs = await Song.find()
    .populate(POPULATE_ARTIST)
    .populate(POPULATE_ALBUM)
    .sort({ plays: -1, createdAt: -1 })
    .limit(12)
    .lean();

  res.json({ songs });
});

exports.getRecentlyAdded = asyncHandler(async (req, res) => {
  const songs = await Song.find()
    .populate(POPULATE_ARTIST)
    .populate(POPULATE_ALBUM)
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

  res.json({ songs });
});

exports.syncSongs = asyncHandler(async (req, res) => {
  const { syncFromFile } = require('../services/syncService');
  const result = await syncFromFile();
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  res.json(result);
});
