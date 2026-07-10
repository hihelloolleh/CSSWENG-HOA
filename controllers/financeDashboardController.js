// FINANCE DASHBOARD CONTROLLER
// currently renders with placeholder data.
// SPRINT 2+: Replace placeholder values with real DB queries.

exports.getFinanceDashboard = (req, res) => {
    // TODO (SPRINT 2+): FETCH RECENT RECORDS FROM DB
    const finances = []; 
    res.render('financeDashboard', {
        title:            'Finance',
        activePage:       'financeDashboard', 
        finances, 
    });
};
