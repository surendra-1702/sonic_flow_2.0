const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Album title is required'],
      trim: true,
      index: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    releaseYear: {
      type: Number,
    },
    songCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

albumSchema.index({ title: 1, artist: 1 }, { unique: true });

module.exports = mongoose.model('Album', albumSchema);
