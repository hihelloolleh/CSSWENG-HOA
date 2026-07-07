const { pool } = require('../config/db');
const propertyModel = require('../models/propertyModel');

const getAllProperties = async () => {
    return await propertyModel.selectAllProperties();
};

const getAllResidents = async () => {
    return await propertyModel.selectAllResidents();
};

const getPropertyResidents = async (propertyId) => {
    return await propertyModel.selectResidentsByPropertyId(propertyId);
};

const createProperty = async (data) => {
    const existing = await propertyModel.selectPropertyByLotAndStreet(data.lot_number, data.street_name);
    if (existing) throw new Error('A property with that lot number and street already exists.');

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const propertyId = await propertyModel.insertProperty(data, conn);

        for (let i = 0; i < data.resident_ids.length; i++) {
            await propertyModel.insertResidentProperty(
                data.resident_ids[i],
                propertyId,
                data.resident_types[i],
                conn
            );
        }

        await conn.commit();
        return propertyId;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const updateProperty = async (data) => {
    const existing = await propertyModel.selectPropertyByLotAndStreet(data.lot_number, data.street_name, data.property_id);
    if (existing) throw new Error('A property with that lot number and street already exists.');

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await propertyModel.updatePropertyById(data, conn);

        // Replace all resident associations
        await propertyModel.deleteResidentsByPropertyId(data.property_id, conn);

        for (let i = 0; i < data.resident_ids.length; i++) {
            await propertyModel.insertResidentProperty(
                data.resident_ids[i],
                data.property_id,
                data.resident_types[i],
                conn
            );
        }

        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const deleteProperty = async (propertyId) => {
    return await propertyModel.deletePropertyById(propertyId);
};

module.exports = {
    getAllProperties,
    getAllResidents,
    getPropertyResidents,
    createProperty,
    updateProperty,
    deleteProperty,
};
