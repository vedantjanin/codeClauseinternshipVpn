const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  connectionTime: {
    type: Date,
    default: Date.now
  },
  dataTransferred: {
    type: Number, // stored in KB
    default: 0
  }
});

module.exports = mongoose.model('Session', sessionSchema);
