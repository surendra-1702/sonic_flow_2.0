const mongoose = require('mongoose');

const queueItemSchema = new mongoose.Schema({
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const queueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    songs: [queueItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Queue', queueSchema);
