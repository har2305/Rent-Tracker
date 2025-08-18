const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const getConnection = require('../config/oracle-connection');

// POST /expenses
router.post('/', async (req, res) => {
  const { group_id, title, total_amount, category, paid_by } = req.body;

  // Validate required fields except paid_by (optional now)
  if (!group_id || !title || !total_amount) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const connection = await getConnection();

    // Insert expense, paid_by can be null or omitted
    const expenseResult = await connection.execute(
      `INSERT INTO expenses (group_id, title, total_amount, category, created_at, paid_by)
       VALUES (:group_id, :title, :total_amount, :category, SYSDATE, :paid_by)
       RETURNING id INTO :id`,
      {
        group_id,
        title,
        total_amount,
        category,
        paid_by: paid_by || null,  // If undefined/empty, insert null
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: false }
    );

    const expenseId = expenseResult.outBinds.id[0];

    // Get all users in the group to split the expense
    const membersResult = await connection.execute(
      `SELECT user_id FROM group_members WHERE group_id = :group_id`,
      [group_id]
    );

    const members = membersResult.rows.map(row => row[0]);

    if (members.length === 0) {
      await connection.rollback();
      await connection.close();
      return res.status(400).json({ error: 'No members in this group to split expense' });
    }

    const share = total_amount / members.length;

    // Insert expense shares without status, DB defaults it to 'unpaid'
    for (const user_id of members) {
      await connection.execute(
        `INSERT INTO expense_shares (expense_id, user_id, share_amount)
         VALUES (:expense_id, :user_id, :share_amount)`,
        [expenseId, user_id, share]
      );
    }

    await connection.commit();
    await connection.close();

    res.status(201).json({ message: 'Expense added and split successfully' });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /expenses/:group_id
router.get('/:group_id', async (req, res) => {
  const group_id = req.params.group_id;

  try {
    const connection = await getConnection();

    // Get all expenses for the group with paid_by user name if any
    const expenseResult = await connection.execute(
      `SELECT e.id, e.title, e.total_amount, e.category, e.created_at, 
              u.name AS paid_by_name
       FROM expenses e
       LEFT JOIN users u ON e.paid_by = u.id
       WHERE e.group_id = :group_id`,
      [group_id]
    );

    const expenses = expenseResult.rows.map(row => ({
      id: row[0],
      title: row[1],
      total_amount: row[2],
      category: row[3],
      created_at: row[4],
      paid_by: row[5],  // can be null if unpaid
      shares: []
    }));

    // For each expense, get shares with payment status
    for (let expense of expenses) {
      const shareResult = await connection.execute(
        `SELECT s.user_id, u.name, u.email, s.share_amount, s.status
         FROM expense_shares s
         JOIN users u ON s.user_id = u.id
         WHERE s.expense_id = :expense_id`,
        [expense.id]
      );

      expense.shares = shareResult.rows.map(row => ({
        user_id: row[0],
        name: row[1],
        email: row[2],
        share_amount: row[3],
        status: row[4]
      }));
    }

    await connection.close();
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /expenses/:expense_id/pay
router.patch('/:expense_id/pay', async (req, res) => {
  const expense_id = req.params.expense_id;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `UPDATE expense_shares 
       SET status = 'paid' 
       WHERE expense_id = :expense_id AND user_id = :user_id`,
      [expense_id, user_id],
      { autoCommit: true }
    );

    await connection.close();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Expense share not found.' });
    }

    res.json({ message: 'Marked as paid.' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// DELETE /expenses/:id - delete an expense and its shares
router.delete('/:id', async (req, res) => {
  const expenseId = req.params.id;

  const connection = await getConnection();
  try {
    // Delete associated expense_shares first
    await connection.execute(
      `DELETE FROM expense_shares WHERE expense_id = :id`,
      [expenseId],
      { autoCommit: false }
    );

    // Then delete the expense
    const result = await connection.execute(
      `DELETE FROM expenses WHERE id = :id`,
      [expenseId],
      { autoCommit: false }
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense and related shares deleted successfully' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await connection.close();
  }
});

module.exports = router;
