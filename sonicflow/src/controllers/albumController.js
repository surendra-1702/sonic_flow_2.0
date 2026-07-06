const Album = require('../models/Album');
const Song = require('../models/Song');
const asyncHandler = require('express-async-handler');

exports.getAll = asyncHandler(async (req, res) => {
  const albums = await Album.find()
    .populate('artist', 'name image')
    .sort({ releaseYear: -1 })
    .lean();

  res.json({ albums });
});

exports.getById = asyncHandler(async (req, res) => {
  const album = await Album.findById(req.params.id).populate('artist', 'name image').lean();

  if (!album) {
    return res.status(404).json({ error: 'Album not found' });
  }

  const songs = await Song.find({ album: album._id })
    .populate('artist', 'name image')
    .sort({ createdAt: 1 })
    .lean();

  res.json({ album, songs });
});
