const db = require('../config/db');
const pool = db.pool;

/**
 * Fetches all board member records from Board Member table
 * 
 * @returns ALl board member records
 */
const getAllBoardMembers = async() => {
    const [rows] = await pool.query(`
        SELECT 
            board_id,
            position,
            board_start_date,
            board_end_date,
            resident_id
        FROM Board_Member`
    );

    return rows;
}

/**
 * Adds a board member record to Board Member table given
 * an existing resident
 * 
 * A board member must be a resident first
 * 
 * 
 * @param {*} data - Board Member data
 * @returns - The newly generated board member id
 */
const addBoardMember = async(data, resident_id, conn) => {

    const [result] = await conn.query(`
        INSERT INTO Board_Member (position, board_start_date, board_end_date, resident_id)
        VALUES (?, ?, ?, ?)`,
        [
            data.position,
            data.board_start_date || null,
            data.board_end_date || null,
            resident_id
        ]
    );

    return result.insertId;
}

/**
 * Deletes an existing board member record from the Board Member table
 * 
 * @param {*} board_id 
 * @returns - the number of rows deleted
 */
const deleteBoardMember = async(board_id, conn) => {
    
    const [result] = await conn.query(`
        DELETE FROM Board_Member
        WHERE board_id = ?`,
        [board_id]
    );

    return result.affectedRows;
}

/**
 * Updates an existing board member record
 * 
 * @param {*} data 
 * @returns - The number of rows updated
 */
const updateBoardMember = async(data, conn) => {

    const [result] = await pool.query(`
       UPDATE Board_Member
       SET position = ?,
           board_start_date = ?,
           board_end_date = ?
        WHERE board_id = ?`,
        [
            data.position,
            board_start_date || null,
            board_end_date || null,
            data.board_id
        ]
    )

    return result.affectedRows;
}

module.exports = {
    getAllBoardMembers,
    addBoardMember,
    deleteBoardMember, 
    updateBoardMember
};