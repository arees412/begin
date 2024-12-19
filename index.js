const chalk = require('chalk');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');


// Database Connection
const database = require('./config');

// Routes
const childRoute = require('./routes/childRoute'); 
const gradeRoute = require('./routes/gradeRoute');
const quizResultRoute = require('./routes/quizResultRoute');
const quizRoute = require('./routes/quizRoute');
const userRoute = require('./routes/userRoute');
const worksheetRoute = require('./routes/worksheetRoute');
const schoolRoute = require('./routes/schoolRoute')

app.use(bodyParser.json());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());

app.use('/api/child', childRoute);
app.use('/api/grade', gradeRoute);
app.use('/api/quiz-result', quizResultRoute);
app.use('/api/quiz', quizRoute);
app.use('/api/user', userRoute);
app.use('/api/worksheet', worksheetRoute);
app.use('/api/school', schoolRoute);


app.listen(port, () => {
    console.log(chalk.green.inverse('LISTENING TO PORT ' + port));
    
})
