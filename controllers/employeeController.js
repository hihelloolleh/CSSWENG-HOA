// EMPLOYEE CONTROLLER
// SPRINT 2+: connect all functions to the database via models.

exports.getEmployees = (req, res) => {
    // TODO (SPRINT 2+): QUERY Employee JOIN Person TABLE FROM DB
    const employees = [];

    res.render('employees', {
        title:      'Employees',
        activePage: 'employees',
        employees,
    });
};

exports.createEmployee = (req, res) => {
    // TODO (SPRINT 2+): INSERT INTO Employee TABLE (requires existing person_id)
};

exports.updateEmployee = (req, res) => {
    // TODO (SPRINT 2+): UPDATE Employee TABLE WHERE employee_id = req.params.id
};

exports.deleteEmployee = (req, res) => {
    // TODO (SPRINT 2+): DELETE FROM Employee TABLE WHERE employee_id = req.params.id
};
