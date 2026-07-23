const paymentLedgerModel = require('../models/paymentLedgerModel');
const propertyModel      = require('../models/propertyModel');
const residentModel      = require('../models/residentModel');
const vehicleModel       = require('../models/vehicleModel');
const stickerRateService = require('./stickerRateService');
const { pool }           = require('../config/db');

// AC 3.3: fields required for every payment, regardless of purpose.
const REQUIRED_FIELDS = {
    receipt_number: 'Receipt Number',
    date_paid:      'Date Paid',
    payment_method: 'Payment Method',
    paid_by:        'Resident',
};

const assertRequiredFields = (data) => {
    const missing = Object.entries(REQUIRED_FIELDS)
        .filter(([key]) => !data[key] || String(data[key]).trim() === '')
        .map(([, label]) => label);
    if (missing.length > 0) {
        throw new Error(`The following fields are required: ${missing.join(', ')}.`);
    }
};

// AC 5: date paid cannot be in the future (server-side backstop —
// the form's <input type="date" max="..."> already blocks this client-side).
const assertDateNotFuture = (datePaidStr) => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    if (datePaidStr > today) {
        throw new Error('Date paid cannot be in the future.');
    }
};

const addPayment = async (data) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        let vehicleRateItems = null; // items resolved for Vehicle Sticker payments

        if (data.purpose === 'Vehicle Sticker') {
            assertRequiredFields(data);
            assertDateNotFuture(data.date_paid);

            const vehicleIds = Array.isArray(data.vehicle_ids)
                ? data.vehicle_ids
                : (data.vehicle_ids ? [data.vehicle_ids] : []);

            // amount_expected is never trusted from the client for sticker
            // payments — it's always computed here from the current Rates table.
            const resolved = await stickerRateService.resolveStickerRates(vehicleIds, data.paid_by, conn);
            vehicleRateItems = resolved.items;
            data.amount_expected = resolved.totalAmount;

            // AC 3.1
            const amountPaid = parseFloat(data.amount_paid);
            if (isNaN(amountPaid) || amountPaid < resolved.totalAmount) {
                throw new Error('Amount Paid cannot be less than the Amount Expected.');
            }
        }

        const paymentId = await paymentLedgerModel.createPayment(data, conn);

        if (vehicleRateItems) {
            // AC 4.2: persist which vehicles this payment covers, and flip
            // hasSticker on each one now that the sticker is paid for.
            await paymentLedgerModel.createPaymentVehicleLinks(
                paymentId,
                vehicleRateItems.map(item => ({ vehicle_id: item.vehicle.vehicle_id, rateCategory: item.rateCategory })),
                conn
            );
            const year = new Date().getFullYear();
            for (const item of vehicleRateItems) {
                await vehicleModel.markStickerIssued(item.vehicle.vehicle_id, year, conn);
            }
        }

        if (data.purpose === 'Outstanding Balance' && data.property_id) {
            const propertyId = parseInt(data.property_id);
            const amountPaid = parseFloat(data.amount_paid) || 0;

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
