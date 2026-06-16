// DASHBOARD CONTROLLER
// currently renders with placeholder data.
// SPRINT 2+: Replace placeholder values with real DB queries.

exports.getDashboard = (req, res) => {
    // TODO (SPRINT 2+): FETCH THESE COUNTS FROM THE DATABASE
    const stats = {
        totalPersons:    112,
        totalProperties: 45,
        totalEmployees:  12,
        totalVehicles:   45,
        activeStickers:  38,
    };

    // TODO (SPRINT 2+): FETCH PROPERTY STATUS BREAKDOWN FROM DB
    const propertyStatus = {
        occupied:     32,
        vacant:       8,
        construction: 5,
    };

    // TODO (SPRINT 2+): FETCH RECENT RECORDS FROM DB
    const recentPersons = [];
    const recentProperties = [];

    res.render('dashboard', {
        title:            'Dashboard',
        activePage:       'dashboard',
        stats,
        propertyStatus,
        recentPersons,
        recentProperties,
    });
};
