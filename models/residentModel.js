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
            p.first_name,
            p.last_name,
            p.email,
            p.contact_num,
            p.birth_date
        FROM Resident r
        JOIN Person p
        ON r.person_id = p.person_id
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
* 3. Ask for the vehicle they own
*   a. Dropdown box filled with the registered vehicles (plate number) from vehicle table
  
    4. Check for duplicates
* 
*/
const createResident = async(data) => {
   const conn = await pool.getConnection(); //wire from app to db

   try{
    
   } catch(err) {

   }
};

//TODO: updateResident()


//TODO: deleteResident()


//TODO: selectByID()


/**
 * TODO: 
 * When user chooses to view more information on resident, 
 * it opens a pop up window and displays a summary of info 
 * containing the following info:
 * 
 * 1. full name
 * 2. properties owned (lot numbers)
 * 3. vehicles owned (plate number)
 * 4. birthday
 * 5. email
 * 6. contact number
 * 7. board member status/position
 * 8. residency start date/end date
 * 
 * 
 */