// RESIDENT CONTROLLER
// manages the Resident table  
// SPRINT 2+: connect all functions to the database via models.
const residentModel = require('../models/residentModel');

const getResidents = async (req, res) => {
    try {
        const residents = await residentModel.getAllResidents();

        res.render('residents', {
            title:      'Residents',
            activePage: 'residents',
            pageCSS:    'residents.css',
            residents,
        });
    } catch(err) {
        console.log("Error fetching residents: ", err);
        return res.status(500).send('Failed to load residents');
    }
    
};

const addResident = async(req, res) => {
    try {
        await residentModel.createResident(req.body);
         return res.redirect('/residents');
        
    } catch(err) {
        console.log("Failed to add resident: ", err);
        return res.status(500).send("Server Error");
    }
}

exports.updateResident = (req, res) => {
    // TODO (SPRINT 2+): UPDATE Resident TABLE
    
};

exports.removeResident = (req, res) => {
    // TODO (SPRINT 2+): DELETE FROM Resident TABLE
};

module.exports = {
    getResidents,
    addResident
};
