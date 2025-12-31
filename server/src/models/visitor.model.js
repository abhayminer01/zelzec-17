const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  date: {
    type: String, // Format: YYYY-MM-DD for easy aggregation
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique visit per IP per day
visitorSchema.index({ ip: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Visitor', visitorSchema);