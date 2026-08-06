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
            Person.middle_name,
            Person.suffix,
            Person.last_name,
            Person.birth_date,
            Person.email,
            Person.contact_num,
            Resident.residency_start_date,
            Resident.residency_end_date,
            Resident.isDelinquent,
            CASE
                WHEN Resident.residency_end_date IS NULL
                  OR Resident.residency_end_date > CURDATE() THEN 1
                ELSE 0
            END AS isActive
        FROM Resident
        JOIN Person
            ON Resident.person_id = Person.person_id
        WHERE deleteFlag = 0
        ORDER BY
            CASE
                WHEN Resident.residency_end_date IS NULL
                  OR Resident.residency_end_date > CURDATE() THEN 0
                ELSE 1
            END ASC,
            Person.last_name ASC`
    );

    return rows;
};

const findActiveResidentByPersonId = async (person_id, conn) => {
    const [rows] = await conn.query(
        `
        SELECT resident_id
        FROM Resident
        WHERE person_id = ?
          AND isActive = 1
          AND deleteFlag = 0
        `,
        [person_id]
    );

    return rows[0];
};
/**
 * Adds a new resident record to the Resident table
 * 
 * @param {*} data - Resident data
 * @returns - The generated resident_id
 */
const addResident = async(data, person_id, conn) => {
    const [result] = await conn.query(`
        INSERT INTO Resident (person_id, residency_start_date)
        VALUES(?, ?)`,
        [
            person_id,
            data.residency_start_date
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
       UPDATE Resident
       SET deleteFlag = 1
       WHERE resident_id = ?`,
       [resident_id]
    );
    //if i delete a resident that means i should also delete its 
    return result.affectedRows;
};
/**
 * Deactivates an existing resident, meaning their residency has ended.
 * This function sets the residency end date and sets the isActive property
 * to false
 * 
 * @param {*} resident_id - The resident to be deleted
 * @returns - The number of rows deleted
 */
const deactivateResident = async(resident_id, end_date, conn) => {
   
     const [result] = await conn.query(`
        UPDATE Resident
        SET residency_end_date = ?, isActive = 0
        WHERE resident_id = ?`,
        [
            end_date,
            resident_id
        ]
    );

    return result.affectedRows;

}

/**
 * Updates data from an existing resident record in the Resident table
 * 
 * @param {*} data - Resident data to update
 * @returns - The number of rows updated
 */
const updateResident = async(start_date, end_date, resident_id, conn) => {

    const [result] = await conn.query(`
        UPDATE Resident
        SET residency_start_date = ?, residency_end_date = ?
        WHERE resident_id = ?`,
        [start_date, end_date || null, resident_id]
    );

    return result.affectedRows;
};


const reactivateResident = async (resident_id, new_start_date, conn) => {
    const [result] = await conn.query(
        `UPDATE Resident SET residency_start_date = ?, residency_end_date = NULL, isActive = 1 WHERE resident_id = ?`,
        [new_start_date, resident_id]
    );
    return result.affectedRows;
};

const updateResidentEndDate = async (resident_id, end_date, conn) => {
    const [result] = await conn.query(
        `UPDATE Resident SET residency_end_date = ? WHERE resident_id = ?`,
        [end_date, resident_id]
    );
    return result.affectedRows;
};

const setDelinquent = async (residentId, value, conn) => {
    await conn.query(
        `UPDATE Resident SET isDelinquent = ? WHERE resident_id = ?`,
        [value ? 1 : 0, residentId]
    );
};

// Recomputes isDelinquent for every Resident row of this person from two
// sources of truth: an outstanding-balance property they're linked to, OR
// any payment (any purpose) in the ledger that is still partial/unpaid.
const recomputeDelinquentByPersonId = async (personId, conn) => {
    await conn.query(`
        UPDATE Resident r
        SET isDelinquent = (
            EXISTS (
                SELECT 1
                FROM Resident_Property rp
                JOIN Property p ON rp.property_id = p.property_id
                WHERE rp.resident_id = r.resident_id AND p.hasDues = 1
            )
            OR EXISTS (
                SELECT 1
                FROM Payment pay
                WHERE pay.paid_by = r.person_id
                  AND pay.amount_paid < pay.amount_expected
            )
        )
        WHERE r.person_id = ? AND r.deleteFlag = 0
    `, [personId]);
};

const getResidentIdByPersonId = async (personId, conn) => {
    const db = conn || pool;
    const [rows] = await db.query(
        `SELECT resident_id FROM Resident WHERE person_id = ? AND deleteFlag = 0 ORDER BY isActive DESC LIMIT 1`,
        [personId]
    );
    return rows[0] || null;
};

const getDelinquentPropertiesByResidentId = async (residentId) => {
    const [rows] = await pool.query(`
        SELECT p.property_id, p.lot_number, p.street_name, p.property_type, p.outstandingBalance
        FROM Resident_Property rp
        JOIN Property p ON rp.property_id = p.property_id
        WHERE rp.resident_id = ? AND p.hasDues = 1 AND p.outstandingBalance > 0
        ORDER BY p.street_name, p.lot_number
    `, [residentId]);
    return rows;
};

const getPendingPaymentsByResidentId = async (residentId) => {
    const [rows] = await pool.query(`
        SELECT
            pay.payment_id,
            pay.purpose,
            pay.amount_expected,
            pay.amount_paid,
            pay.date_paid,
            pay.payment_method,
            pay.paid_by,
            (
                SELECT rp2.property_id
                FROM Resident_Property rp2
                WHERE rp2.resident_id = r.resident_id
                ORDER BY rp2.type = 'Homeowner' DESC
                LIMIT 1
            ) AS property_id
        FROM Payment pay
        JOIN Resident r ON pay.paid_by = r.person_id
        WHERE r.resident_id = ?
          AND pay.amount_paid < pay.amount_expected
          AND pay.purpose <> 'Outstanding Balance'
        ORDER BY pay.created_at DESC
    `, [residentId]);
    return rows;
};

module.exports = {
    selectResidentById,
    selectPersonByResidentId,
    getAllResidents,
    addResident,
    deleteResident,
    updateResident,
    updateResidentEndDate,
    reactivateResident,
    deactivateResident,
    findActiveResidentByPersonId,
    setDelinquent,
    recomputeDelinquentByPersonId,
    getResidentIdByPersonId,
    getDelinquentPropertiesByResidentId,
    getPendingPaymentsByResidentId,
};

