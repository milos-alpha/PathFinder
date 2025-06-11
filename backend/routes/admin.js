const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/admin');

router.use(authenticate);
router.use(authorize('admin','user'));

router.post('/buildings', adminController.createBuilding);
router.get('/buildings', adminController.getAllBuildings);
router.get('/buildings/:id/qrcode', adminController.getBuildingQRCode);

module.exports = router;