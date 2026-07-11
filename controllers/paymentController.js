const PaymentService = require('../services/paymentService');

const PaymentController = {
    getPaymentDashboard: async (req, res) => {
        try {
            const [dues, payments, summary, residents] = await Promise.all([
                PaymentService.getAllDues(),
                PaymentService.getAllPayments(),
                PaymentService.getPaymentSummary(),
                PaymentService.getActiveResidents()
            ]);

            // Ensure summary values are numbers
            const safeSummary = {
                total_collected: parseFloat(summary.total_collected) || 0,
                unpaid_dues: parseInt(summary.unpaid_dues) || 0,
                paid_dues: parseInt(summary.paid_dues) || 0,
                total_unpaid_amount: parseFloat(summary.total_unpaid_amount) || 0
            };

            const monthlyData = await PaymentService.getMonthlyCollection();

            res.render('payments', {
                title: 'Payments',
                activePage: 'payments',
                pageCSS: 'payments.css',
                dues: dues || [],
                payments: payments || [],
                summary: safeSummary,
                residents: residents || [],
                monthlyData: monthlyData || [],
                error: req.query.error || null,
                success: req.query.success || null
            });
        } catch (err) {
            console.error('Error loading payment dashboard:', err);
            res.status(500).send('Failed to load payment dashboard: ' + err.message);
        }
    },

    createDue: async (req, res) => {
        try {
            await PaymentService.createDue(req.body);
            res.redirect('/dues?success=Due+created+successfully');
        } catch (err) {
            console.error('Failed to create due:', err);
            res.redirect(`/dues?error=${encodeURIComponent(err.message)}`);
        }
    },

    updateDue: async (req, res) => {
        try {
            await PaymentService.updateDue(req.params.id, req.body);
            res.redirect('/dues?success=Due+updated+successfully');
        } catch (err) {
            console.error('Failed to update due:', err);
            res.redirect(`/dues?error=${encodeURIComponent(err.message)}`);
        }
    },

    deleteDue: async (req, res) => {
        try {
            await PaymentService.deleteDue(req.params.id);
            res.redirect('/dues?success=Due+deleted+successfully');
        } catch (err) {
            console.error('Failed to delete due:', err);
            res.redirect(`/dues?error=${encodeURIComponent(err.message)}`);
        }
    },

    createPayment: async (req, res) => {
        try {
            await PaymentService.createPayment(req.body);
            res.redirect('/dues?success=Payment+recorded+successfully');
        } catch (err) {
            console.error('Failed to record payment:', err);
            res.redirect(`/dues?error=${encodeURIComponent(err.message)}`);
        }
    },

    updatePayment: async (req, res) => {
        try {
            await PaymentService.updatePayment(req.params.id, req.body);
            res.redirect('/dues?success=Payment+updated+successfully');
        } catch (err) {
            console.error('Failed to update payment:', err);
            res.redirect(`/dues?error=${encodeURIComponent(err.message)}`);
        }
    },

    deletePayment: async (req, res) => {
        try {
            await PaymentService.deletePayment(req.params.id);
            res.redirect('/dues?success=Payment+deleted+successfully');
        } catch (err) {
            console.error('Failed to delete payment:', err);
            res.redirect(`/dues?error=${encodeURIComponent(err.message)}`);
        }
    }
};

module.exports = PaymentController;