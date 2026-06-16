const express              = require('express');
const router               = express.Router();
const employeeController   = require('../controllers/employeeController');

// GET  /employees        → list all employees
// POST /employees        → add an employee           (SPRINT 2+)
// PUT  /employees/:id    → update an employee        (SPRINT 2+)
// DELETE /employees/:id  → remove an employee        (SPRINT 2+)

router.get('/', employeeController.getEmployees);

module.exports = router;
