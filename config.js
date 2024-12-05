const mysql = require('mysql');
const chalk = require('chalk');

const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'beginwise'
})

database.connect((err) => {
    err ? console.log(chalk.red('ERROR WHILE CONNECTING TO DATABASE')) : console.log(chalk.green.inverse('CONNECTED TO DATABASE'));
})

module.exports = database;