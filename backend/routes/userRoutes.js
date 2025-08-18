const express = require('express');
const router = express.Router();
const getConnection = require('../config/oracle-connection');
const oracledb = require('oracledb');
const auth = require('../middleware/auth');

// POST /users (protected - requires authentication)
router.post('/', auth, async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required.' });
  }

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO users (name, email, phone) VALUES (:name, :email, :phone)`,
      [name, email, phone],
      { autoCommit: true }
    );
    await connection.close();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute('SELECT * FROM users', [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    await connection.close();

    res.json(result.rows);  // Returns an array of users
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;