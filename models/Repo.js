const mongoose = require('mongoose');

const RepoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // e.g. "user/repo"
    },
    owner: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    lastReviewed: {
        type: Date,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    strictness: {
        type: String,
        enum: ['lenient', 'balanced', 'strict'],
        default: 'balanced',
    },
    autoApproveTrivial: {
        type: Boolean,
        default: false,
    },
    customRules: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('Repo', RepoSchema);
