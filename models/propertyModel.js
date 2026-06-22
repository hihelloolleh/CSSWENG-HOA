const { pool } = require('../config/db');

// ── READ ────────────────────────────────────────────────────────────────────
// Fetches all properties with their Homeowner name (if assigned).
const getAllProperties = async () => {
    const [rows] = await pool.query(`
        SELECT
            p.property_id,
            p.property_type,
            p.street_name,
            rp.resident_id        AS owner_resident_id,
            CONCAT(per.first_name, ' ', per.last_name) AS owner_name
        FROM Property p
        LEFT JOIN Resident_Property rp
            ON p.property_id = rp.property_id AND rp.type = 'Homeowner'
        LEFT JOIN Resident r  ON rp.resident_id = r.resident_id
        LEFT JOIN Person   per ON r.person_id    = per.person_id
        ORDER BY p.property_id ASC
    `);
    return rows;
};

// Returns every Resident (joined with Person) for the owner dropdown.
const getAllResidents = async () => {
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

// ── CREATE ───────────────────────────────────────────────────────────────────
const createProperty = async (data) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const [result] = await conn.query(
            `INSERT INTO Property (property_type, street_name)
             VALUES (?, ?)`,
            [data.property_type, data.street_name]
        );
        const propertyId = result.insertId;

        // Assign homeowner if one was selected in the modal
        if (data.owner_resident_id) {
            await conn.query(
                `INSERT INTO Resident_Property (resident_id, property_id, type)
                 VALUES (?, ?, 'Homeowner')`,
                [data.owner_resident_id, propertyId]
            );
        }

        await conn.commit();
        return propertyId;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

// ── UPDATE ───────────────────────────────────────────────────────────────────
const updateProperty = async (data) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await conn.query(
            `UPDATE Property
             SET property_type = ?, street_name = ?
             WHERE property_id = ?`,
            [data.property_type, data.street_name, data.property_id]
        );

        // Replace the existing Homeowner link with the new selection
        await conn.query(
            `DELETE FROM Resident_Property
             WHERE property_id = ? AND type = 'Homeowner'`,
            [data.property_id]
        );

        if (data.owner_resident_id) {
            await conn.query(
                `INSERT INTO Resident_Property (resident_id, property_id, type)
                 VALUES (?, ?, 'Homeowner')`,
                [data.owner_resident_id, data.property_id]
            );
        }

        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
// Resident_Property rows are removed automatically via ON DELETE CASCADE.
const deleteProperty = async (propertyId) => {
    await pool.query(
        `DELETE FROM Property WHERE property_id = ?`,
        [propertyId]
    );
};

module.exports = {
    getAllProperties,
    getAllResidents,
    createProperty,
    updateProperty,
    deleteProperty,
};
