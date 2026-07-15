const rateModel = require('../models/rateModel');
const { pool } = require('../config/db');

const updateRate = async (rateId, amount) => {

    if (amount === undefined || amount === '' || isNaN(amount) || Number(amount) < 0){
        throw new Error("Invalid Input: Amount must be positive.");
    }

    const conn = await pool.getConnection();

    try{
        await conn.beginTransaction();
        
        await rateModel.updateRate(rateId, amount, conn);

        await conn.commit();

        return true;
    }
    catch (error) {
        await conn.rollback();
        
        throw error;
    }
    finally{
        conn.release();
    }
};

module.exports = {
    updateRate
};