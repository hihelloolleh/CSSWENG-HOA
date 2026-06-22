const employeeModel = require('../models/employeeModel');

//READ (GET /employees)

const getEmployees = async (req, res) => {
    try {
        const employees = await employeeModel.getAllEmployees();

        return res.render('employees', {
            title: 'Employees',
            activePage: 'employees',
            employees
        });

    } catch (err) {
        console.error('Error fetching employees:', err);
        return res.status(500).send('Failed to load employees');
    }
};

//CREATE (POST /employees)
const createEmployee = async (req, res) => {
    try {
        await employeeModel.createEmployee(req.body);
        return res.redirect('/employees');

    } catch (err) {

        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).send('Email already exists');
        }

        console.error(err);
        return res.status(500).send('Server error');
    }
};

//UPDATE (POST /employees/update)

const updateEmployee = async (req, res) => {
    try {
        await employeeModel.updateEmployee(req.body);
        return res.redirect('/employees');

    } catch (err) {
        console.error('Error updating employee:', err);
        return res.status(500).send('Failed to update employee');
    }
};

//DELETE (DELETE /employees/:id)

const deleteEmployee = async (req, res) => {
    try {
        await employeeModel.deleteEmployee(req.params.id);
        return res.json({ success: true });

    } catch (err) {
        console.error('Error deleting employee:', err);
        return res.status(500).json({ success: false });
    }
};

//EXPORTS

module.exports = {
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
};