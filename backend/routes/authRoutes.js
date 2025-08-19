const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const getConnection = require('../config/oracle-connection');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Name, email, phone, and password are required.' });
  }

  try {
    const connection = await getConnection();
    
    // Check if user already exists
    const existingUser = await connection.execute(
      'SELECT * FROM users WHERE email = :email',
      [email],
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );

    if (existingUser.rows.length > 0) {
      await connection.close();
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user with hashed password
    const result = await connection.execute(
      `INSERT INTO users (name, email, phone, password) VALUES (:name, :email, :phone, :password)`,
      [name, email, phone, hashedPassword],
      { autoCommit: true }
    );

    await connection.close();

    // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
      if (!process.env.JWT_SECRET) {
        console.log('⚠️  WARNING: JWT_SECRET not set, using fallback key');
      }
      // Add session version to token
      const sessionVersion = req.app.get('SESSION_VERSION');
      const token = jwt.sign(
        { userId: result.lastRowid, email: email, sessionVersion },
        jwtSecret,
        { expiresIn: '24h' }
      );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { name, email, phone }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Login attempt received for email:', email);

  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    console.log('📡 Connecting to database...');
    const connection = await getConnection();
    
    // Find user by email
    console.log('🔍 Searching for user with email:', email);
    const result = await connection.execute(
      'SELECT * FROM users WHERE email = :email',
      [email],
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );

    console.log('📊 Database query result:', {
      rowsFound: result.rows.length,
      userData: result.rows[0] ? {
        id: result.rows[0].ID,
        name: result.rows[0].NAME,
        email: result.rows[0].EMAIL,
        hasPassword: !!result.rows[0].PASSWORD
      } : null
    });

    await connection.close();

    if (result.rows.length === 0) {
      console.log('❌ User not found with email:', email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Check if password exists (for existing users without passwords)
    if (!user.PASSWORD) {
      console.log('❌ User has no password set');
      return res.status(401).json({ error: 'Please set a password for your account.' });
    }

    // Verify password
    console.log('🔐 Verifying password...');
    
    const isValidPassword = await bcrypt.compare(password, user.PASSWORD);
    
    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    console.log('✅ Password verified successfully');

    // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
      if (!process.env.JWT_SECRET) {
        console.log('⚠️  WARNING: JWT_SECRET not set, using fallback key');
      }
      // Add session version to token
      const sessionVersion = req.app.get('SESSION_VERSION');
      const token = jwt.sign(
        { userId: user.ID, email: user.EMAIL, sessionVersion },
        jwtSecret,
        { expiresIn: '24h' }
      );

    console.log('✅ Login successful, token generated');

    res.json({ 
      message: 'Login successful',
      token,
      user: { 
        id: user.ID,
        name: user.NAME, 
        email: user.EMAIL, 
        phone: user.PHONE 
      }
    });
  } catch (error) {
    console.error('❌ Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const connection = await getConnection();
    
    const result = await connection.execute(
      'SELECT id, name, email, phone FROM users WHERE id = :userId',
      [req.user.userId],
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );

    await connection.close();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user password
router.put('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  try {
    const connection = await getConnection();
    
    // Get current user with password
    const result = await connection.execute(
      'SELECT * FROM users WHERE id = :userId',
      [req.user.userId],
      { outFormat: require('oracledb').OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = result.rows[0];

    // Verify current password
    if (user.PASSWORD) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.PASSWORD);
      if (!isValidPassword) {
        await connection.close();
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await connection.execute(
      'UPDATE users SET password = :password WHERE id = :userId',
      [hashedNewPassword, req.user.userId],
      { autoCommit: true }
    );

    await connection.close();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router; 