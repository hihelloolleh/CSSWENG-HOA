const express            = require('express');
const router             = express.Router();
const vehicleController  = require('../controllers/vehicleController');

// list all vehicles
router.get('/', vehicleController.getVehicles);

// register a vehicle 
router.post('/register', vehicleController.registerVehicle);

// remove a vehicle 
router.post('/delete/:id', vehicleController.deleteVehicle);

module.exports = router;