const Artist = require('../models/Artist');
const Song = require('../models/Song');
const asyncHandler = require('express-async-handler');

exports.getAll = asyncHandler(async (req, res) => {
  const artists = await Artist.find().sort({ name: 1 }).lean();
  res.json({ artists });
});

exports.getById = asyncHandler(async (req, res) => {
  const artist = await Artist.findById(req.params.id).lean();

  if (!artist) {
    return res.status(404).json({ error: 'Artist not found' });
  }

  const songs = await Song.find({ artist: artist._id })
    .populate('album', 'title coverImage')
    .sort({ plays: -1 })
    .lean();

  res.json({ artist, songs });
});
