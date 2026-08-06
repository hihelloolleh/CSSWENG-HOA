const express                  = require('express');
const router                   = express.Router();
const residentController  = require('../controllers/residentController');

router.get('/',                    residentController.getResidents);
router.get('/:id/outstanding',     residentController.getResidentOutstanding);
router.get('/:id/pending-payments', residentController.getResidentPendingPayments);
router.post('/',                   residentController.addResident);
router.post('/:id/delete',         residentController.deleteResident);
router.post('/:id/update',         residentController.updateResident);
router.post('/:id/endResidency',      residentController.endResidency);
router.post('/:id/updateEndDate',     residentController.updateResidentEndDate);
router.post('/:id/reactivate',        residentController.reactivateResident);

module.exports = router;
