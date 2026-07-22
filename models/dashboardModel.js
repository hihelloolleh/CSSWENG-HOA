const { pool } = require('../config/db');

const getStats = async () => {
    const [[residents]]  = await pool.query(`SELECT COUNT(*) AS cnt FROM Resident WHERE residency_end_date IS NULL`);
    const [[properties]] = await pool.query(`SELECT COUNT(*) AS cnt FROM Property`);
    const [[employees]]  = await pool.query(`SELECT COUNT(*) AS cnt FROM Employee WHERE employee_end_date IS NULL`);
    const [[vehicles]]   = await pool.query(`SELECT COUNT(*) AS cnt FROM Vehicle`);
    const [[finance]]    = await pool.query(`
        SELECT
            COALESCE(SUM(amount_paid), 0) AS total_revenue,
            COALESCE(SUM(CASE WHEN amount_paid < amount_expected THEN amount_expected - amount_paid ELSE 0 END), 0) AS total_collectibles,
            COUNT(CASE WHEN amount_paid < amount_expected THEN 1 END) AS pending_count
        FROM Payment
    `);
    return {
        totalResidents:    residents.cnt,
        totalProperties:   properties.cnt,
        totalEmployees:    employees.cnt,
        totalVehicles:     vehicles.cnt,
        totalRevenue:      parseFloat(finance.total_revenue),
        totalCollectibles: parseFloat(finance.total_collectibles),
        pendingCount:      finance.pending_count,
    };
};

const getPropertyStatus = async () => {
    const [[result]] = await pool.query(`
        SELECT
            COUNT(DISTINCT p.property_id) AS total,
            COUNT(DISTINCT occ.property_id) AS occupied
        FROM Property p
        LEFT JOIN (
            SELECT DISTINCT rp.property_id
            FROM Resident_Property rp
            JOIN Resident r ON rp.resident_id = r.resident_id
            WHERE r.residency_end_date IS NULL
        ) AS occ ON p.property_id = occ.property_id
    `);
    const total    = result.total;
    const occupied = result.occupied;
    const vacant   = total - occupied;
    return {
        total,
        occupied,
        vacant,
        occupiedPct: total ? Math.round((occupied / total) * 100) : 0,
        vacantPct:   total ? Math.round((vacant   / total) * 100) : 0,
    };
};

const getDelinquents = async () => {
    const [rows] = await pool.query(`
        SELECT
            CONCAT(per.first_name, ' ', per.last_name)                                        AS full_name,
            per.contact_num,
            pay.purpose,
            (pay.amount_expected - pay.amount_paid)                                            AS balance,
            GROUP_CONCAT(DISTINCT CONCAT('Lot ', prop.lot_number, ' ', prop.street_name)
                         ORDER BY prop.lot_number SEPARATOR ', ')                              AS address
        FROM Payment pay
        JOIN Person per ON pay.paid_by = per.person_id
        LEFT JOIN Resident res ON per.person_id = res.person_id AND res.residency_end_date IS NULL
        LEFT JOIN Resident_Property rp ON res.resident_id = rp.resident_id
        LEFT JOIN Property prop        ON rp.property_id  = prop.property_id
        WHERE pay.amount_paid < pay.amount_expected
        GROUP BY pay.payment_id, per.person_id
        ORDER BY balance DESC
        LIMIT 8
    `);
    return rows;
};

const getCurrentBoardMembers = async () => {
    const [rows] = await pool.query(`
        SELECT
            bm.position,
            bm.board_start_date,
            CONCAT(p.first_name, ' ', p.last_name) AS full_name,
            p.contact_num,
            p.email
        FROM Board_Member bm
        JOIN Resident r ON bm.resident_id = r.resident_id
        JOIN Person   p ON r.person_id    = p.person_id
        WHERE bm.board_end_date IS NULL
        ORDER BY bm.board_start_date ASC
    `);
    return rows;
};

const getRecentPayments = async () => {
    const [rows] = await pool.query(`
        SELECT
            pay.purpose,
            pay.amount_paid,
            pay.amount_expected,
            pay.date_paid,
            pay.payment_method,
            CONCAT(per.first_name, ' ', per.last_name) AS payer_name
        FROM Payment pay
        LEFT JOIN Person per ON pay.paid_by = per.person_id
        ORDER BY pay.created_at DESC
        LIMIT 6
    `);
    return rows;
};

module.exports = { getStats, getPropertyStatus, getDelinquents, getCurrentBoardMembers, getRecentPayments };
