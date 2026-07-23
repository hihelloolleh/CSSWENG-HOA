const paymentLedgerModel = require('../models/paymentLedgerModel');
const propertyModel      = require('../models/propertyModel');
const residentModel      = require('../models/residentModel');
const { pool }           = require('../config/db');

const addPayment = async (data) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const paymentId = await paymentLedgerModel.createPayment(data, conn);

        if (data.purpose === 'Outstanding Balance' && data.property_id) {
            const propertyId = parseInt(data.property_id);
            const amountPaid = parseFloat(data.amount_paid) || 0;

            // Resolve payer's resident_id (paid_by is person_id)
            let residentId = null;
            if (data.paid_by) {
                const r = await residentModel.getResidentIdByPersonId(data.paid_by, conn);
                if (r) residentId = r.resident_id;
            }

            await paymentLedgerModel.createOutstandingBalanceRecord(paymentId, propertyId, residentId, conn);

            const [[prop]] = await conn.query(
                `SELECT outstandingBalance FROM Property WHERE property_id = ?`,
                [propertyId]
            );
            if (prop) {
                const newBalance = Math.max(0, parseFloat(prop.outstandingBalance) - amountPaid);
                await conn.query(
                    `UPDATE Property SET outstandingBalance = ?, hasDues = ? WHERE property_id = ?`,
                    [newBalance, newBalance > 0 ? 1 : 0, propertyId]
                );
                if (newBalance === 0) {
                    await propertyModel.clearResidentsDelinquentForProperty(propertyId, conn);
                }
            }
        }

        await conn.commit();
        return paymentId;
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
