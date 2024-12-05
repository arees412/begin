const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const database = require('../config');

const router = express.Router();


// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/quiz';

        // Check if the directory exists
        if (!fs.existsSync(uploadPath)) {
            // Create the directory recursively
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath); // Directory to save files
    },
    filename: (req, file, cb) => {
        // Generate a unique filename
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });



// Route to insert a question
app.post(
    '/add',
    upload.fields([
        { name: 'question_image', maxCount: 1 },
        { name: 'option_a_image', maxCount: 1 },
        { name: 'option_b_image', maxCount: 1 },
        { name: 'option_c_image', maxCount: 1 },
        { name: 'option_d_image', maxCount: 1 }
    ]),
    (req, res) => {
        const {
            grade_level,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option
        } = req.body;

        const question_image = req.files['question_image']?.[0]?.path || null;
        const option_a_image = req.files['option_a_image']?.[0]?.path || null;
        const option_b_image = req.files['option_b_image']?.[0]?.path || null;
        const option_c_image = req.files['option_c_image']?.[0]?.path || null;
        const option_d_image = req.files['option_d_image']?.[0]?.path || null;

        // SQL query to insert a question
        const query = `
            INSERT INTO quiz_questions (
                grade_level, question, question_image, 
                option_a, option_a_image, 
                option_b, option_b_image, 
                option_c, option_c_image, 
                option_d, option_d_image, 
                correct_option
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Execute query
        database.query(
            query,
            [
                grade_level,
                question,
                question_image,
                option_a,
                option_a_image,
                option_b,
                option_b_image,
                option_c,
                option_c_image,
                option_d,
                option_d_image,
                correct_option
            ],
            (err, result) => {
                if (err) {
                    console.error('Error inserting question:', err.message);
                    return res.status(500).json({ error: 'Failed to insert question' });
                }

                res.status(201).json({ message: 'Question inserted successfully', questionId: result.insertId });
            }
        );
    }
);

// Route to fetch all questions
app.get('/all', (req, res) => {
    // SQL query to fetch all questions
    const query = `
        SELECT * 
        FROM quiz_questions
    `;

    // Execute query
    database.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching questions:', err.message);
            return res.status(500).json({ error: 'Failed to fetch questions' });
        }

        res.status(200).json({ message: 'Questions fetched successfully', data: results });
    });
});

// Route to delete a question by ID
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;

    // SQL query to delete a question
    const query = `
        DELETE FROM quiz_questions 
        WHERE id = ?
    `;

    // Execute query
    database.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting question:', err.message);
            return res.status(500).json({ error: 'Failed to delete question' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.status(200).json({ message: 'Question deleted successfully' });
    });
});

module.exports = router
