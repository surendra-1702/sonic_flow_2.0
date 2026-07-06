const Favorite = require('../models/Favorite');
const Song = require('../models/Song');
const asyncHandler = require('express-async-handler');

exports.getAll = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .populate({
      path: 'song',
      populate: { path: 'artist', select: 'name image' },
    })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ favorites });
});

exports.add = asyncHandler(async (req, res) => {
  const { songId } = req.params;

  const song = await Song.findById(songId).lean();
  if (!song) {
    return res.status(404).json({ error: 'Song not found' });
  }

  const existing = await Favorite.findOne({ user: req.user._id, song: songId }).lean();
  if (existing) {
    return res.status(400).json({ error: 'Song already in favorites' });
  }

  const favorite = await Favorite.create({ user: req.user._id, song: songId });

  res.status(201).json({ favorite });
});

exports.remove = asyncHandler(async (req, res) => {
  const { songId } = req.params;

  const favorite = await Favorite.findOneAndDelete({
    user: req.user._id,
    song: songId,
  });

  if (!favorite) {
    return res.status(404).json({ error: 'Favorite not found' });
  }

  res.json({ message: 'Removed from favorites' });
});
