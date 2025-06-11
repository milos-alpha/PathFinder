const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/user');

// router.use(authenticate);

router.get('/buildings/search', userController.searchBuildings);
router.get('/buildings/:buildingId/directions', userController.getBuildingDirections);

module.exports = router;