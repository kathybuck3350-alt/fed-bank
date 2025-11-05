// routes/shipments.js
const express = require('express');
const router = express.Router();
const controller = require('../controller/ShipmentController');

// List (paginated)
router.get('/', controller.getShipments);

// Create
router.post('/', controller.createShipment);

// Track by tracking_id (query param ?tracking_id= or ?id=)
router.get('/track/:id', controller.trackShipment);

// Update partial (progress updates)
router.patch('/:id', controller.updateShipment);

// Delete
router.delete('/:id', controller.deleteShipment);

module.exports = router;
