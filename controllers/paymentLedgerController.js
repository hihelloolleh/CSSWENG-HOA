const paymentLedgerModel   = require('../models/paymentLedgerModel');
const paymentLedgerService = require('../services/paymentLedgerService');

const getPayments = async (req, res) => {
    try {
        const { purpose } = req.query;
        const payments = purpose
            ? await paymentLedgerModel.getPaymentsByPurpose(purpose)
            : await paymentLedgerModel.getAllPayments();
        const persons = await paymentLedgerModel.getAllPersons();

        res.render('paymentLedger', {
            title:         'Payment Ledger',
            activePage:    'paymentLedger',
            pageCSS:       'payment-ledger.css',
            payments,
            persons,
            filterPurpose: purpose || '',
            success:       req.query.success || null,
            error:         req.query.error   || null,
        });
    } catch (err) {
        console.error('getPayments error:', err);
        res.status(500).send('Failed to load payments.');
    }
};

const createPayment = async (req, res) => {
    try {
        await paymentLedgerService.addPayment(req.body);
        res.redirect('/payments?success=Payment+added+successfully.');
    } catch (err) {
        console.error('createPayment error:', err);
        res.redirect(`/payments?error=${encodeURIComponent(err.message)}`);
    }
};

const updatePayment = async (req, res) => {
    try {
        const { payment_id, ...data } = req.body;
        await paymentLedgerService.updatePayment(payment_id, data);
        res.redirect('/payments?success=Payment+updated+successfully.');
    } catch (err) {
        console.error('updatePayment error:', err);
        res.redirect(`/payments?error=${encodeURIComponent(err.message)}`);
    }
};

const deletePayment = async (req, res) => {
    try {
        await paymentLedgerService.deletePayment(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('deletePayment error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getPayments, createPayment, updatePayment, deletePayment };
