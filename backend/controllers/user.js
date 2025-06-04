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

    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    res.json({
      origin: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      destination: {
        latitude: building.location.coordinates[1],
        longitude: building.location.coordinates[0],
      },
      building: {
        id: building._id,
        name: building.name,
        address: building.address,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};