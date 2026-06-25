const db = require('../config/db');
const pool = db.pool;

//selectPersonById()
const selectPersonById = async(person_id) => {
    
   const [rows] = await pool.query(`
        SELECT 
            person_id,
            first_name,
            last_name,
            birth_date,
            email,
            contact_num
        FROM Person 
        WHERE person_id = ?`,
        [person_id]
    );

    return rows[0];
};

//getAllPerson()
const getAllPersons = async() => {

    const [rows] = await pool.query(`
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

//createPerson()
const addPerson = async(data) => {

    const [result] = await pool.query(`
        INSERT INTO Person (first_name, last_name, birth_date, email, contact_num)
        VALUES(?, ?, ?, ?, ?)`,
        [data.first_name, 
         data.last_name,
         data.birth_date || null,
         data.email || null, 
         data.contact_num
        ]
    );

    return result.insertId;
            
};

//deletePerson()
const deletePerson = async(person_id) => {

    const [result] = await db.query(`
            DELETE FROM Person
            WHERE person_id = ?`,
            [person_id]
        );

    return result.affectedRows;
};

//updatePerson()
const updatePerson = async(data) => {

    const [result] = await conn.query(
            `UPDATE Person
            SET first_name = ?,
                last_name = ?,
                email = ?,
                contact_num = ?
            WHERE person_id = ?`,
            [data.first_name,
             data.last_name,
             data.email || null,
             data.contact_num || null,
             rows[0].person_id
            ]
        );

    return result.affectedRows;
};


module.exports = {
    selectPersonById,
    getAllPersons,
    addPerson,
    deletePerson,
    updatePerson
};