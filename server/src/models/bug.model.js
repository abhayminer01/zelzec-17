const mongoose = require('mongoose');

const bugReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Fixed'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BugReport', bugReportSchema);
