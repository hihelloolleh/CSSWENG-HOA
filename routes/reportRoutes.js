const express          = require('express');
const router           = express.Router();
const reportController = require('../controllers/reportController');

router.get('/',             reportController.getReportsHub);
router.get('/delinquency',  reportController.getDelinquencyReport);

module.exports = router;
