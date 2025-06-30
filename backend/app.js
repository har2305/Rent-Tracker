const express = require('express');
const cors = require('cors');     
const getConnection = require('./config/oracle-connection');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const groupMembersRoutes = require('./routes/groupMembersRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000'      // ⬅️ Allow frontend origin
}));

app.use(bodyParser.json()); // ⬅️ To parse JSON bodies
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
});
