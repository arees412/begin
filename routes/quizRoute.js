const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const database = require('../config');
const { v4: uuidv4 } = require('uuid');

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
        // Generate a unique filename using timestamp, UUID, and random string
        const uniqueSuffix = Date.now() + '-' + uuidv4(); // Use timestamp + UUID for uniqueness
        const fileExtension = path.extname(file.originalname); // Get the file extension
    
        // Combine the unique parts to form the final filename
        cb(null, uniqueSuffix + fileExtension);
    }
});
const upload = multer({ storage });








// Route to fetch all questions
router.get('/all/grade/:grade', (req, res) => {
    // SQL query to fetch all questions
    const query = `
        SELECT * 
        FROM quiz_questions WHERE grade_level = ${req.params.grade}
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
router.delete('/delete/:id', (req, res) => {
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


// Route to insert a new quiz question
router.post(
    '/add/grade/:grade',
    upload.fields([
        { name: 'question_image', maxCount: 1 },
        { name: 'option_a_image', maxCount: 1 },
        { name: 'option_b_image', maxCount: 1 },
        { name: 'option_c_image', maxCount: 1 },
        { name: 'option_d_image', maxCount: 1 },
    ]),
    (req, res) => {
        const {
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
        } = req.body;
        const { grade } = req.params;

        console.log('Grade level:', grade);

        // Extract file paths
        const question_image = req.files['question_image']?.[0]?.path || null;
        const option_a_image = req.files['option_a_image']?.[0]?.path || null;
        const option_b_image = req.files['option_b_image']?.[0]?.path || null;
        const option_c_image = req.files['option_c_image']?.[0]?.path || null;
        const option_d_image = req.files['option_d_image']?.[0]?.path || null;

        // SQL query to insert data into the database
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

        console.log('SQL Query:', query);

        // Execute the query
        database.query(
            query,
            [
                grade,
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
                correct_option,
            ],
            (err, result) => {
                if (err) {
                    console.error('Error inserting question:', err.message);
                    return res.status(500).json({ error: 'Failed to insert question' });
                }

                console.log('Database Insert Result:', result);
                res.status(201).json({ message: 'Question added successfully', questionId: result.insertId });
            }
        );
    }
);


router.post(
    '/update/:id',
    upload.fields([
        { name: 'question_image', maxCount: 1 },
        { name: 'option_a_image', maxCount: 1 },
        { name: 'option_b_image', maxCount: 1 },
        { name: 'option_c_image', maxCount: 1 },
        { name: 'option_d_image', maxCount: 1 },
    ]),
    (req, res) => {
        const { id } = req.params;
        const {
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
        } = req.body;

        const question_image = req.files['question_image']?.[0]?.path || null;
        const option_a_image = req.files['option_a_image']?.[0]?.path || null;
        const option_b_image = req.files['option_b_image']?.[0]?.path || null;
        const option_c_image = req.files['option_c_image']?.[0]?.path || null;
        const option_d_image = req.files['option_d_image']?.[0]?.path || null;

        // Build dynamic update query
        const fields = [];
        const values = [];
        if (question) fields.push('question = ?'), values.push(question);
        if (question_image) fields.push('question_image = ?'), values.push(question_image);
        if (option_a) fields.push('option_a = ?'), values.push(option_a);
        if (option_a_image) fields.push('option_a_image = ?'), values.push(option_a_image);
        if (option_b) fields.push('option_b = ?'), values.push(option_b);
        if (option_b_image) fields.push('option_b_image = ?'), values.push(option_b_image);
        if (option_c) fields.push('option_c = ?'), values.push(option_c);
        if (option_c_image) fields.push('option_c_image = ?'), values.push(option_c_image);
        if (option_d) fields.push('option_d = ?'), values.push(option_d);
        if (option_d_image) fields.push('option_d_image = ?'), values.push(option_d_image);
        if (correct_option) fields.push('correct_option = ?'), values.push(correct_option);

        values.push(id);

        const query = `UPDATE quiz_questions SET ${fields.join(', ')} WHERE id = ?`;

        database.query(query, values, (err, result) => {
            if (err) {
                console.error('Error updating question:', err.message);
                return res.status(500).json({ error: 'Failed to update question' });
            }

            res.status(200).json({ message: 'Question updated successfully' });
        });
    }
);


router.get('/question/:id', (req, res) => {
    const { id } = req.params;

    // Validate input
    if (!id) {
        return res.status(400).json({ error: 'Question ID is required' });
    }

    // SQL query to fetch question by ID
    const query = `
        SELECT 
            id, 
            grade_level, 
            question, 
            question_image, 
            option_a, option_a_image, 
            option_b, option_b_image, 
            option_c, option_c_image, 
            option_d, option_d_image, 
            correct_option 
        FROM quiz_questions 
        WHERE id = ?
    `;

    // Execute query
    database.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching question:', err.message);
            return res.status(500).json({ error: 'Failed to fetch question' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Return the fetched question
        res.status(200).json({ message: 'Question fetched successfully', data: results[0] });
    });
});






module.exports = router
