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

const deduplicateResidents = (ids, types) => {
    const seen      = new Set();
    const uniqueIds   = [];
    const uniqueTypes = [];
    for (let i = 0; i < ids.length; i++) {
        const key = String(ids[i]);
        if (!seen.has(key)) {
            seen.add(key);
            uniqueIds.push(ids[i]);
            uniqueTypes.push(types[i]);
        }
    }
    return { ids: uniqueIds, types: uniqueTypes };
};

const createProperty = async (data) => {
    const existing = await propertyModel.selectPropertyByLotAndStreet(data.lot_number, data.street_name);
    if (existing) throw new Error('A property with that lot number and street already exists.');

    const { ids, types } = deduplicateResidents(data.resident_ids, data.resident_types);

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const propertyId = await propertyModel.insertProperty(data, conn);

        for (let i = 0; i < ids.length; i++) {
            await propertyModel.insertResidentProperty(ids[i], propertyId, types[i], conn);
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

    const { ids, types } = deduplicateResidents(data.resident_ids, data.resident_types);

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await propertyModel.updatePropertyById(data, conn);

        // Replace all resident associations
        await propertyModel.deleteResidentsByPropertyId(data.property_id, conn);

        for (let i = 0; i < ids.length; i++) {
            await propertyModel.insertResidentProperty(ids[i], data.property_id, types[i], conn);
        }

        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const setOutstandingBalance = async (propertyId, amount) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        await propertyModel.setOutstandingBalance(propertyId, amount, conn);

        // Keep a backing Payment row in sync with the column so this debt is a
        // real, trackable/settleable row like every other purpose — instead of
        // an untracked figure that a later "settle" can drift out of sync with.
        const [[openRow]] = await conn.query(
            `SELECT p.payment_id
             FROM Outstanding_Balance ob
             JOIN Payment p ON ob.payment_id = p.payment_id
             WHERE ob.property_id = ? AND p.amount_paid < p.amount_expected
             ORDER BY p.created_at DESC
             LIMIT 1`,
            [propertyId]
        );

        if (amount > 0) {
            if (openRow) {
                await conn.query(
                    `UPDATE Payment SET amount_expected = ? WHERE payment_id = ?`,
                    [amount, openRow.payment_id]
                );
            } else {
                const [[homeowner]] = await conn.query(
                    `SELECT per.person_id, r.resident_id
                     FROM Resident_Property rp
                     JOIN Resident r   ON rp.resident_id = r.resident_id
                     JOIN Person   per ON r.person_id    = per.person_id
                     WHERE rp.property_id = ? AND rp.type = 'Homeowner'
                     ORDER BY r.resident_id
                     LIMIT 1`,
                    [propertyId]
                );
                if (homeowner) {
                    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
                    const [result] = await conn.query(
                        `INSERT INTO Payment (purpose, amount_expected, amount_paid, date_paid, payment_method, remarks, paid_by)
                         VALUES ('Outstanding Balance', ?, 0, ?, 'Cash', 'Balance set by admin', ?)`,
                        [amount, today, homeowner.person_id]
                    );
                    await conn.query(
                        `INSERT INTO Outstanding_Balance (payment_id, property_id, resident_id) VALUES (?, ?, ?)`,
                        [result.insertId, propertyId, homeowner.resident_id]
                    );
                }
            }
        } else if (openRow) {
            // Clearing the balance resolves the open row rather than deleting
            // it, preserving the payment history / audit trail.
            await conn.query(
                `UPDATE Payment SET amount_paid = amount_expected WHERE payment_id = ?`,
                [openRow.payment_id]
            );
        }

        if (amount > 0) {
            await propertyModel.markResidentsDelinquentForProperty(propertyId, conn);
        } else {
            await propertyModel.clearResidentsDelinquentForProperty(propertyId, conn);
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
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        // AC4: clear delinquent on residents before the property (and its Resident_Property links) are removed
        await propertyModel.clearResidentsDelinquentForProperty(propertyId, conn);
        await propertyModel.deletePropertyById(propertyId, conn);
        await conn.commit();
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

module.exports = {
    getAllProperties,
    getAllResidents,
    getPropertyResidents,
    createProperty,
    updateProperty,
    deleteProperty,
    setOutstandingBalance,
};
