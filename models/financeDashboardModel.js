const { pool } = require('../config/db');

const getFinanceStats = async (fromDate, toDate) => {
    const [[period]] = await pool.query(`
        SELECT
            COALESCE(SUM(amount_paid), 0) AS total_collected,
            COALESCE(SUM(CASE WHEN amount_paid < amount_expected THEN amount_expected - amount_paid ELSE 0 END), 0) AS total_uncollected,
            COUNT(CASE WHEN amount_paid < amount_expected THEN 1 END) AS pending_count,
            COUNT(*) AS transaction_count
        FROM Payment
        WHERE date_paid BETWEEN ? AND ?
    `, [fromDate, toDate]);

    const [[outstanding]] = await pool.query(`
        SELECT COALESCE(SUM(outstandingBalance), 0) AS total
        FROM Property
        WHERE hasDues = 1
    `);

    const [[delinquent]] = await pool.query(`
        SELECT COUNT(*) AS cnt FROM Resident WHERE isDelinquent = 1 AND deleteFlag = 0
    `);

    return {
        periodCollected:    parseFloat(period.total_collected),
        periodUncollected:  parseFloat(period.total_uncollected),
        pendingCount:       period.pending_count,
        transactionCount:   period.transaction_count,
        outstandingDues:    parseFloat(outstanding.total),
        delinquentResidents: delinquent.cnt,
    };
};

const getRecentTransactions = async (fromDate, toDate) => {
    const [rows] = await pool.query(`
        SELECT
            pay.purpose,
            pay.amount_paid,
            pay.amount_expected,
            pay.date_paid,
            CONCAT(per.first_name, ' ', per.last_name) AS payer_name,
            CONCAT('Lot ', prop.lot_number, ' ', prop.street_name) AS address
        FROM Payment pay
        LEFT JOIN Person per ON pay.paid_by = per.person_id
        LEFT JOIN Resident r
               ON per.person_id = r.person_id AND r.residency_end_date IS NULL
        LEFT JOIN Resident_Property rp ON r.resident_id = rp.resident_id
        LEFT JOIN Property prop        ON rp.property_id = prop.property_id
        WHERE pay.date_paid BETWEEN ? AND ?
        ORDER BY pay.created_at DESC
        LIMIT 20
    `, [fromDate, toDate]);
    return rows;
};

module.exports = { getFinanceStats, getRecentTransactions };
