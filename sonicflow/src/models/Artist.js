const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    image: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    genre: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
  },
  { timestamps: true }
);

artistSchema.virtual('songCount', {
  ref: 'Song',
  localField: '_id',
  foreignField: 'artist',
  count: true,
});

artistSchema.set('toJSON', { virtuals: true });
artistSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Artist', artistSchema);
