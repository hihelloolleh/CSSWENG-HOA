const { pool } = require('../config/db');

const VehicleModel = {
    getAllVehicles: async () =>{
        const query = `
            SELECT v.type, v.vehicle_id, v.plate_number, v.make, v.model, v.color, v.sticker_year, 
            GROUP_CONCAT(CONCAT(p.first_name, ' ', p.last_name) SEPARATOR ', ') AS homeowners,
            GROUP_CONCAT(rv.resident_id SEPARATOR ',') AS resident_ids 
            FROM Vehicle v
            LEFT JOIN Resident_Vehicle rv ON v.vehicle_id = rv.vehicle_id
            LEFT JOIN Resident r ON rv.resident_id = r.resident_id
            LEFT JOIN Person p ON r.person_id = p.person_id
            GROUP BY v.vehicle_id
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

    findByPlate: async (plate_number, conn = pool) =>{
        const [rows] = await conn.execute(
            'SELECT vehicle_id FROM vehicle WHERE plate_number = ?',
            [plate_number]
        );

        return rows;
    },

    createVehicle: async (vehicleData, conn = pool) =>{
        const { type, plate_number, make, model, color, sticker_year } = vehicleData;

        const [result] = await conn.execute(
            'INSERT INTO Vehicle (type, plate_number, make, model, color, sticker_year) VALUES (?, ?, ?, ?, ?, ?)',
            [type, plate_number, make, model, color, sticker_year]
        );

        return result.insertId;
    },

    updateVehicleData: async (vehicleId, vehicleData, conn = pool) =>{
        const { type, plate_number, make, model, color, sticker_year } = vehicleData;

        await conn.execute(
            `UPDATE Vehicle SET type = ?, plate_number = ?, make = ?, model = ?, color = ?, sticker_year = ? WHERE vehicle_id = ?`,
            [type, plate_number, make, model, color, sticker_year, vehicleId]
        );
    },

    linkToResident: async (resident_id, vehicle_id) =>{
        await pool.execute(
            'INSERT INTO resident_vehicle (resident_id, vehicle_id) VALUES (?, ?)',
            [resident_id, vehicle_id]
        );
    },

    updateVehicleResidents: async (vehicleId, residentIds, conn = pool) => {
        await conn.execute('DELETE FROM Resident_Vehicle WHERE vehicle_id = ?', [vehicleId]);
        
        if (residentIds && residentIds.length > 0) {
            const insertQuery = 'INSERT INTO Resident_Vehicle (resident_id, vehicle_id) VALUES (?, ?)';
            for (const resId of residentIds) {
                await conn.execute(insertQuery, [resId, vehicleId]);
            }
        }
    },

    deleteVehicle: async (vehicleId) => {
        await pool.execute('DELETE FROM Vehicle WHERE vehicle_id = ?', [vehicleId]);
    },
};

module.exports = VehicleModel;