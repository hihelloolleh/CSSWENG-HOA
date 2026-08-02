const AccountService = require('../services/accountService');

const AuthController = {
    // GET /login
    showLogin: (req, res) => {
        // Already logged in? Skip straight past the login page.
        if (req.currentUser) return res.redirect('/dashboard');
        res.render('login', {
            layout: 'layouts/auth',
            title: 'HOA Login',
            error: req.query.error || null,
        });
    },

    // POST /login
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                throw new Error('Username and password are required.');
            }

            // accountType omitted: authenticate() checks Admin first, then
            // BoardMemberAccount, so one login form serves both account types.
            const user = await AccountService.authenticate(username, password, null);
            if (!user) {
                throw new Error('Invalid username or password.');
            }

            req.session.user = user; // { admin_id|account_id, username, email, contact_num, accountType, ... }
            res.redirect('/dashboard');
        } catch (err) {
            res.redirect('/login?error=' + encodeURIComponent(err.message));
        }
    },

    // POST /logout
    logout: (req, res) => {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    },
};

module.exports = AuthController;
