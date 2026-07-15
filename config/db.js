const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'hoa_db',
    dateStrings: true
}).promise()


const connectDB = async() => {
    try{
        const conn = await pool.getConnection();
        console.log("Successfully connected to MySQL database!");
        conn.release();
    }catch(err) {
        console.error('Database connection failed!', err);
        throw err;
    }
};

const createTables = async() => {
    try {
        const createPersonTable = `
            CREATE TABLE IF NOT EXISTS Person(
                person_id int AUTO_INCREMENT PRIMARY KEY, 
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR (255) NOT NULL, 
                middle_name VARCHAR(255), 
                suffix VARCHAR(50),
                birth_date DATE,
                email VARCHAR (255),
                contact_num VARCHAR(100)
            );
        `;

        const createEmployeeTable = `
            CREATE TABLE IF NOT EXISTS Employee(
                employee_id INT AUTO_INCREMENT PRIMARY KEY, 
                salary DECIMAL(10, 2),
                position ENUM('Security Guard', 'Maintenance', 'Bookkeeper', 'Secretary', 'Others') NOT NULL,
                employee_start_date DATE,
                employee_end_date DATE,

                person_id INT,
                FOREIGN KEY (person_id) REFERENCES Person(person_id) ON DELETE CASCADE
            );
        `;

        const createResidentTable = `
            CREATE TABLE IF NOT EXISTS Resident(
                resident_id INT AUTO_INCREMENT PRIMARY KEY, 
                residency_start_date DATE,
                residency_end_date DATE,
                isActive BOOLEAN NOT NULL DEFAULT 1,
                deleteFlag BOOLEAN NOT NULL DEFAULT 0,

                person_id INT,
                FOREIGN KEY (person_id) REFERENCES Person(person_id) ON DELETE CASCADE
            );
        
        `;

        const createPropertyTable = `
            CREATE TABLE IF NOT EXISTS Property(
                property_id INT AUTO_INCREMENT PRIMARY KEY,
                lot_number  VARCHAR(20),
                property_type ENUM("House", "Lot") NOT NULL,
                street_name VARCHAR(255)
            );

        `;
        //In order to have a many-many relationship between property and resident
        const createResidentPropertyTable = `
            CREATE TABLE IF NOT EXISTS Resident_Property(
                resident_id INT,
                property_id INT,

                type ENUM ("Homeowner", "Relative", "Helper", "Others", "Lessee") NOT NULL,

                PRIMARY KEY(resident_id, property_id),
                FOREIGN KEY (resident_id) REFERENCES Resident(resident_id) ON DELETE CASCADE,
                FOREIGN KEY (property_id) REFERENCES Property(property_id) ON DELETE CASCADE
            );
        `;

        const createVehicleTable = `
            CREATE TABLE IF NOT EXISTS Vehicle (
                vehicle_id INT AUTO_INCREMENT PRIMARY KEY, 
                type ENUM("Car", "Motorcycle", "E-Bike", "Others"),
                plate_number VARCHAR(10),
                color VARCHAR(255) NOT NULL,
                make VARCHAR(255) NOT NULL,
                model VARCHAR(255) NOT NULL,
                sticker_year YEAR
            );
        
        `;

        //In order to have a many-many relationship between resident and vehicle
        const createResidentVehicleTable = `
            CREATE TABLE IF NOT EXISTS Resident_Vehicle(

                resident_id INT,
                vehicle_id INT,

                PRIMARY KEY(resident_id, vehicle_id),
                FOREIGN KEY (resident_id) REFERENCES Resident(resident_id) ON DELETE CASCADE,
                FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id) ON DELETE CASCADE
            );
        
        `;

        const createBoardMemberTable = `
            CREATE TABLE IF NOT EXISTS Board_Member(
                board_id INT AUTO_INCREMENT PRIMARY KEY, 
                position VARCHAR(100),
                board_start_date DATE,
                board_end_date DATE,

                resident_id INT,
                FOREIGN KEY (resident_id) REFERENCES Resident(resident_id) ON DELETE CASCADE
            );        
        `;

        const createRatesTable = `
            CREATE TABLE IF NOT EXISTS Rates (
                rate_id INT AUTO_INCREMENT PRIMARY KEY,
                rate_category ENUM(
                    'Car', 
                    'Car (More than 6 stickers)', 
                    'Motorcycle', 
                    'Commercial', 
                    'House (Monthly Payment)', 
                    'Lot (Monthly Payment)', 
                    'House (Annual Payment)', 
                    'Lot (Annual Payment)'
                ) NOT NULL UNIQUE,
                amount DECIMAL(10, 2) NOT NULL,
                effective_date DATE NOT NULL,
                end_date DATE DEFAULT NULL
            );
        `;

        // default values for rates
        // IGNORE keyword so it won't seed again if the tables already have data even if db reboots
        const seedDefaultRatesTable = `
            INSERT IGNORE INTO Rates (rate_category, amount, effective_date, end_date) VALUES 
            ('Car', 600.00, CURDATE(), NULL),
            ('Car (More than 6 stickers)', 1000.00, CURDATE(), NULL),
            ('Motorcycle', 370.00, CURDATE(), NULL),
            ('Commercial', 1000.00, CURDATE(), NULL),
            ('House (Monthly Payment)', 800.00, CURDATE(), NULL),
            ('Lot (Monthly Payment)', 200.00, CURDATE(), NULL),
            ('House (Annual Payment)', 8800.00, CURDATE(), NULL),
            ('Lot (Annual Payment)', 2200.00, CURDATE(), NULL);
        `;

        //Executes the SQL queries

        await pool.query(createPersonTable);
        console.log("Successfully created Person table!")

        await pool.query(createEmployeeTable);
        console.log("Successfully created Employee table!")

        await pool.query(createResidentTable);
        console.log("Successfully created Resident table!")

        await pool.query(createPropertyTable);
        console.log("Successfully created Property table!")

        await pool.query(createResidentPropertyTable);
        console.log("Successfully created Resident_Property table!")

        await pool.query(createVehicleTable);
        console.log("Successfully created Vehicle table!")

        await pool.query(createResidentVehicleTable);
        console.log("Successfully created Resident_Vehicle table!")

        await pool.query(createBoardMemberTable);
        console.log("Successfully created Board_Member table!")

        await pool.query(createRatesTable);
        console.log("Successfully created Rates table!")

        await pool.query(seedDefaultRatesTable);
        console.log("Successfully seeded Rates with default values!")

        // Add any columns that were introduced after the tables were first created.
        // INFORMATION_SCHEMA check avoids errors on fresh installs where the column
        // is already present from the CREATE TABLE above.
        const dbName = process.env.DB_NAME || 'hoa_db';
        const missingColumns = [
            { table: 'Person',   column: 'birth_date', definition: 'DATE',         after: 'suffix'      },
            { table: 'Property', column: 'lot_number', definition: 'VARCHAR(20)',   after: 'property_id' },
        ];

        for (const { table, column, definition, after } of missingColumns) {
            const [[{ cnt }]] = await pool.query(
                `SELECT COUNT(*) AS cnt
                 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
                [dbName, table, column]
            );
            if (cnt === 0) {
                await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition} AFTER \`${after}\``);
                console.log(`Migration: added ${column} to ${table}`);
            }
        }

    } catch(err) {
        console.error('Failed to create the database tables', err);
        throw err;
    }
};

module.exports = {
    pool,
    connectDB,
    createTables
};
