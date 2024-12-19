const database = require('../config');

const express = require('express')
const router = express.Router();




router.post('/register-child', (req, res) => {
    const { parent_id, d_o_b, c_name, g_level, gender } = req.body;

    // Validate input
    if (!parent_id || !d_o_b || !c_name || !g_level || !gender) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // SQL query
    const query = `
        INSERT INTO child_details (PARENT_ID_FK, D_O_B, CHILD_NAME, GRADE_LEVEL, GENDER) 
        VALUES (?, ?, ?, ?, ?)
    `;

    // Execute query
    database.query(query, [parent_id, d_o_b, c_name, g_level, gender], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err.message);
            return res.status(500).json({ error: 'Failed to register child' });
        }
        res.status(200).json({ message: 'Child Registered Successfully', data: result });
    });
});


router.get('/show-child-by-child-id/:child_id', (req, res) => {
    const { child_id } = req.params;

    // Validate input
    if (!child_id) {
        return res.status(400).json({ error: 'Child Id is required' });
    }

    // SQL query with JOIN to fetch grade name
    const query = `
        SELECT *
        FROM 
            child_details
        WHERE 
            ID = ?
    `;

    // Execute query
    database.query(query, [child_id], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: 'Failed to fetch children' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No children found for the given parent ID' });
        }

        res.status(200).json({ message: 'Children fetched successfully', data: results });
    });
});


router.get('/childrens', (req, res) => {
    // SQL query
    const query = `
        SELECT * 
        FROM child_details
    `;

    // Execute query
    database.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: 'Failed to fetch children' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No children found in the database' });
        }

        res.status(200).json({ message: 'Children fetched successfully', data: results });
    });
});



router.get('/show-child-by-parent/:parent_id', (req, res) => {
    const { parent_id } = req.params;
    console.log(parent_id);

    // Validate input
    if (!parent_id) {
        return res.status(400).json({ error: 'Parent ID is required' });
    }

    // SQL query with JOIN to fetch grade name
    const query = `
        SELECT 
            c.ID, 
            c.PARENT_ID_FK, 
            c.D_O_B, 
            c.CHILD_NAME, 
            c.GENDER, 
            g.GRADE_LEVEL 
        FROM 
            child_details AS c
        LEFT JOIN 
            grade_levels AS g
        ON 
            c.GRADE_LEVEL = g.ID
        WHERE 
            c.PARENT_ID_FK = ?
    `;

    // Execute query
    database.query(query, [parent_id], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            return res.status(500).json({ error: 'Failed to fetch children' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No children found for the given parent ID' });
        }

        res.status(200).json({ message: 'Children fetched successfully', data: results });
    });
});

module.exports = router