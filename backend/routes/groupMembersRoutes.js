const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const getConnection = require('../config/oracle-connection');

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


module.exports = router;
