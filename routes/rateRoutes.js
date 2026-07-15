const express = require('express');
const router = express.Router();
const rateController = require('../controllers/rateController');

router.get('/', rateController.getRatesPage);

router.post('/update/:id', rateController.updateRate);

module.exports = router;