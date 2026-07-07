const {pool} = require("../config/db");
const personModel = require("../models/personModel");
const residentModel = require("../models/residentModel");
const boardMemberModel = require("../models/boardMemberModel");


const addBoardMember = async(data) => {

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        //create the board member record
        const board_id = await boardMemberModel.addBoardMember(data, data.resident_id, conn);

        if(!board_id) {
            throw new Error("Failed to create Board Member record");
        }
        
        await conn.commit();
        return board_id;

    } catch(err) {
        await conn.rollback();
        throw err;

    } finally {
        conn.release();
    }
}

const updateBoardMember = async(data) => {

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

         //check if the resident that is being edited exists
        const existingBoardMember = await boardMemberModel.getBoardMemberByResidentId(data.resident_id, conn);

        if(existingBoardMember === null) {
            throw new Error("Board member does not exist!");
        }

        await personModel.updatePerson(data, existingBoardMember.person_id, conn);
        await residentModel.updateResident(data, existingBoardMember.resident_id, conn); 
        await boardMemberModel.updateBoardMember(data, existingBoardMember.board_id, conn);
    
        await conn.commit();
    } catch(err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
   
}

module.exports = {
    addBoardMember, 
    updateBoardMember 
}