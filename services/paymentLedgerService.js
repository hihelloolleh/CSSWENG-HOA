const paymentLedgerModel = require('../models/paymentLedgerModel');
const { pool }           = require('../config/db');

const addPayment = async (data) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const id = await paymentLedgerModel.createPayment(data, conn);
        await conn.commit();
        return id;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const updatePayment = async (payment_id, data) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await paymentLedgerModel.updatePayment(payment_id, data, conn);
        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const deletePayment = async (payment_id) => {
    return paymentLedgerModel.deletePayment(payment_id);
};

module.exports = { addPayment, updatePayment, deletePayment };
