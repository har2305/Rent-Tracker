const express = require('express');
const router = express.Router();
const getConnection = require('../config/oracle-connection');
const oracledb = require('oracledb');
const auth = require('../middleware/auth');

// POST /groups - Create group and add admin as member
router.post('/', async (req, res) => {
  const { name, admin_id } = req.body;

  if (!name || !admin_id) {
    return res.status(400).json({ error: 'Group name and admin user ID are required.' });
  }

  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO groups (name, admin_id) VALUES (:name, :admin_id) RETURNING id INTO :id`,
      {
        name,
        admin_id,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: false }
    );

    const groupId = result.outBinds.id[0];

    await connection.execute(
      `INSERT INTO group_members (group_id, user_id, role) VALUES (:groupId, :adminId, 'admin')`,
      { groupId, adminId: admin_id }
    );

    await connection.commit();
    res.status(201).json({ message: 'Group created successfully', groupId });
  } catch (error) {
    console.error('Error creating group:', error);
    if (connection) await connection.rollback();
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /groups - List all groups with admin name
router.get('/', async (req, res) => {
  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT g.id, g.name, g.admin_id, u.name AS admin_name
       FROM groups g
       JOIN users u ON g.admin_id = u.id`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /groups/my - List only groups where current user is a member
router.get('/my', auth, async (req, res) => {
  try {
    // Get current user from JWT token
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT DISTINCT g.id, g.name, g.admin_id, u.name AS admin_name, gm.role
       FROM groups g
       JOIN users u ON g.admin_id = u.id
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = :userId`,
      [userId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /groups/:id/details - Group info + members
router.get('/:id/details', async (req, res) => {
  const groupId = req.params.id;

  try {
    const connection = await getConnection();

    const groupResult = await connection.execute(
      `SELECT g.id, g.name, g.admin_id, u.name AS admin_name
       FROM groups g
       JOIN users u ON g.admin_id = u.id
       WHERE g.id = :id`,
      [groupId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (groupResult.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ error: 'Group not found' });
    }

    const membersResult = await connection.execute(
      `SELECT u.id AS user_id, u.name, u.email, u.phone, gm.role, gm.joined_at
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = :groupId`,
      [groupId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();

    const group = groupResult.rows[0];
    group.members = membersResult.rows;

    res.json(group);
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /group_members - Add user to group
router.post('/members', async (req, res) => {
  const { group_id, user_id, role } = req.body;

  if (!group_id || !user_id) {
    return res.status(400).json({ error: 'Group ID and User ID are required.' });
  }

  const userRole = role || 'member';

  try {
    const connection = await getConnection();

    await connection.execute(
      `INSERT INTO group_members (group_id, user_id, role) VALUES (:group_id, :user_id, :role)`,
      { group_id, user_id, role: userRole },
      { autoCommit: true }
    );

    await connection.close();

    res.status(201).json({ message: 'User added to group successfully.' });
  } catch (error) {
    console.error('Error adding user to group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
