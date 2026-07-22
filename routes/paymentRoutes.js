const express              = require('express');
const router               = express.Router();
const PaymentController    = require('../controllers/paymentController');
const paymentLedgerModel   = require('../models/paymentLedgerModel');
const propertyModel        = require('../models/propertyModel');
const VehicleModel         = require('../models/vehicleModel');

const PURPOSE_MAP = {
    association: 'Association Dues',
    vehicle:     'Vehicle Sticker',
    outstanding: 'Outstanding Balance',
    general:     'General Payments',
};

router.get('/', PaymentController.getPaymentDashboard);

router.get('/:type', async (req, res) => {
    const type = req.params.type;
    if (!PURPOSE_MAP[type]) return res.redirect('/payments');

    try {
        const persons    = await paymentLedgerModel.getAllPersons();
        const properties = (type === 'association' || type === 'outstanding')
            ? await propertyModel.selectAllProperties()
            : [];
        const vehicles   = type === 'vehicle'
            ? await VehicleModel.getAllVehicles()
            : [];
        const residentsByProperty = (type === 'association' || type === 'outstanding')
            ? await paymentLedgerModel.getResidentsByProperty()
            : {};

        res.render('payments', {
            title:       'Payments',
            activePage:  'payments',
            pageCSS:     'payments.css',
            paymentType: type,
            purposeValue: PURPOSE_MAP[type],
            persons,
            properties,
            vehicles,
            residentsByProperty,
        });
    } catch (err) {
        console.error('Payment form error:', err);
        res.status(500).send('Failed to load payment form.');
    }
});

module.exports = router;
