const express             = require('express');
const router              = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authController      = require('../controllers/authController');
const accountService      = require('../services/accountService');
const { requireAuth }     = require('../middleware/authMiddleware');

// ── AUTH PAGES (no sidebar — use auth layout) ──────────────────────────────
router.get('/',                (req, res) => res.redirect('/login'));
router.get('/login',           authController.showLogin);
router.post('/login',          authController.login);
router.post('/logout',         authController.logout);
router.get('/logout',          authController.logout);
router.get('/forgot-password', (req, res) => res.render('forgot-password',  { layout: 'layouts/auth', title: 'Forgot Password' }));

// GET /hoa-admin — public "who do I contact for access" page (User Story 4).
// Pulls the Admin contact info that's edited on the Account Management page,
// instead of the previously hardcoded email/phone.
router.get('/hoa-admin', async (req, res) => {
    let adminContact = null;
    try {
        adminContact = await accountService.getAdminContactInfo();
    } catch (err) {
        console.error('Failed to load admin contact info:', err);
    }
    res.render('hoa-admin', {
        layout: 'layouts/auth',
        title: 'HOA Admin',
        adminContact: adminContact || {},
    });
});

// ── DASHBOARD ──────────────────────────────────────────────────────────────
router.get('/dashboard', requireAuth, dashboardController.getDashboard);

module.exports = router;
