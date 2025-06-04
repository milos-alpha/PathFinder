const Building = require('../models/Building');
const QRCode = require('../models/QRCode');
const qr = require('qr-image');
const fs = require('fs');
const path = require('path');

exports.createBuilding = async (req, res) => {
  try {
    const { name, description, address, latitude, longitude } = req.body;

    const building = new Building({
      name,
      description,
      address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      createdBy: req.user.id,
    });

    await building.save();

    // Generate QR Code
    const qrData = JSON.stringify({
      buildingId: building._id,
      name: building.name,
      coordinates: building.location.coordinates,
    });

    const qrCode = qr.image(qrData, { type: 'png' });
    const qrCodePath = path.join(__dirname, '../uploads', `qr-${building._id}.png`);
    qrCode.pipe(fs.createWriteStream(qrCodePath));

    const qrCodeRecord = new QRCode({
      building: building._id,
      qrCodeData: qrData,
      imagePath: qrCodePath,
    });

    await qrCodeRecord.save();

    building.qrCode = qrCodeRecord._id;
    await building.save();

    res.status(201).json({
      building,
      qrCode: {
        data: qrData,
        imageUrl: `/uploads/qr-${building._id}.png`,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllBuildings = async (req, res) => {
  try {
    const buildings = await Building.find().populate('qrCode');
    res.json(buildings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getBuildingQRCode = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id).populate('qrCode');
    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    res.sendFile(building.qrCode.imagePath);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};