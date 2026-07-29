const reportModel = require('../models/reportModel');

exports.getReportsHub = async (req, res) => {
    res.render('reports', {
        title:      'Reports',
        activePage: 'reports',
        pageCSS:    'reports.css',
    });
};

exports.getDelinquencyReport = async (req, res) => {
    try {
        const [summary, rows] = await Promise.all([
            reportModel.getDelinquencyReportSummary(),
            reportModel.getDelinquencyReportRows(),
        ]);
        res.render('delinquencyReport', {
            layout:    'layouts/report',
            title:     'Delinquency Report',
            summary,
            rows,
            generatedDate: new Date().toLocaleDateString('en-PH', {
                month: 'long', day: 'numeric', year: 'numeric',
            }),
        });
    } catch (err) {
        console.error('Delinquency report error:', err);
        res.status(500).send('Failed to generate delinquency report.');
    }
};
