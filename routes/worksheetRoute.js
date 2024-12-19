const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dbCon = require('../config'); // Replace with your database connection file
const database = require('../config');

const router = express.Router();

// Create uploads directory if it doesn't exist
const createUploadsDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const uploadsDir = path.join(__dirname, '../uploads/worksheets');
createUploadsDir(uploadsDir);

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only images (jpeg/png) and PDFs are allowed'));
        }
        cb(null, true);
    }
});

// API to add a worksheet
router.post('/add', upload.fields([{ name: 'image' }, { name: 'pdf' }]), (req, res) => {
    const { title, grade_level } = req.body;

    if (!title || !grade_level) {
        return res.status(400).json({ error: 'Title and grade_level are required' });
    }

    const imageFile = req.files['image'] ? req.files['image'][0] : null;
    const pdfFile = req.files['pdf'] ? req.files['pdf'][0] : null;

    if (!imageFile || !pdfFile) {
        return res.status(400).json({ error: 'Both image and PDF files are required' });
    }

    const imagePath = path.join('uploads/worksheets', imageFile.filename);
    const pdfPath = path.join('uploads/worksheets', pdfFile.filename);

    const query = `
        INSERT INTO worksheets (image_path, pdf_path, title, grade_level)
        VALUES (?, ?, ?, ?)
    `;
    const values = [imagePath, pdfPath, title, grade_level];

    database.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Worksheet added successfully',
            data: {
                id: result.insertId,
                image_path: imagePath,
                pdf_path: pdfPath,
                title,
                grade_level
            }
        });
    });
});

// API to fetch all worksheets
router.get('/all', (req, res) => {
    const query = `SELECT * FROM worksheets`;

    dbCon.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ data: results });
    });
});


// API to fetch worksheets by grade level
router.get('/get/grade/:grade_level', (req, res) => {
    const { grade_level } = req.params;

    if (!grade_level) {
        return res.status(400).json({ error: 'Grade level is required' });
    }

    const query = `SELECT * FROM worksheets WHERE grade_level = ?`;

    dbCon.query(query, [grade_level], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No worksheets found for this grade level' });
        }

        res.status(200).json({ data: results });
    });
});



router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Worksheet ID is required' });
    }

    // Query to fetch the worksheet paths before deletion
    const fetchQuery = `
        SELECT image_path, pdf_path
        FROM worksheets
        WHERE id = ?
    `;

    database.query(fetchQuery, [id], (err, results) => {
        if (err) {
            console.error('Error fetching worksheet:', err.message);
            return res.status(500).json({ error: 'Failed to fetch worksheet' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Worksheet not found' });
        }

        const { image_path, pdf_path } = results[0];

        // Query to delete the worksheet from the database
        const deleteQuery = `
            DELETE FROM worksheets
            WHERE id = ?
        `;

        database.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Error deleting worksheet:', err.message);
                return res.status(500).json({ error: 'Failed to delete worksheet' });
            }

            // Remove associated files
            if (image_path && fs.existsSync(image_path)) {
                fs.unlinkSync(image_path);
            }

            if (pdf_path && fs.existsSync(pdf_path)) {
                fs.unlinkSync(pdf_path);
            }

            res.status(200).json({ message: 'Worksheet deleted successfully' });
        });
    });
});




router.get('/get/:id', (req, res) => {
    const { id } = req.params;

    // Validate input
    if (!id) {
        return res.status(400).json({ error: 'Worksheet ID is required' });
    }

    // SQL query to fetch worksheet by ID
    const query = `
        SELECT id, title, grade_level, image_path, pdf_path
        FROM worksheets
        WHERE id = ?
    `;

    // Execute the query
    database.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching worksheet:', err.message);
            return res.status(500).json({ error: 'Failed to fetch worksheet' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Worksheet not found' });
        }

        res.status(200).json({
            message: 'Worksheet fetched successfully',
            data: results[0], // Return the first (and only) worksheet
        });
    });
});



router.put('/update/:id', upload.fields([{ name: 'image' }, { name: 'pdf' }]), (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Worksheet ID is required' });
    }

    // Check if new files are uploaded
    const imageFile = req.files['image'] ? req.files['image'][0] : null;
    const pdfFile = req.files['pdf'] ? req.files['pdf'][0] : null;

    // Fetch the existing worksheet data
    const fetchQuery = `SELECT * FROM worksheets WHERE id = ?`;

    database.query(fetchQuery, [id], (fetchErr, results) => {
        if (fetchErr) {
            console.error('Error fetching worksheet:', fetchErr.message);
            return res.status(500).json({ error: 'Failed to fetch worksheet' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Worksheet not found' });
        }

        const existingWorksheet = results[0];
        const updatedImagePath = imageFile ? `uploads/worksheets/${imageFile.filename}` : existingWorksheet.image_path;
        const updatedPdfPath = pdfFile ? `uploads/worksheets/${pdfFile.filename}` : existingWorksheet.pdf_path;

        // Update the worksheet
        const updateQuery = `
            UPDATE worksheets 
            SET title = ?, image_path = ?, pdf_path = ? 
            WHERE id = ?
        `;
        const values = [title || existingWorksheet.title, updatedImagePath, updatedPdfPath, id];

        database.query(updateQuery, values, (updateErr) => {
            if (updateErr) {
                console.error('Error updating worksheet:', updateErr.message);
                return res.status(500).json({ error: 'Failed to update worksheet' });
            }

            res.status(200).json({
                message: 'Worksheet updated successfully',
                data: {
                    id,
                    title: title || existingWorksheet.title,
                    image_path: updatedImagePath,
                    pdf_path: updatedPdfPath,
                },
            });
        });
    });
});


module.exports = router;
