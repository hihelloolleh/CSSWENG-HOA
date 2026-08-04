const financeDashboardModel = require('../models/financeDashboardModel');

exports.getFinanceDashboard = async (req, res) => {
    try {
        const today       = new Date();
        const defaultFrom = `${today.getFullYear()}-01-01`;
        const defaultTo   = today.toISOString().slice(0, 10);

        let fromDate = req.query.from || defaultFrom;
        let toDate   = req.query.to   || defaultTo;

        if (toDate   > defaultTo) toDate   = defaultTo;
        if (fromDate > defaultTo) fromDate = defaultTo;
        if (fromDate > toDate)    fromDate = toDate;

        const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
            month: 'long', day: 'numeric', year: 'numeric',
        });

        const [stats, recentTransactions] = await Promise.all([
            financeDashboardModel.getFinanceStats(fromDate, toDate),
            financeDashboardModel.getRecentTransactions(fromDate, toDate),
        ]);

        res.render('financeDashboard', {
            title:            'Finance',
            activePage:       'financeDashboard',
            pageCSS:          'finance-dashboard.css',
            stats,
            recentTransactions,
            fromDate,
            toDate,
            fromDateDisplay:  fmtDate(fromDate),
            toDateDisplay:    fmtDate(toDate),
        });
    } catch (err) {
        console.error('Finance dashboard error:', err);
        res.status(500).send('Failed to load finance dashboard');
    }
};
