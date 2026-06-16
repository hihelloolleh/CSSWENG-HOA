const express            = require('express');
const router             = express.Router();
const vehicleController  = require('../controllers/vehicleController');

// GET  /vehicles        → list all vehicles
// POST /vehicles        → register a vehicle         (SPRINT 2+)
// PUT  /vehicles/:id    → update vehicle info        (SPRINT 2+)
// DELETE /vehicles/:id  → remove a vehicle           (SPRINT 2+)

router.get('/', vehicleController.getVehicles);

module.exports = router;
