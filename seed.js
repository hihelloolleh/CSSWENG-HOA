require('dotenv').config();
const { pool, createTables } = require('./config/db');

async function seed() {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // ── Clear existing data (order matters for FK constraints) ────────────
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        await conn.query('TRUNCATE TABLE Resident_Vehicle');
        await conn.query('TRUNCATE TABLE Resident_Property');
        await conn.query('TRUNCATE TABLE Board_Member');
        await conn.query('TRUNCATE TABLE Resident');
        await conn.query('TRUNCATE TABLE Employee');
        await conn.query('TRUNCATE TABLE Vehicle');
        await conn.query('TRUNCATE TABLE Property');
        await conn.query('TRUNCATE TABLE Person');
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');

        // ── Persons ───────────────────────────────────────────────────────────
        const persons = [
            // Residents
            ['Clark',   'Kent',      'Jerome',    null,  '1978-06-18', 'clark.kent@dailyplanet.com',    '09171234501'],
            ['Lois',    'Lane',       'Marie',    null,  '1980-03-10', 'lois.lane@dailyplanet.com',     '09181234502'],
            ['Bruce',   'Wayne',      'Thomas',   null,  '1972-02-19', 'bruce.wayne@waynetech.com',     '09191234503'],
            ['Diana',   'Prince',     'Hippolyta',null,  '1985-07-01', 'diana.prince@themyscira.com',   '09171234504'],
            ['Barry',   'Allen',      'Henry',    null,  '1990-09-30', 'barry.allen@ccpd.com',          '09181234505'],
            ['Arthur',  'Curry',      'Joseph',   null,  '1986-01-29', 'arthur.curry@atlantis.com',     '09191234506'],
            ['Hal',     'Jordan',     'Martin',   null,  '1982-02-20', 'hal.jordan@oa.com',             '09171234507'],
            ['Victor',  'Stone',      'Silas',    null,  '1995-06-29', 'victor.stone@star-labs.com',    '09181234508'],
            ['Oliver',  'Queen',      'Robert',   null,  '1975-05-16', 'oliver.queen@queencons.com',    '09191234509'],
            ['Zatanna', 'Zatara',     'Giovanni', null,  '1988-11-05', 'zatanna@magicworldtour.com',    '09171234510'],
            ['John',    'Constantine','Francis',  null,  '1983-05-10', 'john.c@hellblazer.com',         '09181234511'],
            ['Selina',  'Kyle',       'Rose',     null,  '1979-03-17', 'selina.kyle@gotham.com',        '09191234512'],
            // Employees (non-residents)
            ['Alfred',  'Pennyworth', 'Beagle',   null,  '1950-04-16', 'alfred@waynemanor.com',         '09171234513'],
            ['Amanda',  'Waller',     'Blake',    null,  '1965-11-22', 'a.waller@argus.gov',            '09181234514'],
            ['James',   'Gordon',     'Worthington',null, '1960-08-05','j.gordon@gcpd.com',             '09191234515'],
        ];

        const personIds = [];
        for (const [first, last, middle, suffix, dob, email, contact] of persons) {
            const [r] = await conn.query(
                `INSERT INTO Person (first_name, last_name, middle_name, suffix, birth_date, email, contact_num)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [first, last, middle, suffix, dob, email, contact]
            );
            personIds.push(r.insertId);
        }

        // ── Residents (first 12 persons) ──────────────────────────────────────
        const residentData = [
            [personIds[0],  '2015-01-10', null],
            [personIds[1],  '2016-03-22', null],
            [personIds[2],  '2018-06-15', null],
            [personIds[3],  '2019-09-01', null],
            [personIds[4],  '2010-04-30', null],
            [personIds[5],  '2021-11-12', null],
            [personIds[6],  '2008-07-05', null],
            [personIds[7],  '2017-02-18', null],
            [personIds[8],  '2013-08-27', null],
            [personIds[9],  '2020-05-09', null],
            [personIds[10], '2022-01-03', null],
            [personIds[11], '2014-10-16', '2023-06-30'], // ended residency
        ];

        const residentIds = [];
        for (const [personId, start, end] of residentData) {
            const [r] = await conn.query(
                `INSERT INTO Resident (person_id, residency_start_date, residency_end_date) VALUES (?, ?, ?)`,
                [personId, start, end]
            );
            residentIds.push(r.insertId);
        }

        // ── Properties ────────────────────────────────────────────────────────
        const properties = [
            ['101', 'House', 'Alabastro'],
            ['102', 'House', 'Alabastro'],
            ['205', 'House', 'Cameo'],
            ['206', 'Lot',   'Cameo'],
            ['310', 'House', 'Coral'],
            ['415', 'House', 'Diamante'],
            ['416', 'Lot',   'Diamante'],
            ['520', 'House', 'Esmeralda'],
        ];

        const propertyIds = [];
        for (const [lot, type, street] of properties) {
            const [r] = await conn.query(
                `INSERT INTO Property (lot_number, property_type, street_name) VALUES (?, ?, ?)`,
                [lot, type, street]
            );
            propertyIds.push(r.insertId);
        }

        // ── Resident_Property ─────────────────────────────────────────────────
        const residentProperties = [
            [residentIds[0],  propertyIds[0], 'Homeowner'],
            [residentIds[1],  propertyIds[0], 'Relative'],
            [residentIds[2],  propertyIds[1], 'Homeowner'],
            [residentIds[3],  propertyIds[2], 'Homeowner'],
            [residentIds[4],  propertyIds[2], 'Relative'],
            [residentIds[5],  propertyIds[3], 'Lessee'],
            [residentIds[6],  propertyIds[4], 'Homeowner'],
            [residentIds[7],  propertyIds[4], 'Helper'],
            [residentIds[8],  propertyIds[5], 'Homeowner'],
            [residentIds[9],  propertyIds[6], 'Lessee'],
            [residentIds[10], propertyIds[7], 'Homeowner'],
            [residentIds[11], propertyIds[7], 'Relative'],
        ];

        for (const [resId, propId, type] of residentProperties) {
            await conn.query(
                `INSERT INTO Resident_Property (resident_id, property_id, type) VALUES (?, ?, ?)`,
                [resId, propId, type]
            );
        }

        // ── Board Members ─────────────────────────────────────────────────────
        const boardMembers = [
            [residentIds[0], 'President',      '2022-01-01', null],
            [residentIds[2], 'Vice President', '2022-01-01', null],
            [residentIds[4], 'Treasurer',      '2022-01-01', null],
            [residentIds[6], 'Admin',          '2022-01-01', null],
            [residentIds[8], 'Board Member',   '2020-01-01', '2022-12-31'], // past term
        ];

        for (const [resId, position, start, end] of boardMembers) {
            await conn.query(
                `INSERT INTO Board_Member (resident_id, position, board_start_date, board_end_date) VALUES (?, ?, ?, ?)`,
                [resId, position, start, end]
            );
        }

        // ── Employees ─────────────────────────────────────────────────────────
        const employees = [
            [personIds[12], 18000.00, 'Security Guard', '2019-06-01', null],
            [personIds[13], 22000.00, 'Secretary',      '2020-03-15', null],
            [personIds[14], 20000.00, 'Maintenance',    '2018-09-01', null],
        ];

        for (const [personId, salary, position, start, end] of employees) {
            await conn.query(
                `INSERT INTO Employee (person_id, salary, position, employee_start_date, employee_end_date) VALUES (?, ?, ?, ?, ?)`,
                [personId, salary, position, start, end]
            );
        }

        // ── Vehicles ──────────────────────────────────────────────────────────
        const vehicles = [
            ['Car',        'ABC 1234', 'White',  'Toyota',  'Vios',        2023],
            ['Car',        'XYZ 5678', 'Black',  'Honda',   'City',        2022],
            ['Motorcycle', 'MTR 001',  'Red',    'Yamaha',  'Mio',         2021],
            ['Car',        'DEF 9012', 'Silver', 'Mitsubishi','Montero',   2023],
            ['E-Bike',     null,       'Blue',   'Generic', 'E-Bike',      2022],
        ];

        const vehicleIds = [];
        for (const [type, plate, color, make, model, year] of vehicles) {
            const [r] = await conn.query(
                `INSERT INTO Vehicle (type, plate_number, color, make, model, sticker_year) VALUES (?, ?, ?, ?, ?, ?)`,
                [type, plate, color, make, model, year]
            );
            vehicleIds.push(r.insertId);
        }

        // ── Resident_Vehicle ──────────────────────────────────────────────────
        const residentVehicles = [
            [residentIds[0], vehicleIds[0]],
            [residentIds[2], vehicleIds[1]],
            [residentIds[4], vehicleIds[2]],
            [residentIds[6], vehicleIds[3]],
            [residentIds[8], vehicleIds[4]],
        ];

        for (const [resId, vehId] of residentVehicles) {
            await conn.query(
                `INSERT INTO Resident_Vehicle (resident_id, vehicle_id) VALUES (?, ?)`,
                [resId, vehId]
            );
        }

        await conn.commit();
        console.log('✓ Seed complete.');
        console.log(`  ${personIds.length} persons`);
        console.log(`  ${residentIds.length} residents`);
        console.log(`  ${propertyIds.length} properties`);
        console.log(`  ${boardMembers.length} board members`);
        console.log(`  ${employees.length} employees`);
        console.log(`  ${vehicleIds.length} vehicles`);

    } catch (err) {
        await conn.rollback();
        console.error('Seed failed:', err.message);
    } finally {
        conn.release();
        await pool.end();
    }
}

createTables().then(seed);
