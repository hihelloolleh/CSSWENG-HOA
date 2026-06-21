// RESIDENT CONTROLLER
// manages the Resident table  
// SPRINT 2+: connect all functions to the database via models.

exports.getResidents = (req, res) => {
    const residents = [];

    res.render('residents', {
        title:      'Residents',
        activePage: 'residents',
        pageCSS:    'residents.css',
        residents,
    });
};

exports.assignResident = (req, res) => {
    // TODO (SPRINT 2+): INSERT INTO Resident TABLE
};

exports.updateResident = (req, res) => {
    // TODO (SPRINT 2+): UPDATE Resident TABLE
};

exports.removeResident = (req, res) => {
    // TODO (SPRINT 2+): DELETE FROM Resident TABLE
};
