const { pool } = require('../config/db');

module.exports = {

    getActiveRates: async() => {

        const[rows] = await pool.execute('SELECT * FROM rates WHERE end_date IS NULL OR end_date > CURDATE() ORDER BY rate_category ASC');
        return rows;
    },

    updateRate: async (rateId, amount, conn = pool) => {

        await conn.execute('UPDATE Rates SET amount = ? WHERE rate_id = ?', [amount, rateId]);
    }
};



