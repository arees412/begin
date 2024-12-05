const express = require('express');
const router = express.Router();
const database = require('../config');

// API to insert a quiz result
router.post('/results', (req, res) => {
    const { child_id, grade_level, score, total_questions, completed_at } = req.body;

    if (!child_id || !grade_level) {
        return res.status(400).json({ error: 'child_id and grade_level are required' });
    }

    const query = `
        INSERT INTO quiz_results (child_id, grade_level, score, total_questions, completed_at)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
        child_id,
        grade_level,
        score || null,
        total_questions || null,
        completed_at || new Date()
    ];

    dbCon.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Quiz result added successfully', result });
    });
});

// API to fetch quiz results by child_id
router.get('/results/:child_id', (req, res) => {
    const { child_id } = req.params;

    const query = `SELECT * FROM quiz_results WHERE child_id = ?`;
    dbCon.query(query, [child_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ data: results });
    });
});

// API to fetch all quiz results
router.get('/results', (req, res) => {
    const query = `SELECT * FROM quiz_results`;

    database.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ data: results });
    });
});

module.exports = router;
