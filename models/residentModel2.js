const db = require('../config/db');
const pool = db.pool;

/**
 * Fetches a resident record given its id
 * 
 * @param {*} resident_id 
 * @returns - the resident record
 */
const selectResidentById = async(resident_id) => {
    const [rows] = await pool.query(`
            SELECT 
                resident_id,
                residency_start_date,
                residency_end_date,
                is_board_member,
                person_id
            FROM Resident WHERE resident_id = ?`,
            [resident_id]
    );
    return rows[0];
};

/**
 * Fetches all records in the Resident table
 * 
 * @returns - All the resident records
 */
const getAllResidents = async() => {
    const [rows] = await pool.query(`
        SELECT 
            resident_id,
            residency_start_date,
            residency_end_date,
            is_board_member,
            person_id
        FROM Resident`
    );

    return rows;
};

/**
 * Adds a new resident record to the Resident table
 * 
 * @param {*} data - Resident data
 * @returns - The generated resident_id
 */
const addResident = async(data) => {
    const [result] = await pool.query(`
        INSERT INTO Resident (person_id, residency_start_date, residency_end_date, is_board_member)
        VALUES(?, ?, ?, ?)`,
        [
            data.person_id,
            data.residency_start_date,
            data.residency_end_date,
            data.is_board_member
        ]
    );

    return result.insertId;
};

/**
 * Deletes an existing resident record from the Resident table
 * 
 * @param {*} resident_id - The resident to be deleted
 * @returns - The number of rows deleted
 */
const deleteResident = async(resident_id) => {

    const [result] = await pool.query(`
        DELETE FROM Resident
        WHERE resident_id = ?`,
        [resident_id]
    );

    return result.affectedRows;
};

/**
 * Updates data from an existing resident record in the Resident table
 * 
 * @param {*} data - Resident data to update
 * @returns - The number of rows updated
 */
const updateResident = async(data) => {

    const [result] = await pool.query(`
        UPDATE Resident
        SET residency_start_date = ?,
            residency_end_date = ?,
            is_board_member = ?,
        WHERE resident_id = ?`,
        [
            data.residency_start_date,
            data.residency_end_date,
            data.is_board_member,
            data.resident_id
        ]
    );

    return result.affectedRows;
};

module.exports = {
    selectResidentById,
    getAllResidents,
    addResident,
    deleteResident,
    updateResident
};

