const express = require('express');
const router = express.Router();
const db = require('../db');

// In-memory fallback announcements
let MOCK_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'New Gotri Swap Station Operations Launched',
    description: 'Gotri Zone swapping station is now live with 45 idle fast-swap batteries available 24/7.',
    category: 'General',
    target_audience: 'All Users',
    priority: 'High',
    status: 'Published',
    author: 'Super Admin',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'ann-2',
    title: 'Monsoon Preventive Maintenance Drive',
    description: 'All fleet managers are instructed to complete battery waterproofing checks before 30 July.',
    category: 'Maintenance',
    target_audience: 'Zone Employees',
    priority: 'Medium',
    status: 'Published',
    author: 'Operations Manager',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// GET /api/announcements
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.json({ status: 'success', data: MOCK_ANNOUNCEMENTS });
  }
});

// POST /api/announcements (create announcement)
router.post('/', async (req, res) => {
  const { title, description, category, target_audience, priority, status } = req.body;
  if (!title) {
    return res.status(400).json({ status: 'error', message: 'Announcement title is required' });
  }

  const newAnn = {
    id: `ann-${Date.now()}`,
    title,
    description: description || '',
    category: category || 'General',
    target_audience: target_audience || 'All Users',
    priority: priority || 'Medium',
    status: status || 'Published',
    author: 'Super Admin',
    created_at: new Date().toISOString()
  };

  try {
    const result = await db.query(`
      INSERT INTO announcements (id, title, description, category, target_audience, priority, status, author, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `, [newAnn.id, newAnn.title, newAnn.description, newAnn.category, newAnn.target_audience, newAnn.priority, newAnn.status, newAnn.author]);
    MOCK_ANNOUNCEMENTS.unshift(result.rows[0]);
    res.json({ status: 'success', message: 'Announcement published successfully', data: result.rows[0] });
  } catch (err) {
    MOCK_ANNOUNCEMENTS.unshift(newAnn);
    res.json({ status: 'success', message: 'Announcement published (in-memory)', data: newAnn });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM announcements WHERE id = $1', [id]);
  } catch (_) {}
  MOCK_ANNOUNCEMENTS = MOCK_ANNOUNCEMENTS.filter(a => a.id !== id);
  res.json({ status: 'success', message: 'Announcement deleted successfully' });
});

// POST /api/announcements/clear-all
router.post('/clear-all', async (req, res) => {
  try {
    await db.query('DELETE FROM announcements');
  } catch (_) {}
  MOCK_ANNOUNCEMENTS = [];
  res.json({ status: 'success', message: 'All announcements cleared' });
});

module.exports = router;
