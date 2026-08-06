const { pool } = require('../config/db');

const getStats = async () => {
    const [[residents]]    = await pool.query(`SELECT COUNT(*) AS cnt FROM Resident WHERE residency_end_date IS NULL`);
    const [[properties]]   = await pool.query(`SELECT COUNT(*) AS cnt FROM Property`);
    const [[employees]]    = await pool.query(`SELECT COUNT(*) AS cnt FROM Employee WHERE employee_end_date IS NULL`);
    const [[vehicles]]     = await pool.query(`SELECT COUNT(*) AS cnt FROM Vehicle`);
    const [[finance]]      = await pool.query(`
        SELECT
            COALESCE(SUM(amount_paid), 0) AS total_revenue,
            COALESCE(SUM(CASE WHEN amount_paid < amount_expected THEN amount_expected - amount_paid ELSE 0 END), 0) AS total_collectibles,
            COUNT(CASE WHEN amount_paid < amount_expected THEN 1 END) AS pending_count
        FROM Payment
    `);
    const [[outstanding]]  = await pool.query(`
        SELECT
            COALESCE(SUM(outstandingBalance), 0) AS total_outstanding,
            COUNT(CASE WHEN hasDues = 1 THEN 1 END) AS delinquent_properties
        FROM Property
    `);
    const [[delinquents]]  = await pool.query(`SELECT COUNT(*) AS cnt FROM Resident WHERE isDelinquent = 1`);
    return {
        totalResidents:         residents.cnt,
        totalProperties:        properties.cnt,
        totalEmployees:         employees.cnt,
        totalVehicles:          vehicles.cnt,
        totalRevenue:           parseFloat(finance.total_revenue),
        totalCollectibles:      parseFloat(finance.total_collectibles),
        pendingCount:           finance.pending_count,
        totalOutstanding:       parseFloat(outstanding.total_outstanding),
        delinquentProperties:   outstanding.delinquent_properties,
        delinquentResidents:    delinquents.cnt,
    };
};

const getPropertyStatus = async () => {
    const [[result]] = await pool.query(`
        SELECT
            COUNT(*)                                            AS total,
            COUNT(CASE WHEN property_type = 'House' THEN 1 END) AS houses,
            COUNT(CASE WHEN property_type = 'Lot'   THEN 1 END) AS lots
        FROM Property
    `);
    const total  = result.total;
    const houses = result.houses;
    const lots   = result.lots;
    return {
        total,
        houses,
        lots,
        housesPct: total ? Math.round((houses / total) * 100) : 0,
        lotsPct:   total ? Math.round((lots   / total) * 100) : 0,
    };
};

const getDelinquents = async () => {
    const [rows] = await pool.query(`
        (
            /* ── Outstanding Balance ──────────────────────────────────────────────
               Source of truth is Property.outstandingBalance, NOT payment rows.
               One row per property; show the homeowner. */
            SELECT
                CONCAT(ho.first_name, ' ', ho.last_name)               AS full_name,
                CONCAT('Lot ', prop.lot_number, ' ', prop.street_name) AS address,
                prop_owner.resident_id,
                'Outstanding Balance'                                  AS purpose,
                prop.outstandingBalance                                AS balance,
                (
                    SELECT TIMESTAMPDIFF(MONTH, MIN(COALESCE(pay2.date_paid, DATE(pay2.created_at))), CURDATE())
                    FROM Payment pay2
                    WHERE pay2.paid_by = ho.person_id
                      AND pay2.amount_paid < pay2.amount_expected
                )                                                      AS months_delinquent
            FROM Property prop
            JOIN (
                SELECT p.property_id, MIN(r_h.resident_id) AS resident_id
                FROM Property p
                JOIN Resident_Property rp_h ON p.property_id    = rp_h.property_id  AND rp_h.type = 'Homeowner'
                JOIN Resident          r_h  ON rp_h.resident_id = r_h.resident_id   AND r_h.residency_end_date IS NULL
                GROUP BY p.property_id
            ) prop_owner ON prop.property_id = prop_owner.property_id
            JOIN Resident r  ON prop_owner.resident_id = r.resident_id
            JOIN Person   ho ON r.person_id             = ho.person_id
            WHERE prop.outstandingBalance > 0
        )
        UNION ALL
        (
            /* ── Other payment types (Assoc Dues, Vehicle Sticker, General) ───────
               Group all residents of each property together; show the homeowner. */
            SELECT
                CONCAT(ho.first_name, ' ', ho.last_name)                                          AS full_name,
                CONCAT('Lot ', prop.lot_number, ' ', prop.street_name)                             AS address,
                prop_owner.resident_id,
                GROUP_CONCAT(DISTINCT pay.purpose ORDER BY pay.purpose SEPARATOR ', ')             AS purpose,
                SUM(pay.amount_expected - pay.amount_paid)                                         AS balance,
                TIMESTAMPDIFF(MONTH, MIN(COALESCE(pay.date_paid, DATE(pay.created_at))), CURDATE()) AS months_delinquent
            FROM (
                SELECT p.property_id, MIN(r_h.resident_id) AS resident_id
                FROM Property p
                JOIN Resident_Property rp_h ON p.property_id    = rp_h.property_id  AND rp_h.type = 'Homeowner'
                JOIN Resident          r_h  ON rp_h.resident_id = r_h.resident_id   AND r_h.residency_end_date IS NULL
                GROUP BY p.property_id
            ) prop_owner
            JOIN Property          prop   ON prop_owner.property_id  = prop.property_id
            JOIN Resident          r      ON prop_owner.resident_id  = r.resident_id
            JOIN Person            ho     ON r.person_id             = ho.person_id
            JOIN Resident_Property rp_any ON prop_owner.property_id  = rp_any.property_id
            JOIN Resident          r_any  ON rp_any.resident_id      = r_any.resident_id AND r_any.residency_end_date IS NULL
            JOIN Person            p_any  ON r_any.person_id         = p_any.person_id
            JOIN Payment pay ON pay.paid_by = p_any.person_id
                             AND pay.amount_paid < pay.amount_expected
                             AND pay.purpose <> 'Outstanding Balance'
            GROUP BY prop_owner.property_id, prop_owner.resident_id, prop.lot_number, prop.street_name, ho.first_name, ho.last_name
        )
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
