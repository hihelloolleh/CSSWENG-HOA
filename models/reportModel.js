const { pool } = require('../config/db');

const getDelinquencyReportSummary = async () => {
    const [[summary]] = await pool.query(`
        SELECT
            COUNT(*)                                                     AS total_delinquent,
            COUNT(CASE WHEN property_type = 'House' THEN 1 END)         AS house_count,
            COUNT(CASE WHEN property_type = 'Lot'   THEN 1 END)         AS lot_count,
            COALESCE(SUM(outstandingBalance), 0)                         AS total_outstanding
        FROM Property
        WHERE hasDues = 1
    `);
    const [[{ total_properties }]] = await pool.query(`SELECT COUNT(*) AS total_properties FROM Property`);

    const delinquencyPct = total_properties > 0
        ? ((summary.total_delinquent / total_properties) * 100).toFixed(0)
        : 0;
    const housePct = summary.total_delinquent > 0
        ? ((summary.house_count / summary.total_delinquent) * 100).toFixed(0)
        : 0;
    const lotPct = summary.total_delinquent > 0
        ? ((summary.lot_count / summary.total_delinquent) * 100).toFixed(0)
        : 0;

    return {
        totalDelinquent:   summary.total_delinquent,
        houseCount:        summary.house_count,
        lotCount:          summary.lot_count,
        totalOutstanding:  parseFloat(summary.total_outstanding),
        totalProperties:   total_properties,
        delinquencyPct,
        housePct,
        lotPct,
    };
};

const getDelinquencyReportRows = async () => {
    const [rows] = await pool.query(`
        SELECT
            p.property_id,
            p.lot_number,
            p.property_type,
            p.street_name,
            p.outstandingBalance,
            COALESCE(
                GROUP_CONCAT(
                    DISTINCT CONCAT(per.last_name, ', ', per.first_name)
                    ORDER BY per.last_name
                    SEPARATOR ' / '
                ),
                '—'
            ) AS owner_names,
            (
                SELECT MAX(pay.date_paid)
                FROM Outstanding_Balance ob2
                JOIN Payment pay ON ob2.payment_id = pay.payment_id
                WHERE ob2.property_id = p.property_id
                  AND pay.date_paid IS NOT NULL
            ) AS last_payment_date
        FROM Property p
        LEFT JOIN Resident_Property rp
               ON p.property_id = rp.property_id AND rp.type = 'Homeowner'
        LEFT JOIN Resident r
               ON rp.resident_id = r.resident_id AND r.isActive = 1
        LEFT JOIN Person per ON r.person_id = per.person_id
        WHERE p.hasDues = 1
        GROUP BY p.property_id, p.lot_number, p.property_type,
                 p.street_name, p.outstandingBalance
        ORDER BY p.street_name, p.lot_number
    `);
    return rows;
};

const getSeniorCitizenRows = async () => {
    const [rows] = await pool.query(`
        SELECT
            per.person_id,
            CONCAT(
                per.last_name, ', ', per.first_name,
                IF(per.middle_name IS NOT NULL AND per.middle_name != '', CONCAT(' ', per.middle_name), ''),
                IF(per.suffix     IS NOT NULL AND per.suffix     != '', CONCAT(' ', per.suffix),     '')
            ) AS full_name,
            per.birth_date,
            TIMESTAMPDIFF(YEAR, per.birth_date, CURDATE()) AS age,
            r.isActive,
            COALESCE(
                GROUP_CONCAT(
                    DISTINCT CONCAT('Lot ', p.lot_number, ' ', p.street_name)
                    ORDER BY p.street_name
                    SEPARATOR '; '
                ),
                '—'
            ) AS address,
            CASE
                WHEN TIMESTAMPDIFF(YEAR, per.birth_date, CURDATE()) >= 60 AND r.isActive = 1 THEN 'active_senior'
                WHEN TIMESTAMPDIFF(YEAR, per.birth_date, CURDATE()) >= 60 AND r.isActive = 0 THEN 'inactive_senior'
                ELSE 'turning_60'
            END AS category
        FROM Person per
        JOIN Resident r ON per.person_id = r.person_id
        LEFT JOIN Resident_Property rp ON r.resident_id = rp.resident_id
        LEFT JOIN Property p ON rp.property_id = p.property_id
        WHERE per.birth_date IS NOT NULL
          AND (
              TIMESTAMPDIFF(YEAR, per.birth_date, CURDATE()) >= 60
              OR (
                  TIMESTAMPDIFF(YEAR, per.birth_date, CURDATE()) < 60
                  AND DATE_ADD(per.birth_date, INTERVAL 60 YEAR)
                      BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 1 YEAR)
              )
          )
        GROUP BY per.person_id, per.first_name, per.last_name,
                 per.middle_name, per.suffix, per.birth_date, r.isActive
        ORDER BY per.last_name, per.first_name
    `);
    return rows;
};

const getSeniorCitizenSummary = async (rows) => {
    const active   = rows.filter(r => r.category === 'active_senior');
    const inactive = rows.filter(r => r.category === 'inactive_senior');
    const turning  = rows.filter(r => r.category === 'turning_60');
    return {
        totalSeniors:   active.length + inactive.length,
        activeCount:    active.length,
        inactiveCount:  inactive.length,
        turningCount:   turning.length,
    };
};

module.exports = {
    getDelinquencyReportSummary,
    getDelinquencyReportRows,
    getSeniorCitizenRows,
    getSeniorCitizenSummary,
};
