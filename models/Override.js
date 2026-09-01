const mongoose = require('mongoose');

const OverrideSchema = new mongoose.Schema({
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: true,
    },
    humanVerdict: {
        type: String,
        enum: ['approve', 'comment', 'request_changes'],
        required: true,
    },
    agreedWithAI: {
        type: Boolean,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Override', OverrideSchema);
