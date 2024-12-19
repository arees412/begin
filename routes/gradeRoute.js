const database = require('../config');

const express = require('express')
const router = express.Router();


router.post('/insert', (req, res) => {
    const { grade_level } = req.body;

    // Validate input
    if (!grade_level) {
        return res.status(400).json({ error: 'Grade level is required' });
    }

    // SQL query to insert a grade
    const query = `
        INSERT INTO grades (GRADE_LEVEL) 
        VALUES (?)
    `;

    // Execute query
    database.query(query, [grade_level], (err, result) => {
        if (err) {
            console.error('Error inserting grade:', err.message);
            return res.status(500).json({ error: 'Failed to insert grade' });
        }

        res.status(201).json({ message: 'Grade inserted successfully', gradeId: result.insertId });
    });
});

router.get('/all', (req, res) => {
    // SQL query to fetch all grades
    const query = `
        SELECT * 
        FROM grade_levels
    `;

    // Execute query
    database.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching grades:', err.message);
            return res.status(500).json({ error: 'Failed to fetch grades' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No grades found in the database' });
        }

        res.status(200).json({ message: 'Grades fetched successfully', data: results });
    });
});


module.exports = router;