const paymentLedgerService = require('../services/paymentLedgerService');

// ── GET /payments ──────────────────────────────────────────────────────────
exports.getPayments = async (req, res) => {
    const payments = [];
    try {
        res.render('paymentLedger', {
            title:      'Payment Ledger',
            activePage: 'paymentLedger',
            pageCSS:    'payment-ledger.css',
            payments, 
        });
    } catch (err) {
        console.error('getPayments error:', err);
        res.status(500).send('Failed to load payments.');
    }
};

 exports.createPayment = (req, res) => {
    // TODO
};

exports.updatePayment = (req, res) => {
    // TODO 
};

exports.deletePayment = (req, res) => {
    // TODO
};
