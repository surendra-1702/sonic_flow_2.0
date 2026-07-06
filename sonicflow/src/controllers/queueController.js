const Queue = require('../models/Queue');
const Song = require('../models/Song');
const asyncHandler = require('express-async-handler');

exports.getQueue = asyncHandler(async (req, res) => {
  let queue = await Queue.findOne({ user: req.user._id }).populate('songs.song').lean();

  if (!queue) {
    queue = await Queue.create({ user: req.user._id, songs: [] });
    return res.json({ success: true, queue: [] });
  }

  res.json({ success: true, queue: queue.songs });
});

exports.addToQueue = asyncHandler(async (req, res) => {
  const { songId } = req.body;

  if (!songId) {
    res.status(400);
    throw new Error('songId is required');
  }

  const song = await Song.findById(songId);
  if (!song) {
    res.status(404);
    throw new Error('Song not found');
  }

  let queue = await Queue.findOne({ user: req.user._id });
  if (!queue) {
    queue = await Queue.create({ user: req.user._id, songs: [{ song: songId }] });
  } else {
    queue.songs.push({ song: songId });
    await queue.save();
  }

  const populated = await Queue.findOne({ user: req.user._id }).populate('songs.song');
  res.status(201).json({ success: true, queue: populated.songs });
});

exports.removeFromQueue = asyncHandler(async (req, res) => {
  const { index } = req.params;

  const queue = await Queue.findOne({ user: req.user._id });
  if (!queue) {
    res.status(404);
    throw new Error('Queue not found');
  }

  const idx = parseInt(index, 10);
  if (idx < 0 || idx >= queue.songs.length) {
    res.status(400);
    throw new Error('Invalid queue index');
  }

  queue.songs.splice(idx, 1);
  await queue.save();

  const populated = await Queue.findOne({ user: req.user._id }).populate('songs.song');
  res.json({ success: true, queue: populated.songs });
});

exports.clearQueue = asyncHandler(async (req, res) => {
  await Queue.findOneAndUpdate(
    { user: req.user._id },
    { $set: { songs: [] } },
    { upsert: true }
  );
  res.json({ success: true, queue: [] });
});

exports.reorderQueue = asyncHandler(async (req, res) => {
  const { from, to } = req.body;

  if (from === undefined || to === undefined) {
    res.status(400);
    throw new Error('from and to indices are required');
  }

  const queue = await Queue.findOne({ user: req.user._id });
  if (!queue) {
    res.status(404);
    throw new Error('Queue not found');
  }

  if (from < 0 || from >= queue.songs.length || to < 0 || to >= queue.songs.length) {
    res.status(400);
    throw new Error('Invalid indices');
  }

  const [moved] = queue.songs.splice(from, 1);
  queue.songs.splice(to, 0, moved);
  await queue.save();

  const populated = await Queue.findOne({ user: req.user._id }).populate('songs.song');
  res.json({ success: true, queue: populated.songs });
});
