const db = require('../config/db');
const pool = db.pool;

//TODO: getAllResidents()
//this views only a few info of each resident
/*first name, last name, birthday, email, contact number
    resident type
*/ 
const getAllResidents = async() => {
    const[rows] = await pool.query(`
        SELECT 
            r.resident_id,
            r.person_id,
            r.residency_start_date,
            r.residency_end_date,
            r.is_board_member,
            p.first_name,
            p.last_name,
            p.email,
            p.contact_num,
            p.birth_date,
            b.position,
            b.board_start_date,
            b.board_end_date
        FROM Resident r
        JOIN Person p ON r.person_id = p.person_id
        LEFT JOIN Board_Member b ON r.resident_id = b.resident_id
    `);

    return rows;
};


//TODO: createResident()
/**
* 1. Ask for the personal information
*   a. Name
*   b. Birth date
*   c. email
*   d. contact number
* 
* 2. Ask for the properties associated with them
*   a. There is an add to property button 
*   b. User may keep adding multiple properties (Property address and relationship)
*   c. Dropdown box filled with the registered properties from property table
* 
* 3. Ask for the vehicle/s they own
*   a. Dropdown box filled with the registered vehicles (plate number) from vehicle table
* 
* 4. Add board member input
*   a. Ask if resident is also a board member
*   b. If yes, it asks for other relevant info (position, start date, etc)
*
* 5. Check for duplicates
* 
*/

const createResident = async(data) => {
   const conn = await pool.getConnection(); //wire from app to db

   try{
        await conn.beginTransaction();
        //insert to person
        //insert to resident

        //return arrays of objects, person stores the first object(result header )
        const[person] = await conn.query(`
            INSERT INTO Person (first_name, last_name, birth_date, email, contact_num)
            VALUES(?, ?, ?, ?, ?)`,
            [data.first_name, 
             data.last_name,
             data.birth_date || null,
             data.email || null, 
             data.contact_num || null,
            ]
        );

        const[resident] = await conn.query(`
            INSERT INTO Resident (person_id, residency_start_date, residency_end_date, is_board_member)
            VALUES(?, ?, ?, ?)`,
            [person.insertId, 
             data.residency_start_date || null, 
             data.residency_end_date || null,
             data.is_board_member
            ]
        );

        if(data.is_board_member === '1') {
            await conn.query(`
                INSERT INTO Board_Member(resident_id, position, board_start_date, board_end_date)
                VALUES(?, ?, ?, ?)`,
                [resident.insertId, 
                 data.position,
                 data.board_start_date || null, 
                 data.board_end_date || null
                ]
            ); 
        }
        
        console.log(data);
        //tells mySQL that all queries were successfull and is safe to run in db
        await conn.commit();
        return resident.insertId;
   } catch(err) {
        //undos previous queries if one fails
        await conn.rollback();
        throw err;
   } finally {
        conn.release()
   }
};


//TODO: updateResident()
const updateResident = async(data) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        //check if the resident that is being edited exists
        console.log(data.resident_id);
        const [rows] = await conn.query(
            `SELECT person_id
             FROM Resident
             WHERE resident_id = ?`,
            [data.resident_id]
        );

        if(rows.length === 0) {
             throw new Error('Resident not found');
        }

        await conn.query(
            `UPDATE Person
             SET first_name = ?,
                 last_name = ?,
                 email = ?,
                 contact_num = ?
             WHERE person_id = ?`,
            [
                data.first_name,
                data.last_name,
                data.email || null,
                data.contact_num || null,
                rows[0].person_id
            ]
        );

        await conn.query(
            `
                UPDATE Resident
                SET residency_start_date = ?,
                    residency_end_date = ?,
                    is_board_member = ?
                WHERE resident_id = ?`, 
            [
                data.residency_start_date || null, 
                data.residency_end_date || null, 
                data.is_board_member,
                data.resident_id
            ]
        );

       if(data.is_board_member === '1') {
            await conn.query(
            `
                UPDATE Board_Member
                SET position = ?,
                    board_start_date = ?,
                    board_end_date = ?
                WHERE resident_id = ?`, 
            [
                data.position, 
                data.board_start_date || null, 
                data.board_end_date || null,
                data.resident_id
            ]
        );
       }

       if(data.is_board_member === '0') {
            await conn.query(
                `DELETE FROM Board_Member
                WHERE resident_id = ?`,
                [data.resident_id]
            );
        }


        await conn.commit();

    } catch(err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

//TODO: deleteResident()
const deleteResident = async(residentId) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();
        
        const[rows] = await conn.query(`
            SELECT person_id
            FROM Resident
            WHERE resident_id = ?`,
            [residentId]
        );

        if(rows.length === 0) {
            throw new Error('Resident not found');
        }

        await conn.query(`
            DELETE FROM Person
            WHERE person_id = ?`,
            [rows[0].person_id]
        )

        await conn.commit();

    } catch(err) {
        await conn.rollback();
        throw err;
    } finally {
        await conn.release();
    }
};

//TODO: 

module.exports = {
    createResident,
    getAllResidents, 
    deleteResident,
    updateResident
}

