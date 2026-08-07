const express        = require('express');
const session         = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path           = require('path');
const {connectDB, createTables}= require('./config/db')
const { attachCurrentUser, requireAuth, requireAdmin } = require('./middleware/authMiddleware');

const app  = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// VIEW ENGINE — EJS + SHARED LAYOUTS
// ============================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');         // DEFAULT LAYOUT (has sidebar)
app.use(express.static("public"));

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));   // serves /public

// SESSION — backs the login system. SESSION_SECRET should be set in .env
// for production; falls back to a dev-only default otherwise.
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
}));

// Makes req.currentUser / res.locals.currentUser available everywhere
// (public pages included), so views can conditionally show admin-only UI.
app.use(attachCurrentUser);

// ============================================================
// ROUTES
// ============================================================
const indexRoutes               = require('./routes/index');              // handles its own public/protected split (login, hoa-admin, dashboard, ...)
const accountRoutes             = require('./routes/accountRoutes');
const personRoutes              = require('./routes/personRoutes');
const propertyRoutes            = require('./routes/propertyRoutes');
const propertyOwnerRoutes       = require('./routes/propertyOwnerRoutes');
const employeeRoutes            = require('./routes/employeeRoutes');
const vehicleRoutes             = require('./routes/vehicleRoutes');
const stickerRoutes             = require('./routes/stickerRoutes');
const residentRoutes            = require('./routes/residentRoutes'); 
const boardMemberRoutes         = require('./routes/boardMemberRoutes');
const financeDashboardRoutes    = require('./routes/financeDashboardRoutes'); 
const paymentLedgerRoutes       = require('./routes/paymentLedgerRoutes');
const paymentRoutes             = require('./routes/paymentRoutes');
const expenseRoutes             = require('./routes/expenseRoutes');
const rateRoutes                = require('./routes/rateRoutes');
const reportRoutes              = require('./routes/reportRoutes');
const generateReportRoutes      = require('./routes/generateReportRoutes');

// Public routes (login, forgot-password, hoa-admin contact page) live inside
// indexRoutes itself and are NOT gated here.
app.use('/', indexRoutes);

// Everything below requires a logged-in session (Admin or Board Member).
app.use(requireAuth);

// Account management is Admin-only (Board Members can log in, but only
// Admins create/edit/delete admin and board member accounts).
app.use('/accounts', requireAdmin, accountRoutes);

app.use('/persons',             personRoutes);
app.use('/properties',          propertyRoutes);
app.use('/property-owners',     propertyOwnerRoutes);
app.use('/employees',           employeeRoutes);
app.use('/vehicles',            vehicleRoutes);
app.use('/stickers',            stickerRoutes);
app.use('/residents',           residentRoutes); 
app.use('/boardMembers',        boardMemberRoutes);
app.use('/finances',            financeDashboardRoutes);   
app.use('/payments',            paymentLedgerRoutes);
app.use('/dues',                paymentRoutes);
app.use('/expenses',            expenseRoutes);
app.use('/rates',               rateRoutes);
app.use('/reports',             reportRoutes);
app.use('/generate-reports',    generateReportRoutes);

// ============================================================
// DATABSE SETUP AND CONNECTION
// ============================================================

connectDB();
createTables();

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log(`HOA server running -> http://localhost:${PORT}`);
});
