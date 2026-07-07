const { pool } = require('../config/db');

// ── READ ─────────────────────────────────────────────────────────────────────

const selectAllProperties = async () => {
    const [rows] = await pool.query(`
        SELECT property_id, lot_number, property_type, street_name
        FROM Property
        ORDER BY street_name ASC, lot_number ASC
    `);
    return rows;
};

const selectPropertiesByResidentId = async(resident_id, conn) => {
    const[rows] = await conn.query(`
        SELECT rp.property_id
        FROM Resident_Property rp
        WHERE rp.resident_id = ? `,
        [resident_id]
    );

    return rows;
}

const selectAllResidents = async () => {
    const [rows] = await pool.query(`
        SELECT
            r.resident_id,
            CONCAT(per.first_name, ' ', per.last_name) AS full_name
        FROM Resident r
        JOIN Person per ON r.person_id = per.person_id
        ORDER BY per.last_name ASC
    `);
    return rows;
};

const selectResidentsByPropertyId = async (propertyId) => {
    const [rows] = await pool.query(`
        SELECT
            r.resident_id,
            CONCAT(per.first_name, ' ', per.last_name) AS full_name,
            rp.type
        FROM Resident_Property rp
        JOIN Resident r   ON rp.resident_id = r.resident_id
        JOIN Person   per ON r.person_id     = per.person_id
        WHERE rp.property_id = ?
        ORDER BY per.last_name ASC
    `, [propertyId]);
    return rows;
};

// ── WRITE (accept conn so they run inside service transactions) ───────────────

const insertProperty = async (data, conn) => {
    const [result] = await conn.query(
        `INSERT INTO Property (lot_number, property_type, street_name) VALUES (?, ?, ?)`,
        [data.lot_number || null, data.property_type, data.street_name]
    );
    return result.insertId;
};

const updatePropertyById = async (data, conn) => {
    const [result] = await conn.query(
        `UPDATE Property SET lot_number = ?, property_type = ?, street_name = ? WHERE property_id = ?`,
        [data.lot_number || null, data.property_type, data.street_name, data.property_id]
    );
    return result.affectedRows;
};

const deletePropertyById = async (propertyId) => {
    const [result] = await pool.query(
        `DELETE FROM Property WHERE property_id = ?`,
        [propertyId]
    );
    return result.affectedRows;
};

const insertResidentProperty = async (resident_id, property_id, type, conn) => {
    const [result] = await conn.query(
        `INSERT INTO Resident_Property (resident_id, property_id, type) VALUES (?, ?, ?)`,
        [resident_id, property_id, type]
    );
    return result.affectedRows;
};

const deleteResidentsByPropertyId = async (property_id, conn) => {
    const [result] = await conn.query(
        `DELETE FROM Resident_Property WHERE property_id = ?`,
        [property_id]
    );
    return result.affectedRows;
};

const deleteResidentProperty = async(resident_id, property_id, conn) => {
    const [result] = await conn.query(
        `DELETE FROM Resident_Property 
        WHERE property_id = ? AND resident_id = ?`,
        [property_id, resident_id]
    );
    return result.affectedRows;
}

module.exports = {
    selectAllProperties,
    selectAllResidents,
    selectResidentsByPropertyId,
    insertProperty,
    updatePropertyById,
    deletePropertyById,
    insertResidentProperty,
    deleteResidentsByPropertyId,
    selectPropertiesByResidentId,
    deleteResidentProperty
};
