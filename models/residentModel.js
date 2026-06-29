const db = require('../config/db');
const pool = db.pool;

/**
 * Fetches a resident record given its id
 * 
 * @param {*} resident_id 
 * @returns - the resident record
 */
const selectResidentById = async(resident_id, conn) => {
    const [rows] = await pool.query(`
            SELECT 
                resident_id,
                residency_start_date,
                residency_end_date,
                person_id
            FROM Resident WHERE resident_id = ?`,
            [resident_id]
    );
    return rows[0];
};

const selectPersonByResidentId = async(resident_id, conn) => {

    const[rows] = await conn.query(`
        SELECT person_id
        FROM Resident
        WHERE resident_id = ?`,
        [resident_id]
    );

    return rows[0];
}


/**
 * Fetches all records in the Resident table
 * 
 * @returns - All the resident records
 */
const getAllResidents = async() => {
    const [rows] = await pool.query(`
        SELECT
            Resident.resident_id,
            Person.person_id,
            Person.first_name,
            Person.last_name,
            Person.birth_date,
            Person.email,
            Person.contact_num,
            Resident.residency_start_date,
            Resident.residency_end_date
        FROM Resident
        JOIN Person
            ON Resident.person_id = Person.person_id`
    );

    return rows;
};

/**
 * Adds a new resident record to the Resident table
 * 
 * @param {*} data - Resident data
 * @returns - The generated resident_id
 */
const addResident = async(data, person_id, conn) => {
    const [result] = await conn.query(`
        INSERT INTO Resident (person_id, residency_start_date, residency_end_date)
        VALUES(?, ?, ?)`,
        [
            person_id,
            data.residency_start_date,
            data.residency_end_date || null,
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
const deleteResident = async(resident_id, conn) => {

    const [result] = await conn.query(`
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
const updateResident = async(data, conn) => {

    const [result] = await conn.query(`
        UPDATE Resident
        SET residency_start_date = ?,
            residency_end_date = ?
        WHERE resident_id = ?`,
        [
            data.residency_start_date,
            data.residency_end_date || null,
            data.resident_id
        ]
    );

    return result.affectedRows;
};

module.exports = {
    selectResidentById,
    selectPersonByResidentId,
    getAllResidents,
    addResident,
    deleteResident,
    updateResident
};

