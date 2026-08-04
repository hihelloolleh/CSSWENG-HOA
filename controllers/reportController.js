const reportModel = require('../models/reportModel');

exports.getReportsHub = async (req, res) => {
    res.render('reports', {
        title:      'Reports',
        activePage: 'reports',
        pageCSS:    'reports.css',
    });
};

exports.getFinancialsReport = async (req, res) => {
    try {
        const today = new Date();
        const defaultFrom = `${today.getFullYear()}-01-01`;
        const defaultTo   = today.toISOString().slice(0, 10);

        let fromDate = req.query.from || defaultFrom;
        let toDate   = req.query.to   || defaultTo;

        if (toDate   > defaultTo) toDate   = defaultTo;
        if (fromDate > defaultTo) fromDate = defaultTo;
        if (fromDate > toDate)    fromDate = toDate;

        const fmtQueryDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
            month: 'long', day: 'numeric', year: 'numeric',
        });

        const data = await reportModel.getFinancialsReport(fromDate, toDate);

        res.render('financialsReport', {
            layout:          'layouts/report',
            title:           'Financials Report',
            ...data,
            fromDate,
            toDate,
            fromDateDisplay: fmtQueryDate(fromDate),
            toDateDisplay:   fmtQueryDate(toDate),
            generatedDate:   today.toLocaleDateString('en-PH', {
                month: 'long', day: 'numeric', year: 'numeric',
            }),
        });
    } catch (err) {
        console.error('Financials report error:', err);
        res.status(500).send('Failed to generate financials report.');
    }
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

exports.getVillageGeneralReport = async (req, res) => {
    try {
        const today = new Date();
        const defaultFrom = `${today.getFullYear()}-01-01`;
        const defaultTo   = today.toISOString().slice(0, 10);

        let fromDate = req.query.from || defaultFrom;
        let toDate   = req.query.to   || defaultTo;

        // Clamp both dates to today and ensure from <= to
        if (toDate   > defaultTo) toDate   = defaultTo;
        if (fromDate > defaultTo) fromDate = defaultTo;
        if (fromDate > toDate)    fromDate = toDate;

        const fmtQueryDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-PH', {
            month: 'long', day: 'numeric', year: 'numeric',
        });

        const data = await reportModel.getVillageGeneralReport(fromDate, toDate);

        res.render('villageGeneralReport', {
            layout:          'layouts/report',
            title:           'Village General Report',
            ...data,
            fromDate,
            toDate,
            fromDateDisplay: fmtQueryDate(fromDate),
            toDateDisplay:   fmtQueryDate(toDate),
            generatedDate:   today.toLocaleDateString('en-PH', {
                month: 'long', day: 'numeric', year: 'numeric',
            }),
        });
    } catch (err) {
        console.error('Village general report error:', err);
        res.status(500).send('Failed to generate village general report.');
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

exports.getResidentsGeneralReport = async (req, res) => {
    try {
        const { residents, vehicles } = await reportModel.getResidentsGeneralReport();

        const activeCount   = residents.filter(r => r.isActive).length;
        const summary = {
            totalResidents:    residents.length,
            activeResidents:   activeCount,
            inactiveResidents: residents.length - activeCount,
            totalVehicles:     vehicles.length,
        };

        res.render('residentsGeneralReport', {
            layout:        'layouts/report',
            title:         'Residents General Report',
            residents,
            vehicles,
            summary,
            generatedDate: new Date().toLocaleDateString('en-PH', {
                month: 'long', day: 'numeric', year: 'numeric',
            }),
        });
    } catch (err) {
        console.error('Residents general report error:', err);
        res.status(500).send('Failed to generate residents general report.');
    }
};

exports.getVehicleStickerReport = async (req, res) => {
    try {
        const today = new Date();
        
        const [rows, breakdownRows] = await Promise.all([
            reportModel.getVehicleStickerReport('2000-01-01', today.toISOString().slice(0, 10)),
            reportModel.getVehicleStickerBreakdown()
        ]);
        
        const breakdown = {};
        breakdownRows.forEach(row => {
            const vehicleType = (row.type || 'Unknown').toUpperCase();
            breakdown[vehicleType] = row.count;
        });

        const summary = {
            totalCount: rows.length,
            totalEarnings: rows.reduce((sum, r) => sum + parseFloat(r.amount_paid || 0), 0),
            cars: breakdown['CAR'] || breakdown['CARS'] || 0,
            motorcycles: breakdown['MOTORCYCLE'] || breakdown['MOTORCYCLES'] || 0,
            ebikes: breakdown['E-BIKE'] || breakdown['EBIKE'] || breakdown['E-BIKES'] || 0,
            commercial: breakdown['COMMERCIAL'] || 0
        };

        res.render('vehicleStickerReport', {
            layout:          'layouts/report',
            title:           'Vehicle Sticker Sales Report',
            summary,
            rows,
            generatedDate:   today.toLocaleDateString('en-PH', {
                month: 'numeric', day: 'numeric', year: 'numeric',
            }),
        });
    }
    catch (err) {
        console.error('Vehicle sticker report error:', err);
        res.status(500).send('Failed to generate vehicle sticker report.');
    }
};