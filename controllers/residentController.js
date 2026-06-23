// RESIDENT CONTROLLER
// manages the Resident table  
// SPRINT 2+: connect all functions to the database via models.
const residentModel = require('../models/residentModel');

const getResidents = async (req, res) => {
    const residents = await residentModel.getAllResidents();

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

module.exports = {
    getResidents
};
