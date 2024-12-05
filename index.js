const chalk = require('chalk');
const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');


// Database Connection
const database = require('./config');

// Routes
const userRoute = require('./routes/userRoute');


app.use(express.json());

app.use(cors());

app.use('/api/user', userRoute);

app.listen(port, () => {
    console.log(chalk.green.inverse('LISTENING TO PORT ' + port));
    
})
