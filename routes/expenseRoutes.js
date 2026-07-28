const express              = require('express');
const router               = express.Router();
const ExpenseController    = require('../controllers/expenseController');
const paymentLedgerModel   = require('../models/paymentLedgerModel');

const PURPOSE_MAP = {
    utilities: 'Utilities',
    salaries: 'Employee Salaries',
    maintenance: 'Maintenance',
    cash: 'Petty Cash',
    food: 'Food',
    project: 'Community Project', 
    other: 'Other',
};

router.get('/', ExpenseController.getExpenseDashboard);

router.get('/:type', async (req, res) => {
    const type = req.params.type;
    if (!PURPOSE_MAP[type]) return res.redirect('/expenses');

    try {
        res.render('expenses', {
            title:       'Expenses',
            activePage:  'expenses',
            pageCSS:     'expenses.css',
            expenseType: type,
            purposeValue: PURPOSE_MAP[type],
        });
    } catch (err) {
        console.error('Expense form error:', err);
        res.status(500).send('Failed to load expense form.');
    }
});

module.exports = router;
