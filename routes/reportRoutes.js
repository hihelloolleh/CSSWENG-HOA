const express          = require('express');
const router           = express.Router();
const reportController = require('../controllers/reportController');

router.get('/',                 reportController.getReportsHub);
router.get('/delinquency',      reportController.getDelinquencyReport);
router.get('/senior-citizens',  reportController.getSeniorCitizenReport);
router.get('/hoa-general',      reportController.getHoaGeneralReport);

module.exports = router;
