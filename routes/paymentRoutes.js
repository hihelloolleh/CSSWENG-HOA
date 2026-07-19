const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');

router.get('/', PaymentController.getPaymentDashboard);

router.get('/:type', (req, res) => {
    res.render('payments', {
        title: 'Payments',
        activePage: 'payments',
        pageCSS: 'payments.css',
        paymentType: req.params.type
    });
});

module.exports = router;
