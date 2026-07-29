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

module.exports = { getDelinquencyReportSummary, getDelinquencyReportRows };
