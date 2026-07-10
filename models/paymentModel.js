const { pool } = require('../config/db');

const PaymentModel = {
    // ── Dues ──────────────────────────────────────────────────────────────────
    
    getAllDues: async () => {
        const [rows] = await pool.query(`
            SELECT 
                d.due_id,
                d.resident_id,
                d.due_amount,
                d.due_date,
                d.due_type,
                d.description,
                d.is_paid,
                d.created_at,
                CONCAT(p.first_name, ' ', p.last_name) AS resident_name,
                GROUP_CONCAT(DISTINCT CONCAT(pr.lot_number, ' ', pr.street_name) SEPARATOR ', ') AS property
            FROM Dues d
            JOIN Resident r ON d.resident_id = r.resident_id
            JOIN Person p ON r.person_id = p.person_id
            LEFT JOIN Resident_Property rp ON r.resident_id = rp.resident_id
            LEFT JOIN Property pr ON rp.property_id = pr.property_id
            WHERE r.deleteFlag = 0
            GROUP BY d.due_id, p.first_name, p.last_name
            ORDER BY d.due_date DESC, d.is_paid ASC
        `);
        return rows;
    },

    getDuesByResident: async (resident_id) => {
        const [rows] = await pool.query(`
            SELECT 
                d.due_id,
                d.due_amount,
                d.due_date,
                d.due_type,
                d.description,
                d.is_paid,
                d.created_at,
                CONCAT(p.first_name, ' ', p.last_name) AS resident_name
            FROM Dues d
            JOIN Resident r ON d.resident_id = r.resident_id
            JOIN Person p ON r.person_id = p.person_id
            WHERE d.resident_id = ?
            ORDER BY d.due_date DESC
        `, [resident_id]);
        return rows;
    },

    getDueById: async (due_id) => {
        const [rows] = await pool.query(`
            SELECT * FROM Dues WHERE due_id = ?
        `, [due_id]);
        return rows[0];
    },

    createDue: async (data, conn = pool) => {
        const [result] = await conn.query(`
            INSERT INTO Dues (resident_id, due_amount, due_date, due_type, description, is_paid)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            data.resident_id,
            data.due_amount,
            data.due_date,
            data.due_type || 'Monthly',
            data.description || null,
            data.is_paid || false
        ]);
        return result.insertId;
    },

    updateDue: async (due_id, data, conn = pool) => {
        const [result] = await conn.query(`
            UPDATE Dues 
            SET due_amount = ?, due_date = ?, due_type = ?, description = ?, is_paid = ?
            WHERE due_id = ?
        `, [
            data.due_amount,
            data.due_date,
            data.due_type || 'Monthly',
            data.description || null,
            data.is_paid || false,
            due_id
        ]);
        return result.affectedRows;
    },

    markDueAsPaid: async (due_id, conn = pool) => {
        const [result] = await conn.query(`
            UPDATE Dues SET is_paid = TRUE WHERE due_id = ?
        `, [due_id]);
        return result.affectedRows;
    },

    deleteDue: async (due_id) => {
        const [result] = await pool.query(`
            DELETE FROM Dues WHERE due_id = ?
        `, [due_id]);
        return result.affectedRows;
    },

    getAllActiveResidents: async () => {
        const [rows] = await pool.query(`
            SELECT 
                r.resident_id,
                CONCAT(p.first_name, ' ', p.last_name) AS full_name,
                GROUP_CONCAT(DISTINCT CONCAT(pr.lot_number, ' ', pr.street_name) SEPARATOR ', ') AS property
            FROM Resident r
            JOIN Person p ON r.person_id = p.person_id
            LEFT JOIN Resident_Property rp ON r.resident_id = rp.resident_id
            LEFT JOIN Property pr ON rp.property_id = pr.property_id
            WHERE r.isActive = 1 AND r.deleteFlag = 0
            GROUP BY r.resident_id, p.first_name, p.last_name
            ORDER BY p.last_name ASC
        `);
        return rows;
    },

    // ── Payments ─────────────────────────────────────────────────────────────

    getAllPayments: async () => {
        const [rows] = await pool.query(`
            SELECT 
                p.payment_id,
                p.due_id,
                p.resident_id,
                p.amount,
                p.payment_date,
                p.payment_method,
                p.reference_number,
                p.notes,
                p.created_at,
                CONCAT(per.first_name, ' ', per.last_name) AS resident_name,
                d.due_type,
                d.due_amount AS original_due,
                GROUP_CONCAT(DISTINCT CONCAT(pr.lot_number, ' ', pr.street_name) SEPARATOR ', ') AS property
            FROM Payments p
            JOIN Resident r ON p.resident_id = r.resident_id
            JOIN Person per ON r.person_id = per.person_id
            JOIN Dues d ON p.due_id = d.due_id
            LEFT JOIN Resident_Property rp ON r.resident_id = rp.resident_id
            LEFT JOIN Property pr ON rp.property_id = pr.property_id
            WHERE r.deleteFlag = 0
            GROUP BY p.payment_id, per.first_name, per.last_name, d.due_type, d.due_amount
            ORDER BY p.payment_date DESC
        `);
        return rows;
    },

    getPaymentsByResident: async (resident_id) => {
        const [rows] = await pool.query(`
            SELECT 
                p.payment_id,
                p.due_id,
                p.amount,
                p.payment_date,
                p.payment_method,
                p.reference_number,
                p.notes,
                p.created_at,
                d.due_type,
                d.due_amount AS original_due
            FROM Payments p
            JOIN Dues d ON p.due_id = d.due_id
            WHERE p.resident_id = ?
            ORDER BY p.payment_date DESC
        `, [resident_id]);
        return rows;
    },

    createPayment: async (data, conn = pool) => {
        const [result] = await conn.query(`
            INSERT INTO Payments (due_id, resident_id, amount, payment_date, payment_method, reference_number, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            data.due_id,
            data.resident_id,
            data.amount,
            data.payment_date,
            data.payment_method || 'Cash',
            data.reference_number || null,
            data.notes || null
        ]);
        return result.insertId;
    },

    updatePayment: async (payment_id, data, conn = pool) => {
        const [result] = await conn.query(`
            UPDATE Payments 
            SET amount = ?, payment_date = ?, payment_method = ?, reference_number = ?, notes = ?
            WHERE payment_id = ?
        `, [
            data.amount,
            data.payment_date,
            data.payment_method || 'Cash',
            data.reference_number || null,
            data.notes || null,
            payment_id
        ]);
        return result.affectedRows;
    },

    deletePayment: async (payment_id) => {
        const [result] = await pool.query(`
            DELETE FROM Payments WHERE payment_id = ?
        `, [payment_id]);
        return result.affectedRows;
    },

    getPaymentSummary: async () => {
        const [rows] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM Dues WHERE is_paid = FALSE) AS unpaid_dues,
                (SELECT COUNT(*) FROM Dues WHERE is_paid = TRUE) AS paid_dues,
                (SELECT COALESCE(SUM(due_amount), 0) FROM Dues WHERE is_paid = FALSE) AS total_unpaid_amount,
                (SELECT COALESCE(SUM(amount), 0) FROM Payments) AS total_collected
        `);
        return rows[0];
    },

    getMonthlyCollection: async (year = null, month = null) => {
        let query = `
            SELECT 
                DATE_FORMAT(payment_date, '%Y-%m') AS month,
                COUNT(*) AS payment_count,
                SUM(amount) AS total_amount
            FROM Payments
            WHERE 1=1
        `;
        const params = [];
        
        if (year && month) {
            query += ` AND YEAR(payment_date) = ? AND MONTH(payment_date) = ?`;
            params.push(year, month);
        } else if (year) {
            query += ` AND YEAR(payment_date) = ?`;
            params.push(year);
        }
        
        query += ` GROUP BY DATE_FORMAT(payment_date, '%Y-%m') ORDER BY month DESC LIMIT 12`;
        
        const [rows] = await pool.query(query, params);
        return rows;
    }
};

module.exports = PaymentModel;