
/**
 * Fetches a person record given its id
 * 
 * @param {*} person_id 
 * @returns the person record
 */
const selectPersonById = async(person_id, conn) => {
    
   const [rows] = await conn.query(`
        SELECT 
            person_id,
            first_name,
            middle_name,
            last_name,
            suffix,
            birth_date,
            email,
            contact_num
        FROM Person 
        WHERE person_id = ?`,
        [person_id]
    );

    return rows[0];
};
/**
 * Fetches a person record given the first and last name
 * 
 * @param {*} first_name - first name of person
 * @param {*} last_name - last name of person
 * @param {*} conn 
 * @returns person record with the given name
 */
const selectPersonByName = async(first_name, last_name, conn) => {

    const[rows] = await conn.query(`
        SELECT person_id
        FROM Person
        WHERE first_name = ? AND last_name = ?`,
        [first_name, last_name]
    );

    return rows[0];
}

/**
 * Fetches all records in the Person table
 * 
 * @returns all person records
 * 
 */
const getAllPersons = async(conn) => {

    const [rows] = await conn.query(`
        SELECT 
            person_id,
            first_name,
            last_name,
            birth_date,
            email,
            contact_num
        FROM Person`
    );

    return rows;
};

/**
 * Adds a new person record to the Person table
 * 
 * @param {*} data - person data
 * @returns - the newly generated person id
 */
const addPerson = async(data, conn) => {

    const [result] = await conn.query(`
        INSERT INTO Person (first_name, last_name, birth_date, email, contact_num)
        VALUES(?, ?, ?, ?, ?)`,
        [
            data.first_name, 
            data.last_name,
            data.birth_date || null,
            data.email || null, 
            data.contact_num
        ]
    );

    return result.insertId;
            
};

/**
 * Deletes an existing person record from the Person table 
 * given its id
 * 
 * @param {*} person_id - the ID of the person to delete
 * @returns - the number of rows deleted
 */
const deletePerson = async(person_id) => {

    const [result] = await db.query(`
            DELETE FROM Person
            WHERE person_id = ?`,
            [person_id]
        );

    return result.affectedRows;
};

/**
 * Updates an existing person record from the Person table
 * given its id
 * 
 * @param {*} data - person data
 * @returns - the number of rows updated
 */
const updatePerson = async(data, person_id, conn) => {

    const [result] = await conn.query(
            `UPDATE Person
            SET first_name = ?,
                last_name = ?,
                email = ?,
                contact_num = ?,
                birth_date = ?
            WHERE person_id = ?`,
            [
                data.first_name,
                data.last_name,
                data.email || null,
                data.contact_num || null,
                data.birth_date || null,
                person_id
            ]
        );

    return result.affectedRows;
};


module.exports = {
    selectPersonById,
    getAllPersons,
    addPerson,
    deletePerson,
    updatePerson,
    selectPersonByName
};