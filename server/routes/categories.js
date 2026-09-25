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
    try {
      await db.run('ALTER TABLE categories ADD COLUMN image TEXT');
    } catch (e) {
      // Column may already exist
    }

    const categories = await db.all(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.image, c.is_active, c.badge_text, c.display_order,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1 AND p.is_sold_out = 0
      GROUP BY c.id
      ORDER BY c.display_order ASC
    `);

    function resolveImage(c) {
      if (c.image && !c.image.includes('pink-leheriya') && !c.image.includes('chanderi-suit') && !c.image.includes('bandhani-chanderi') && !c.image.includes('cream-lime') && !c.image.includes('teal-geometric')) {
        return c.image;
      }
      const s = (c.slug || '').toLowerCase();
      if (s.includes('saree')) return 'images/categories/cat-sarees.jpg';
      if (s.includes('poshak') || s.includes('rajputi')) return 'images/categories/cat-poshak.jpg';
      if (s.includes('chaniya') || s.includes('lehenga')) return 'images/categories/cat-chaniya.jpg';
      if (s.includes('men') || s.includes('kurta')) return 'images/categories/cat-mens.jpg';
      return 'images/categories/cat-salwar.jpg';
    }

    res.json({
      success: true,
      data: categories.map(c => ({
        ...c,
        image: resolveImage(c),
        is_active: Boolean(c.is_active),
        status: c.is_active ? 'active' : 'coming_soon'
      }))
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
