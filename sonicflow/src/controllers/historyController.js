const ListeningHistory = require('../models/ListeningHistory');
const asyncHandler = require('express-async-handler');

exports.addHistory = asyncHandler(async (req, res) => {
  const { songId } = req.body;

  if (!songId) {
    res.status(400);
    throw new Error('songId is required');
  }

  const entry = await ListeningHistory.create({
    user: req.user._id,
    song: songId,
  });

  const MAX_HISTORY = 200;
  const count = await ListeningHistory.countDocuments({ user: req.user._id });
  if (count > MAX_HISTORY) {
    const excess = count - MAX_HISTORY;
    const oldest = await ListeningHistory.find({ user: req.user._id })
      .sort({ playedAt: 1 })
      .limit(excess)
      .select('_id');
    const ids = oldest.map((o) => o._id);
    await ListeningHistory.deleteMany({ _id: { $in: ids } });
  }

  res.status(201).json({ success: true, data: entry });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const history = await ListeningHistory.find({ user: req.user._id })
    .sort({ playedAt: -1 })
    .limit(50)
    .populate({
      path: 'song',
      populate: { path: 'artist', select: 'name' },
    })
    .lean();

  res.json({ success: true, history });
});
