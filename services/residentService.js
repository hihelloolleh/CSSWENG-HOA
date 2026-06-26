const {pool} = require("../config/db");
const personModel = require("../models/personModel");
const residentModel = require("../models/residentModel");
const boardMemberModel = require("../models/boardMemberModel");


const addResident = async(data) => {

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        //check if first and last name is duplicated
        const duplicateName = await personModel.selectPersonByName(data.first_name, data.last_name, conn);

        //if duplicateName is not null, then throw error
        if(duplicateName != null) {
            throw new Error("This resident already exists!");
        }

        //create the person record
        const person_id = await personModel.addPerson(data, conn);

        if(!person_id) {
            throw new Error("Failed to create Person record");
        }

        //create the resident record
        const resident_id = await residentModel.addResident(data, person_id, conn);

        if(!resident_id) {
            throw new Error("Failed to create Resident record");
        }

        //If resident is a board member
        if(data.is_board_member === '1') {
            await boardMemberModel.addBoardMember(data, resident_id, conn);
        }
        
        await conn.commit();
        return resident_id;

    } catch(err) {
        await conn.rollback();
        throw err;

    } finally {
        conn.release();
    }
}

module.exports = {
    addResident
}