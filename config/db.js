const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'hoa_db'
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
                position ENUM("Security Guard", "Maintenance", "Bookeeper", "Secretary", "Others") NOT NULL, 
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

                person_id INT,
                FOREIGN KEY (person_id) REFERENCES Person(person_id) ON DELETE CASCADE
            );
        
        `;

        const createPropertyTable = `
            CREATE TABLE IF NOT EXISTS Property(
                property_id INT AUTO_INCREMENT PRIMARY KEY, 
                property_type ENUM("House", "Others") NOT NULL,
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
                color VARCHAR(255),
                make VARCHAR(255),
                model VARCHAR(255),
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
