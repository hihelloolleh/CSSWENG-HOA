const express              = require('express');
const router               = express.Router();
const paymentLedgerController = require('../controllers/paymentLedgerController');
  
// to be implemented 

router.get('/', paymentLedgerController.getPayments);

module.exports = router;
