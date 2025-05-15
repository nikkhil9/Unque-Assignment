const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'booked'],
    default: 'available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);