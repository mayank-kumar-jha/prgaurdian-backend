const mongoose = require('mongoose');

/**
 * GlobalSettings — singleton document (only one ever exists).
 * Stores app-wide defaults applied to all repos unless overridden.
 */
const GlobalSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },  // fixed ID so there is only one document
  defaultStrictness: {
    type: String,
    enum: ['lenient', 'balanced', 'strict'],
    default: 'balanced',
  },
  autoApproveTrivial: { type: Boolean, default: false },
  globalCustomRules:  { type: String,  default: '' },
  notifyOnBlock:      { type: Boolean, default: true },
  notifyOnApprove:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('GlobalSettings', GlobalSettingsSchema);
