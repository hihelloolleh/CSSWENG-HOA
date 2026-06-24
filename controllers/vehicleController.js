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
    
    const plate_number = req.body.plate_number ? req.body.plate_number.trim().toUpperCase() : '';
    const make = req.body.make ? req.body.make.trim() : null;
    const model = req.body.model ? req.body.model.trim() : null;
    const color = req.body.color ? req.body.color.trim() : null;
    const sticker_year = req.body.sticker_year || null;
    const resident_id = req.body.resident_id || null;
    
    if (!plate_number) {
        return res.status(400).send("Plate number is required.");
    }


   try {
        const [existing] = await pool.execute(
            'SELECT vehicle_id FROM vehicle WHERE plate_number = ?',
            [plate_number]
        );

        if (existing.length > 0) {
            return res.status(400).send("Plate number is already registered in the system.");
        }

        const [result] = await pool.execute(
            'INSERT INTO vehicle (plate_number, make, model, color, sticker_year) VALUES (?, ?, ?, ?, ?)',
            [plate_number, make, model, color, sticker_year]
        );
        
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
        const vehicleId = req.params.id;

        await pool.execute('DELETE FROM Resident_Vehicle WHERE vehicle_id = ?', [vehicleId]);
        await pool.execute('DELETE FROM Vehicle WHERE vehicle_id = ?', [vehicleId]);

        res.redirect('/vehicles');
    }
    catch (error) {
        console.error("Cannot delete vehicle:", error);
        res.status(500).send("Error deleting vehicle.");
    }
};