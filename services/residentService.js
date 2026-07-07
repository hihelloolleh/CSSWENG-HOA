const {pool} = require("../config/db");
const personModel = require("../models/personModel");
const residentModel = require("../models/residentModel");
const boardMemberModel = require("../models/boardMemberModel");
const propertyModel = require("../models/propertyModel");
const vehicleModel = require("../models/vehicleModel");


const addResident = async(data) => {

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        //check if first and last name is duplicated
        const duplicateName = await personModel.selectPersonByName(data.first_name, data.last_name, data.contact_num, conn);

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

        
        await conn.commit();
        return resident_id;

    } catch(err) {
        await conn.rollback();
        throw err;

    } finally {
        conn.release();
    }
}

const updateResident = async(data) => {

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

         //check if the resident that is being edited exists
        const existingResident = await residentModel.selectPersonByResidentId(data.resident_id, conn);

        if(existingResident === null) {
            throw new Error("Resident does not exist!");
        }

        await personModel.updatePerson(data, existingResident.person_id, conn);
        await residentModel.updateResident(data, conn);
    
        await conn.commit();
    } catch(err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
   
}

const deleteResident = async(resident_id) => {
    const conn = await pool.getConnection();

    try{

        await conn.beginTransaction();

        await residentModel.deleteResident(resident_id, conn);
        console.log(resident_id);
        //get all the properties and vehicles they own
        const properties = await propertyModel.selectPropertiesByResidentId(resident_id, conn);
        console.log(properties);
        const vehicles = await vehicleModel.getAllVehiclesByResident(resident_id, conn);
        console.log(vehicles);

        //delete resident_property given residentid
        for (const p of properties) {
            console.log(p.property_id);
            await propertyModel.deleteResidentProperty(resident_id, p.property_id, conn);
        }
        
         //delete resident_vehicle given residentid
       
        for(const v of vehicles) {
            console.log(v.vehicle_id);
            await vehicleModel.deleteResidentVehicle(resident_id, v.vehicle_id, conn)
        }
        
    

        await conn.commit();

    } catch(err) {
        await conn.rollback();
        throw err;
    } finally {
         conn.release();
    }
}

module.exports = {
    addResident, 
    updateResident,
    deleteResident
}