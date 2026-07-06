const mongoose = require('mongoose');

const syncMetaSchema = new mongoose.Schema({
  _id: { type: String, default: 'sync-state' },
  fileHash: { type: String, default: '' },
  lastSyncAt: { type: Date },
  totalSongs: { type: Number, default: 0 },
}, { _id: false });

module.exports = mongoose.model('SyncMetadata', syncMetaSchema);
