const { pool } = require('../config/db');

exports.getVehicles = async (req, res) => {
    try {
        // get the resident associated w the car + the car's details
        const query = `
            SELECT v.vehicle_id, v.plate_number, v.make, v.model, v.color, v.sticker_year, 
            CONCAT(p.first_name, ' ', p.last_name) AS homeowner
            FROM Vehicle v
            LEFT JOIN Resident_Vehicle rv ON v.vehicle_id = rv.vehicle_id
            LEFT JOIN Resident r ON rv.resident_id = r.resident_id
            LEFT JOIN Person p ON r.person_id = p.person_id
        `;
        const [vehicles] = await pool.execute(query);

        res.render('vehicles', {
            title: 'Vehicles',
            activePage: 'vehicles',
            pageCSS: 'vehicles.css',
            vehicles: vehicles
        });
    } catch (error) {
        console.error("Cannot fetch vehicles:", error);
        res.status(500).send("Server Error loading vehicles.");
    }
};

exports.registerVehicle = async (req, res) => {
    const { plate_number, make, model, color, sticker_year, resident_id } = req.body;
    
    try {
        // adds vehicle
        const [result] = await pool.execute(
            'INSERT INTO vehicle (plate_number, make, model, color, sticker_year) VALUES (?, ?, ?, ?, ?)',
            [plate_number, make, model, color, sticker_year]
        );
        
        // link vehicle to resident
        const newVehicleId = result.insertId;
        if (resident_id) {
            await pool.execute(
                'INSERT INTO resident_vehicle (resident_id, vehicle_id) VALUES (?, ?)',
                [resident_id, newVehicleId]
            );
        }

        res.redirect('/vehicles');
    } catch (error) {
        console.error("Cannot save vehicle:", error);
        res.status(500).send("Error saving vehicle.");
    }
};

exports.updateVehicle = async (req, res) => {
    // not yet defined in sprint 2
};

exports.deleteVehicle = async (req, res) => {
    try {
        await pool.execute('DELETE FROM vehicle WHERE vehicle_id = ?', [req.params.id]);
        res.redirect('/vehicles');
    } catch (error) {
        console.error("Cannot delete vehicle:", error);
        res.status(500).send("Error deleting vehicle.");
    }
};