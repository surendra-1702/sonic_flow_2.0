const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
      index: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: true,
      index: true,
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
      required: true,
      index: true,
    },
    genre: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 second'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    cloudinaryAudioUrl: {
      type: String,
      required: [true, 'Audio URL is required'],
    },
    releaseYear: {
      type: Number,
    },
    plays: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

songSchema.index({ title: 'text', genre: 'text' });
songSchema.index({ title: 1, artist: 1 });

module.exports = mongoose.model('Song', songSchema);
