const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    file: String,
    line: Number,
    body: String,
    category: {
        type: String,
        enum: ['security', 'bug', 'performance', 'style', 'test-coverage'],
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
    },
}, { _id: false });

const ReviewSchema = new mongoose.Schema({
    repoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repo',
        required: true,
    },
    repo: {
        type: String,
        required: true, // denormalized for easy queries
    },
    prNumber: {
        type: Number,
        required: true,
    },
    prTitle: {
        type: String,
    },
    verdict: {
        type: String,
        enum: ['approve', 'comment', 'request_changes'],
        required: true,
    },
    reviewedAt: {
        type: Date,
        default: Date.now,
    },
    githubPrUrl: {
        type: String,
    },
    summary: {
        type: String,
    },
    tokensUsed: {
        type: Number,
        default: 0,
    },
    costEstimate: {
        type: Number,
        default: 0,
    },
    comments: [CommentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
