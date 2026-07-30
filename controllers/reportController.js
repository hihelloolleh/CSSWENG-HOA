const reportModel = require('../models/reportModel');

exports.getReportsHub = async (req, res) => {
    res.render('reports', {
        title:      'Reports',
        activePage: 'reports',
        pageCSS:    'reports.css',
    });
};

exports.getSeniorCitizenReport = async (req, res) => {
    try {
        const rows    = await reportModel.getSeniorCitizenRows();
        const summary = await reportModel.getSeniorCitizenSummary(rows);
        res.render('seniorCitizenReport', {
            layout:    'layouts/report',
            title:     'Senior Citizen Report',
            summary,
            rows,
            generatedDate: new Date().toLocaleDateString('en-PH', {
                month: 'long', day: 'numeric', year: 'numeric',
            }),
        });
    } catch (err) {
        console.error('Senior citizen report error:', err);
        res.status(500).send('Failed to generate senior citizen report.');
    }
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
