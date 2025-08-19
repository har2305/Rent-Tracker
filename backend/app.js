const express = require('express');
const cors = require('cors');     
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const getConnection = require('./config/oracle-connection');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const groupMembersRoutes = require('./routes/groupMembersRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 5000;

// Session versioning for fail-safe logout
const SESSION_VERSION = Date.now();
app.set('SESSION_VERSION', SESSION_VERSION);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

app.use(cors({
  origin: 'http://localhost:3000'      // ⬅️ Allow frontend origin
}));

app.use(bodyParser.json()); // ⬅️ To parse JSON bodies

// Authentication routes (with rate limiting)
app.use('/auth', authLimiter, authRoutes);

// Protected routes
app.use('/users', userRoutes); // ⬅️ Our new route
app.use('/groups', groupRoutes);
app.use('/group_members', groupMembersRoutes);
app.use('/expenses', expenseRoutes);

app.get('/', async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute('SELECT * FROM DUAL');
    await connection.close();
    console.log('DB query result:', result.rows);
    res.send(`DB says: ${JSON.stringify(result.rows)}`);
  } catch (error) {
    console.error('Error querying DB:', error);
    res.status(500).send(`Database connection error: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🛡️ SESSION_VERSION: ${SESSION_VERSION}`);
});
