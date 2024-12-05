const express = require('express');
const database = require('../config');
const router = express.Router();
const bcrypt = require('bcryptjs');


router.post('/signup', (req, res) => {
  const { user_name, user_password, user_contact } = req.body;

  // Validate input
  if (!user_name || !user_password || !user_contact) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Hash password using bcrypt
  bcrypt.hash(user_password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    // Insert new user into database
    const query = 'INSERT INTO users (ROLE_ID_FK, USERNAME, PASSWORD, CONTACT) VALUES (2, ?, ?, ?)';
    const values = [user_name, hashedPassword, user_contact];

    database.query(query, values, (error, result) => {
      if (error) {
        console.error('Error inserting data: ', error);
        return res.status(500).json({ error: 'Database error' });
      }

      // After successful insert, fetch the new user details
      const userId = result.insertId; // This will give the id of the inserted user
      return res.status(201).json({
        message: 'Registered Successfully',
        user: {
          id: userId,
          username: user_name,
          phone: user_contact,
          password: user_password
        }
      });
    });
  });
});





  router.post('/login', (req, res) => {
    const { user_name, user_password } = req.body;

    // Validate input
    if (!user_name || !user_password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Fetch user from the database
    const query = 'SELECT * FROM users WHERE USERNAME = ?';
    database.query(query, [user_name], (error, result) => {
      if (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ error: 'Database error' });
      }

      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Compare password with the hashed password in the database
      const user = result[0];
      bcrypt.compare(user_password, user.PASSWORD, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Error comparing password' });
        }

        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Return a success response with user details
        return res.status(200).json({
          message: 'Login successful',
          user: {
            id: user.ID,
            username: user.USERNAME,
            phone: user.CONTACT,
            password: user_password
          }
        });
      });
    });
});


router.put('/adminedit', (req, res) => {
  const { id, role_id, username, password, contact } = req.body;

  // Validate required fields
  if (!id || role_id !== 1) {
      return res.status(403).json({ error: 'Unauthorized access' });
  }

  if (!username || !password || !contact) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  // Hash the new password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
          console.error('Error hashing password:', err.message);
          return res.status(500).json({ error: 'Server error' });
      }

      // Update the user's information in the database
      const query = `
          UPDATE users 
          SET USERNAME = ?, PASSWORD = ?, CONTACT = ?
          WHERE ID = ? AND ROLE_ID_FK = 1
      `;

      const values = [username, hashedPassword, contact, id];

      database.query(query, values, (error, result) => {
          if (error) {
              console.error('Error updating user info:', error.message);
              return res.status(500).json({ error: 'Failed to update information' });
          }

          if (result.affectedRows === 0) {
              return res.status(403).json({ error: 'Unauthorized or user not found' });
          }

          res.status(200).json({ message: 'User information updated successfully' });
      });
  });
});



app.put('/edituser/:userId', (req, res) => {
  const { id, role_id, username, password, contact } = req.body;

  

  if (!username || !password || !contact) {
      return res.status(400).json({ error: 'All fields are required' });
  }

  // Hash the new password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
          console.error('Error hashing password:', err.message);
          return res.status(500).json({ error: 'Server error' });
      }

      // Update the user's information in the database
      const query = `
          UPDATE users 
          SET USERNAME = ?, PASSWORD = ?, CONTACT = ?
          WHERE ID = ?
      `;

      const values = [username, hashedPassword, contact, id];

      database.query(query, values, (error, result) => {
          if (error) {
              console.error('Error updating user info:', error.message);
              return res.status(500).json({ error: 'Failed to update information' });
          }

          if (result.affectedRows === 0) {
              return res.status(403).json({ error: 'Unauthorized or user not found' });
          }

          res.status(200).json({ message: 'User information updated successfully' });
      });
  });
});


router.delete('/delete', (req, res) => {
  const { id } = req.body;

  // Validate input
  if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
  }

  // SQL query to delete the user
  const query = `DELETE FROM users WHERE ID = ?`;

  database.query(query, [id], (error, result) => {
      if (error) {
          console.error('Error deleting user:', error.message);
          return res.status(500).json({ error: 'Server error' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ message: 'User deleted successfully' });
  });
});





  


module.exports = router;