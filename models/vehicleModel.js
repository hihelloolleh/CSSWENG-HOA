const { pool } = require('../config/db');

const VehicleModel = {
    getAllVehicles: async () =>{
        const query = `
            SELECT v.type, v.vehicle_id, v.plate_number, v.make, v.model, v.color, v.sticker_year, 
            CONCAT(p.first_name, ' ', p.last_name) AS homeowner,
            rv.resident_id
            FROM Vehicle v
            LEFT JOIN Resident_Vehicle rv ON v.vehicle_id = rv.vehicle_id
            LEFT JOIN Resident r ON rv.resident_id = r.resident_id
            LEFT JOIN Person p ON r.person_id = p.person_id
            WHERE v.is_active = TRUE
        `;

        const [rows] = await pool.execute(query);
        return rows;
    },

    getAllResidents: async () => {
        const query = `
            SELECT r.resident_id, CONCAT(p.first_name, ' ', p.last_name) AS full_name 
            FROM Resident r 
            JOIN Person p ON r.person_id = p.person_id
        `;

        const [rows] = await pool.execute(query);
        return rows;
    },

    findByPlate: async (plate_number) =>{
        const [rows] = await pool.execute(
            'SELECT vehicle_id FROM vehicle WHERE plate_number = ?',
            [plate_number]
        );

        return rows;
    },

    createVehicle: async (vehicleData) =>{
        const { type, plate_number, make, model, color, sticker_year } = vehicleData;
        const [result] = await pool.execute(
            'INSERT INTO vehicle (type, plate_number, make, model, color, sticker_year) VALUES (?, ?, ?, ?, ?, ?)',
            [type, plate_number, make, model, color, sticker_year]
        );

        return result.insertId;
    },

    updateVehicleData: async (vehicleId, type, plate_number, make, model, color, sticker_year) => {
        await pool.execute(
            `UPDATE Vehicle 
             SET type = ?, plate_number = ?, make = ?, model = ?, color = ?, sticker_year = ? 
             WHERE vehicle_id = ?`,
            [type, plate_number, make, model, color, sticker_year, vehicleId]
        );
    },

    linkToResident: async (resident_id, vehicle_id) =>{
        await pool.execute(
            'INSERT INTO resident_vehicle (resident_id, vehicle_id) VALUES (?, ?)',
            [resident_id, vehicle_id]
        );
    },

    updateVehicleResident: async (vehicleId, residentId) => {
        await pool.execute('DELETE FROM Resident_Vehicle WHERE vehicle_id = ?', [vehicleId]);
        
        if (residentId) {
            await pool.execute(
                'INSERT INTO Resident_Vehicle (resident_id, vehicle_id) VALUES (?, ?)', 
                [residentId, vehicleId]
            );
        }
    },

    softDeleteVehicle: async (vehicleId) => {
        await pool.execute('UPDATE Vehicle SET is_active = FALSE WHERE vehicle_id = ?', [vehicleId]);
    },
};

module.exports = VehicleModel;