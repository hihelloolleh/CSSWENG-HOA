exports.getExpenseDashboard = async (req, res) => {
    const expenses = [];
    try {
        res.render('expenses', {
            title:      'Expenses',
            activePage: 'expenses',
            pageCSS:    'expenses.css',
            expenses, 
        });
    } catch (err) {
        console.error('getExpenses error:', err);
        res.status(500).send('Failed to load expenses.');
    }
};

exports.createExpense = (req, res) => {
    // TODO
};

exports.updateExpense = (req, res) => {
    // TODO 
};

exports.deleteExpense = (req, res) => {
    // TODO
};
