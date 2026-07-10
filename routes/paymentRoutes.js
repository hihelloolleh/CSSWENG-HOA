const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

router.get('/', PaymentController.getPaymentDashboard);
router.post('/dues', PaymentController.createDue);
router.post('/dues/:id/update', PaymentController.updateDue);
router.post('/dues/:id/delete', PaymentController.deleteDue);
router.post('/payments', PaymentController.createPayment);
router.post('/payments/:id/update', PaymentController.updatePayment);
router.post('/payments/:id/delete', PaymentController.deletePayment);

module.exports = router;