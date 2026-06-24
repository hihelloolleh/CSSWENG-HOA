const express                  = require('express');
const router                   = express.Router();
const residentController  = require('../controllers/residentController');

router.get('/', residentController.getResidents);
router.post('/', residentController.addResident);
router.post('/:id/delete', residentController.deleteResident);

module.exports = router;
