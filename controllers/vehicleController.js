// VEHICLE CONTROLLER
// SPRINT 2+: connect all functions to the database via models.

exports.getVehicles = (req, res) => {
    // TODO (SPRINT 2+): QUERY Vehicle JOIN Person TABLE FROM DB
    const vehicles = [];

    res.render('vehicles', {
        title:      'Vehicles',
        activePage: 'vehicles',
        vehicles,
    });
};

exports.registerVehicle = (req, res) => {
    // TODO (SPRINT 2+): INSERT INTO Vehicle TABLE (plate_number, person_id)
};

exports.updateVehicle = (req, res) => {
    // TODO (SPRINT 2+): UPDATE Vehicle TABLE WHERE plate_number = req.params.id
};

exports.deleteVehicle = (req, res) => {
    // TODO (SPRINT 2+): DELETE FROM Vehicle TABLE WHERE plate_number = req.params.id
};
