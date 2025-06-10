const Building = require('../models/Building');

exports.searchBuildings = async (req, res) => {
  try {
    const { query } = req.query;
    
    const buildings = await Building.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } },
      ],
    });

    res.json(buildings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getBuildingDirections = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Current location coordinates are required' });
    }

    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    // Convert coordinates to numbers
    const currentLat = parseFloat(latitude);
    const currentLng = parseFloat(longitude);
    const destLat = building.location.coordinates[1];
    const destLng = building.location.coordinates[0];

    // Calculate distance (Haversine formula)
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(destLat - currentLat);
    const dLng = toRad(destLng - currentLng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(currentLat)) * 
      Math.cos(toRad(destLat)) * 
      Math.sin(dLng / 2) * 
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Estimate time (assuming 5km/h walking speed)
    const duration = Math.round((distance / 5) * 60);

    res.json({
      origin: {
        latitude: currentLat,
        longitude: currentLng,
      },
      destination: {
        latitude: destLat,
        longitude: destLng,
      },
      building: {
        id: building._id,
        name: building.name,
        address: building.address,
      },
      distance: distance, // will always have a value
      duration: duration  // will always have a value
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};