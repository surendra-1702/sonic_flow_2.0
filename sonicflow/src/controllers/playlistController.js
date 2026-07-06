const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const asyncHandler = require('express-async-handler');

exports.create = asyncHandler(async (req, res) => {
  const { name, isPublic } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Playlist name is required' });
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    user: req.user._id,
    isPublic: isPublic || false,
  });

  res.status(201).json({ playlist });
});

exports.getAll = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ user: req.user._id })
    .populate('songs', 'title duration coverImage')
    .sort({ updatedAt: -1 })
    .lean();

  res.json({ playlists });
});

exports.getById = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate({
    path: 'songs',
    populate: { path: 'artist', select: 'name image' },
  }).lean();

  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  res.json({ playlist });
});

exports.update = asyncHandler(async (req, res) => {
  const { name, isPublic } = req.body;

  const playlist = await Playlist.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { ...(name && { name: name.trim() }), ...(isPublic !== undefined && { isPublic }) } },
    { new: true }
  );

  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  res.json({ playlist });
});

exports.remove = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  res.json({ message: 'Playlist deleted' });
});

exports.addSong = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const playlist = await Playlist.findOne({ _id: id, user: req.user._id });
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  const song = await Song.findById(req.body.songId).lean();
  if (!song) {
    return res.status(404).json({ error: 'Song not found' });
  }

  const alreadyIn = playlist.songs.some((s) => s.toString() === req.body.songId);
  if (alreadyIn) {
    return res.status(400).json({ error: 'Song already in playlist' });
  }

  playlist.songs.push(song._id);
  await playlist.save();

  res.json({ playlist });
});

exports.removeSong = asyncHandler(async (req, res) => {
  const { id, songId } = req.params;

  const playlist = await Playlist.findOne({ _id: id, user: req.user._id });
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  playlist.songs.pull(songId);
  await playlist.save();

  res.json({ playlist });
});
