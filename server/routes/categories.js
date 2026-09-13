/**
 * ABHA Categories API
 * Master Specification: Active categories vs. Future categories (Coming Soon)
 */

const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const categories = await db.all(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.is_active, c.badge_text, c.display_order,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1 AND p.is_sold_out = 0
      GROUP BY c.id
      ORDER BY c.display_order ASC
    `);

    res.json({
      success: true,
      data: categories.map(c => ({
        ...c,
        is_active: Boolean(c.is_active),
        status: c.is_active ? 'active' : 'coming_soon'
      }))
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
