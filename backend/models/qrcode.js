const mongoose = require('mongoose');

const QRCodeSchema = new mongoose.Schema({
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true,
  },
  qrCodeData: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('QRCode', QRCodeSchema);