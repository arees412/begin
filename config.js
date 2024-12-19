const mysql = require('mysql');
const chalk = require('chalk');
require('dotenv').config();

const database = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

database.connect((err) => {
    if (err) {
        console.log(chalk.red('ERROR WHILE CONNECTING TO DATABASE'));
    } else {
        console.log(chalk.green.inverse('CONNECTED TO DATABASE'));
    }
});

module.exports = database;
