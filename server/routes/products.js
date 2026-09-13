/**
 * ABHA Products Catalog API
 * Master Specification: Support for 1-of-1 unique artisan pieces, quantity items, and real stock tracking
 */

const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

// 1. Featured Products for Homepage
router.get('/featured', async (req, res, next) => {
  try {
    const db = getDb();
    const products = await db.all(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = 1 AND p.is_active = 1
      ORDER BY p.is_sold_out ASC, p.created_at DESC
      LIMIT 8
    `);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// 2. New Arrivals
router.get('/new-arrivals', async (req, res, next) => {
  try {
    const db = getDb();
    const products = await db.all(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
      ORDER BY p.created_at DESC
      LIMIT 8
    `);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// 3. All Products with Search & Filter
router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const { category, fabric, q, min_price, max_price, in_stock, sort } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (category) {
      sql += ` AND (c.slug = ? OR c.id = ?)`;
      params.push(category, category);
    }

    if (fabric) {
      sql += ` AND p.fabric LIKE ?`;
      params.push(`%${fabric}%`);
    }

    if (min_price) {
      sql += ` AND p.base_price >= ?`;
      params.push(Number(min_price));
    }

    if (max_price) {
      sql += ` AND p.base_price <= ?`;
      params.push(Number(max_price));
    }

    if (in_stock === 'true' || in_stock === '1') {
      sql += ` AND p.is_sold_out = 0 AND p.stock_quantity > 0`;
    }

    if (q) {
      sql += ` AND (p.title LIKE ? OR p.description LIKE ? OR p.fabric LIKE ? OR p.sku LIKE ?)`;
      const queryPattern = `%${q.trim()}%`;
      params.push(queryPattern, queryPattern, queryPattern, queryPattern);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ` ORDER BY p.is_sold_out ASC, p.base_price ASC`;
        break;
      case 'price_desc':
        sql += ` ORDER BY p.is_sold_out ASC, p.base_price DESC`;
        break;
      case 'name_asc':
        sql += ` ORDER BY p.is_sold_out ASC, p.title ASC`;
        break;
      default:
        sql += ` ORDER BY p.is_sold_out ASC, p.created_at DESC`;
        break;
    }

    const products = await db.all(sql, params);
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
});

// 4. Product Details by Slug or ID
router.get('/:slugOrId', async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const db = getDb();

    const product = await db.get(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? OR p.id = ? OR p.sku = ?
    `, [slugOrId, slugOrId, slugOrId]);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const images = await db.all(`
      SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC
    `, [product.id]);

    const reviews = await db.all(`
      SELECT id, customer_name, rating, review_text, created_at, is_verified_buyer
      FROM reviews
      WHERE product_id = ? AND is_approved = 1
      ORDER BY created_at DESC
    `, [product.id]);

    const avgRating = reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({
      success: true,
      data: {
        ...product,
        images: images.length > 0 ? images : [{ image_url: product.primary_image, is_primary: 1, alt_text: product.title }],
        reviews,
        review_count: reviews.length,
        average_rating: avgRating
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
