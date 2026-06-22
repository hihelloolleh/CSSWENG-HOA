const db = require('../config/db');
const pool = db.pool;

const getAllEmployees = async () => {
    const [rows] = await pool.query(`
        SELECT
            e.employee_id,
            e.person_id,
            p.first_name,
            p.last_name,
            p.email,
            p.contact_num,
            e.position,
            e.salary
        FROM Employee e
        JOIN Person p
        ON e.person_id = p.person_id
    `);

    return rows;
};

const createEmployee = async (data) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        let personId;

        const [existingPerson] = await conn.query(
            `SELECT person_id 
             FROM Person 
             WHERE first_name = ? 
               AND last_name = ? 
               AND contact_num = ?`,
            [
                data.first_name,
                data.last_name,
                data.contact_num
            ]
        );

        if (existingPerson.length > 0) {
            personId = existingPerson[0].person_id;
        }

        if (!personId) {
            const [personResult] = await conn.query(
                `INSERT INTO Person (first_name, last_name, email, contact_num)
                 VALUES (?, ?, ?, ?)`,
                [
                    data.first_name,
                    data.last_name,
                    data.email || null,
                    data.contact_num || null
                ]
            );

            personId = personResult.insertId;
        }

        const [empCheck] = await conn.query(
            `SELECT employee_id 
             FROM Employee 
             WHERE person_id = ?`,
            [personId]
        );

        if (empCheck.length > 0) {
            throw new Error('This person is already an employee');
        }

        const [employeeResult] = await conn.query(
            `INSERT INTO Employee 
             (salary, position, employee_start_date, person_id)
             VALUES (?, ?, CURDATE(), ?)`,
            [
                data.salary,
                data.position,
                personId
            ]
        );

        await conn.commit();
        return employeeResult.insertId;

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const updateEmployee = async (data) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [employeeRows] = await conn.query(
            `SELECT person_id
             FROM Employee
             WHERE employee_id = ?`,
            [data.employeeId]
        );

        if (employeeRows.length === 0) {
            throw new Error('Employee not found');
        }

        const personId = employeeRows[0].person_id;

        await conn.query(
            `UPDATE Person
             SET first_name = ?,
                 last_name = ?,
                 email = ?,
                 contact_num = ?
             WHERE person_id = ?`,
            [
                data.first_name,
                data.last_name,
                data.email || null,
                data.contact_num || null,
                personId
            ]
        );

        await conn.query(
            `UPDATE Employee
             SET position = ?,
                 salary = ?
             WHERE employee_id = ?`,
            [
                data.position,
                data.salary,
                data.employeeId
            ]
        );

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

const deleteEmployee = async (employeeId) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [rows] = await conn.query(
            `SELECT person_id
             FROM Employee
             WHERE employee_id = ?`,
            [employeeId]
        );

        if (rows.length === 0) {
            throw new Error('Employee not found');
        }

        const personId = rows[0].person_id;

        await conn.query(
            `DELETE FROM Person
             WHERE person_id = ?`,
            [personId]
        );

        await conn.commit();

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

module.exports = {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
};