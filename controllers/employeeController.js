const employeeModel = require('../models/employeeModel');
const employeeService = require('../services/employeeService');

// READ (GET /employees)

const getEmployees = async (req, res) => {
    try {
        const employees = await employeeModel.getAllEmployees();

        return res.render('employees', {
            title: 'Employees',
            activePage: 'employees',
            pageCSS: 'employees.css',
            employees
        });

    } catch (err) {
        console.error('Error fetching employees:', err);
        return res.status(500).send('Failed to load employees');
    }
};

// CREATE (POST /employees)

const createEmployee = async (req, res) => {
    try {

        await employeeService.addEmployee(req.body);

        return res.redirect('/employees');

    } catch (err) {

        console.error(err);

        // Business logic errors from the service
        if (err.message === "This employee already exists!") {
            return res.status(400).send(err.message);
        }

        return res.status(500).send('Failed to create employee');
    }
};

// UPDATE (POST /employees/update)

const updateEmployee = async (req, res) => {
    try {

        await employeeService.updateEmployee(req.body);

        return res.redirect('/employees');

    } catch (err) {

        console.error(err);

        if (err.message === "Employee does not exist!") {
            return res.status(404).send(err.message);
        }

        return res.status(500).send('Failed to update employee');
    }
};

// DELETE (DELETE /employees/:id)

const deleteEmployee = async (req, res) => {
    try {

        await employeeService.deleteEmployee(req.params.id);

        return res.json({ success: true });

    } catch (err) {

        console.error(err);

        if (err.message === "Employee does not exist!") {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to delete employee'
        });
    }
};

// EXPORTS

module.exports = {
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
};