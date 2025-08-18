const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const getConnection = require('../config/oracle-connection');
const auth = require('../middleware/auth');

// POST /group_members - add user to group
router.post('/', async (req, res) => {
  const { group_id, user_id } = req.body;

  if (!group_id || !user_id) {
    return res.status(400).json({ error: 'Group ID and User ID are required.' });
  }

  try {
    const connection = await getConnection();

    await connection.execute(
      `INSERT INTO group_members (group_id, user_id) VALUES (:group_id, :user_id)`,
      [group_id, user_id],
      { autoCommit: true }
    );

    await connection.close();

    res.status(201).json({ message: 'User added to group successfully' });
  } catch (error) {
    console.error('Error adding user to group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /group_members/:group_id - get all users in a group
router.get('/:group_id', async (req, res) => {
  const group_id = req.params.group_id;

  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT u.id AS user_id, u.name, u.email, u.phone, gm.joined_at
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = :group_id`,
      [group_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching group members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /group_members - remove user from group
router.delete('/', async (req, res) => {
  const { group_id, user_id } = req.body;

  if (!group_id || !user_id) {
    return res.status(400).json({ error: 'Group ID and User ID are required.' });
  }

  try {
    const connection = await getConnection();

    await connection.execute(
      `DELETE FROM group_members WHERE group_id = :group_id AND user_id = :user_id`,
      [group_id, user_id],
      { autoCommit: true }
    );

    await connection.close();

    res.json({ message: 'User removed from group successfully' });
  } catch (error) {
    console.error('Error removing user from group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /group_members/:group_id/:user_id - admin only, removes member and their expenses
router.delete('/:group_id/:user_id', auth, async (req, res) => {
  const group_id = parseInt(req.params.group_id);
  const user_id = parseInt(req.params.user_id);
  const requester_id = req.user.userId;

  if (!group_id || !user_id) {
    return res.status(400).json({ error: 'Group ID and User ID are required.' });
  }

  let connection;
  try {
    connection = await getConnection();

    // Check if requester is group admin
    const adminResult = await connection.execute(
      `SELECT admin_id FROM groups WHERE id = :group_id`,
      [group_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (adminResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ error: 'Group not found.' });
    }
    const admin_id = adminResult.rows[0].ADMIN_ID || adminResult.rows[0].admin_id;
    if (parseInt(admin_id) !== parseInt(requester_id)) {
      await connection.close();
      return res.status(403).json({ error: 'Only group admin can remove members.' });
    }

    // Find all expenses in this group paid by this user
    const expensesResult = await connection.execute(
      `SELECT id FROM expenses WHERE group_id = :group_id AND paid_by = :user_id`,
      [group_id, user_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const expenseIds = expensesResult.rows.map(row => row.ID || row.id);

    // Delete all expense_shares for these expenses
    for (const expenseId of expenseIds) {
      await connection.execute(
        `DELETE FROM expense_shares WHERE expense_id = :expense_id`,
        [expenseId],
        { autoCommit: false }
      );
    }
    // Delete all expenses
    for (const expenseId of expenseIds) {
      await connection.execute(
        `DELETE FROM expenses WHERE id = :expense_id`,
        [expenseId],
        { autoCommit: false }
      );
    }

    // Delete all expense_shares for this user in this group (even if not paid_by)
    await connection.execute(
      `DELETE FROM expense_shares WHERE user_id = :user_id AND expense_id IN (SELECT id FROM expenses WHERE group_id = :group_id)`,
      [user_id, group_id],
      { autoCommit: false }
    );

    // Remove user from group_members
    const result = await connection.execute(
      `DELETE FROM group_members WHERE group_id = :group_id AND user_id = :user_id`,
      [group_id, user_id],
      { autoCommit: false }
    );

    await connection.commit();
    await connection.close();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'User not found in group.' });
    }

    res.json({ message: 'User and their expenses removed from group successfully.' });
  } catch (error) {
    if (connection) await connection.rollback();
    if (connection) await connection.close();
    console.error('Error removing user and expenses from group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
