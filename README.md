# CSSWENG-HOA

MGV-HOA is an application that aids the Marcelo Green Village Phase 5 Homeowners Association administrators and board members automate operations related to residents, properties, employees, vehicles, reports, and finances. 

## Getting Started 

### Prerequisites 
Before starting, ensure you have met the following requirements:

You have installed the latest version of npm and node. If not, follow the instructions from this link: https://www.npmjs.com/get-npm 

You have installed MySQL on your local machine. If not, follow the steps found here: https://dev.mysql.com/doc/workbench/en/wb-installing.html. 

Fork this repository and clone it to your local machine, **OR** download a zip of the repository into your local machine.

## Database 
Create a schema of the database on MySQL Workbench. 

```bash
CREATE SCHEMA hoa_db 
```

Create an .env file with the following variables:

```bash
DB_HOST = 'localhost'
DB_USER = whatever username you use to access MySQL  
DB_PASSWORD = whatever passport you use to access MySQL
DB_NAME = hoa_db
``` 

## Build 
Install the required dependencies by running npm install from the root project directory.

```bash
npm install 
```

Run the application on the terminal. 

```bash
node app.js  
```

Navigate to the link below.  

```bash
http://localhost:3000/
``` 

If you wish to populate the database before running the application, seed the database before running. 

```bash
node seed.js
node app.js 
```

## Built With
* [Node.js](https://nodejs.org/en/docs/) - Server-side runtime environment  
* [Express](https://expressjs.com/en/api.html) - Server-side framework
* [MySQL](https://www.mysql.com/) - Database implementation 


## Authors
* Product Owner: Elisa Pasigan   
* Scrum Master: Rachel Alba 
* Developers: Alwayne Dacanay, Marione Galman, Roy Sandoval, 
* Designers: Natt Abogadie, John Llamas 
* QA Tester: Samantha Cabreros 