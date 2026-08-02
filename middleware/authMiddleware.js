// ============================================================
// AUTH MIDDLEWARE
// Reads the logged-in account (if any) off the session and:
//   - attachCurrentUser: makes it available as req.currentUser
//     and res.locals.currentUser on every request (so views like
//     the sidebar can show/hide things by role without every
//     controller having to pass it in manually).
//   - requireAuth: blocks unauthenticated requests, redirecting
//     to /login (or 401 for API/JSON requests).
//   - requireAdmin: blocks anyone who isn't an Admin account
//     (Board Members can log in, but only Admins manage accounts).
// ============================================================

const attachCurrentUser = (req, res, next) => {
    req.currentUser = req.session && req.session.user ? req.session.user : null;
    res.locals.currentUser = req.currentUser;
    next();
};

const requireAuth = (req, res, next) => {
    if (req.currentUser) return next();

    if (req.xhr || (req.headers.accept || '').includes('application/json')) {
        return res.status(401).json({ success: false, message: 'Not logged in.' });
    }
    return res.redirect('/login?error=' + encodeURIComponent('Please log in to continue.'));
};

const requireAdmin = (req, res, next) => {
    if (req.currentUser && req.currentUser.accountType === 'admin') return next();

    if (req.xhr || (req.headers.accept || '').includes('application/json')) {
        return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    if (!req.currentUser) {
        return res.redirect('/login?error=' + encodeURIComponent('Please log in to continue.'));
    }
    return res.status(403).send('Admin access required.');
};

module.exports = { attachCurrentUser, requireAuth, requireAdmin };
