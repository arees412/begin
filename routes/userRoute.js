const express = require('express');
const database = require('../config'); // Import database connection
const router = express.Router();

// Signup route (no password encryption, username uniqueness check)
router.post('/signup', (req, res) => {
  const { user_name, user_password, user_contact } = req.body;

  // Validate input
  if (!user_name || !user_password || !user_contact) {
    console.log('Missing fields:', { user_name, user_password, user_contact });
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if the username already exists
  const checkQuery = 'SELECT * FROM users WHERE USERNAME = ?';
  database.query(checkQuery, [user_name], (error, result) => {
    if (error) {
      console.error('Error checking username:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.length > 0) {
      // Username already exists
      console.log('Username already taken:', user_name);
      return res.status(401).json({ error: 'Username already taken' });
    }

    // Insert new user into the database (without password encryption)
    const query = 'INSERT INTO users (ROLE_ID_FK, USERNAME, PASSWORD, CONTACT) VALUES (2, ?, ?, ?)';
    const values = [user_name, user_password, user_contact];

    database.query(query, values, (error, result) => {
      if (error) {
        console.error('Error inserting data:', error);
        return res.status(500).json({ error: 'Database error' });
      }

      // After successful insert, fetch the new user details
      const userId = result.insertId; // This will give the id of the inserted user
      console.log('User registered successfully with ID:', userId);

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



router.put('/change-password/:id', (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).send('New password is required');
  }

  const updateSql = 'UPDATE users SET PASSWORD = ? WHERE ID = ?';
  database.query(updateSql, [newPassword, userId], (err, updateResult) => {
    if (err) {
      return res.status(500).send('Failed to update password');
    }

    // Assuming the password update was successful, fetch the updated user data
    const fetchSql = 'SELECT ID, ROLE_ID_FK, USERNAME, PASSWORD, CONTACT FROM users WHERE ID = ?';
    database.query(fetchSql, [userId], (err, results) => {
      if (err) {
        return res.status(500).send('Failed to fetch updated user details');
      }
      if (results.length > 0) {
        res.json({
          message: 'Password updated successfully',
          userData: results[0]  // Assuming you are fetching a single user, return only the first result.
        });
      } else {
        res.status(404).send('User not found');
      }
    });
  });
});





// Login route (compare plain text passwords)
router.post('/login', (req, res) => {
  const { user_name, user_password } = req.body;

  // Validate input
  if (!user_name || !user_password) {
    console.log('Missing login fields:', { user_name, user_password });
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Fetch user from the database
  const query = 'SELECT * FROM users WHERE USERNAME = ? AND ROLE_ID_FK = 2';
  database.query(query, [user_name], (error, result) => {
    if (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.length === 0) {
      console.log('User not found:', user_name);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the plain-text password with the one stored in the database
    const user = result[0];
    if (user_password !== user.PASSWORD) {
      console.log('Password does not match for user:', user_name);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return a success response with user details
    console.log('Login successful for user:', user_name);
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.ID,
        username: user.USERNAME,
        phone: user.CONTACT,
        password: user.PASSWORD
      }
    });
  });
});

// Admin edit route (update user info, no password encryption)
router.put('/adminedit', (req, res) => {
  const { id, role_id, username, password, contact } = req.body;

  // Validate required fields
  if (!id || role_id !== 1) {
    console.log('Unauthorized access attempt with role_id:', role_id);
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  if (!username || !password || !contact) {
    console.log('Missing fields for admin edit:', { username, password, contact });
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Update the user's information in the database (no password encryption)
  const query = `
    UPDATE users 
    SET USERNAME = ?, PASSWORD = ?, CONTACT = ?
    WHERE ID = ? AND ROLE_ID_FK = 1
  `;
  const values = [username, password, contact, id];

  database.query(query, values, (error, result) => {
    if (error) {
      console.error('Error updating user info:', error.message);
      return res.status(500).json({ error: 'Failed to update information' });
    }

    if (result.affectedRows === 0) {
      console.log('User not found or unauthorized attempt for user ID:', id);
      return res.status(403).json({ error: 'Unauthorized or user not found' });
    }

    console.log('User info updated successfully for user ID:', id);
    res.status(200).json({ message: 'User information updated successfully' });
  });
});

// Edit user route (update user info, no password encryption)
router.put('/edituser/:userId', (req, res) => {
  const { id, role_id, username, password, contact } = req.body;

  // Validate input
  if (!username || !password || !contact) {
    console.log('Missing fields for edit user:', { username, password, contact });
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Update the user's information in the database (no password encryption)
  const query = `
    UPDATE users 
    SET USERNAME = ?, PASSWORD = ?, CONTACT = ?
    WHERE ID = ?
  `;
  const values = [username, password, contact, id];

  database.query(query, values, (error, result) => {
    if (error) {
      console.error('Error updating user info:', error.message);
      return res.status(500).json({ error: 'Failed to update information' });
    }

    if (result.affectedRows === 0) {
      console.log('User not found or unauthorized attempt for user ID:', id);
      return res.status(403).json({ error: 'Unauthorized or user not found' });
    }

    console.log('User info updated successfully for user ID:', id);
    res.status(200).json({ message: 'User information updated successfully' });
  });
});

// Delete user route
router.delete('/delete', (req, res) => {
  const { id } = req.body;

  // Validate input
  if (!id) {
    console.log('Missing user ID for deletion');
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Start transaction
  database.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err.message);
      return res.status(500).json({ error: 'Database transaction error' });
    }

    // SQL query to delete the children associated with the parent
    const deleteChildrenQuery = `DELETE FROM child_details WHERE PARENT_ID_FK = ?`;
    
    database.query(deleteChildrenQuery, [id], (error, result) => {
      if (error) {
        console.error('Error deleting children:', error.message);
        return database.rollback(() => {
          res.status(500).json({ error: 'Failed to delete children' });
        });
      }

      // SQL query to delete the user
      const deleteUserQuery = `DELETE FROM users WHERE ID = ?`;

      database.query(deleteUserQuery, [id], (error, result) => {
        if (error) {
          console.error('Error deleting user:', error.message);
          return database.rollback(() => {
            res.status(500).json({ error: 'Failed to delete user' });
          });
        }

        if (result.affectedRows === 0) {
          console.log('User not found with ID:', id);
          return database.rollback(() => {
            res.status(404).json({ error: 'User not found' });
          });
        }

        // Commit the transaction
        database.commit(err => {
          if (err) {
            console.error('Error committing transaction:', err.message);
            return database.rollback(() => {
              res.status(500).json({ error: 'Transaction commit error' });
            });
          }

          console.log('User and children deleted successfully with ID:', id);
          res.status(200).json({ message: 'User and children deleted successfully' });
        });
      });
    });
  });
});



// Login route (compare plain text passwords)
router.post('/loginadmin', (req, res) => {
  const { user_name, user_password } = req.body;

  // Validate input
  if (!user_name || !user_password) {
    console.log('Missing login fields:', { user_name, user_password });
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Fetch user from the database
  const query = 'SELECT * FROM users WHERE USERNAME = ? AND ROLE_ID_FK = 1';
  database.query(query, [user_name], (error, result) => {
    if (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.length === 0) {
      console.log('User not found:', user_name);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the plain-text password with the one stored in the database
    const user = result[0];
    if (user_password !== user.PASSWORD) {
      console.log('Password does not match for user:', user_name);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return a success response with user details
    console.log('Login successful for user:', user_name);
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.ID,
        username: user.USERNAME,
        phone: user.CONTACT,
        password: user.PASSWORD
      }
    });
  });
});


router.get('/all', (req, res) => {
  const query = `SELECT * FROM users WHERE ROLE_ID_FK = 2`;

  database.query(query, (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ data: results });
  });
});

module.exports = router;
