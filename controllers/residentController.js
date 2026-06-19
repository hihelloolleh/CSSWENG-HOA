// PROPERTY OWNER CONTROLLER
// manages the Property_Owner join table (person <--> property).
// SPRINT 2+: connect all functions to the database via models.

exports.getResidents = (req, res) => {
    // TODO (SPRINT 2+): JOIN Property_Owner WITH Person AND Property TABLES
    const residents = [];

    res.render('residents', {
        title:      'Residents',
        activePage: 'residents',
        pageCSS:    'residents.css',
        residents,
    });
};

exports.assignResident = (req, res) => {
    // TODO (SPRINT 2+): INSERT INTO Property_Owner TABLE
};

exports.updateResident = (req, res) => {
    // TODO (SPRINT 2+): UPDATE Property_Owner TABLE
};

exports.removeResident = (req, res) => {
    // TODO (SPRINT 2+): DELETE FROM Property_Owner TABLE
};
