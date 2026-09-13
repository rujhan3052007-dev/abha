/**
 * ABHA Admin & POS Management API
 * Master Specification: Store Operations, POS Offline Billing, Stock Sync,
 * Review Moderation, and Integration Health Dashboard
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getDb } = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  ROLES,
  ORDER_CHANNELS,
  ORDER_TYPES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  DELIVERY_TYPES,
  INVENTORY_TYPES,
  TRANSACTION_TYPES,
  INTEGRATION_STATUS
} = require('../config/constants');
const { uploadProductImage } = require('../middleware/upload');

// Enforce Owner or Manager access for Admin APIs
router.use(verifyToken);
router.use(requireRole(ROLES.OWNER, ROLES.MANAGER));

// Helper: Log Admin Action
async function logAudit(userId, action, entityType, entityId, details, req) {
  try {
    const db = getDb();
    const id = `aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;
    await db.run(`
      INSERT INTO admin_audit_logs (id, user_id, action, entity_type, entity_id, details_json, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, userId, action, entityType, entityId, JSON.stringify(details || {}), ip]);
  } catch (err) {
    console.error('[Audit Log Error]', err);
  }
}

// 1. Dashboard Overview Metrics
router.get('/dashboard', async (req, res, next) => {
  try {
    const db = getDb();

    const revenueResult = await db.get(`
      SELECT 
        SUM(CASE WHEN payment_status = 'PAID' THEN total_amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN payment_status = 'PAID' AND order_channel = 'ONLINE' THEN total_amount ELSE 0 END) as online_revenue,
        SUM(CASE WHEN payment_status = 'PAID' AND order_channel = 'OFFLINE_POS' THEN total_amount ELSE 0 END) as offline_revenue,
        COUNT(id) as total_orders
      FROM orders
    `);

    const stitchingQueue = await db.get(`
      SELECT COUNT(id) as pending_stitching
      FROM stitching_details
      WHERE stitching_status IN ('QUEUED', 'IN_CUTTING', 'IN_STITCHING', 'FINISHING')
    `);

    const deliveryQueue = await db.get(`
      SELECT COUNT(id) as pending_deliveries
      FROM deliveries
      WHERE delivery_status IN ('PENDING', 'ASSIGNED', 'OUT_FOR_DELIVERY')
    `);

    const inventoryAlerts = await db.all(`
      SELECT id, title, sku, inventory_type, stock_quantity, is_sold_out
      FROM products
      WHERE is_sold_out = 1 OR stock_quantity <= 1
      LIMIT 10
    `);

    const recentOrders = await db.all(`
      SELECT id, order_number, order_channel, order_type, total_amount, order_status, payment_status, created_at, shipping_name
      FROM orders
      ORDER BY created_at DESC
      LIMIT 8
    `);

    res.json({
      success: true,
      data: {
        financials: {
          total_revenue: revenueResult.total_revenue || 0,
          online_revenue: revenueResult.online_revenue || 0,
          offline_revenue: revenueResult.offline_revenue || 0,
          total_orders: revenueResult.total_orders || 0
        },
        stitching_queue_count: stitchingQueue.pending_stitching || 0,
        pending_deliveries_count: deliveryQueue.pending_deliveries || 0,
        inventory_alerts: inventoryAlerts,
        recent_orders: recentOrders
      }
    });
  } catch (err) {
    next(err);
  }
});

// 2. POS Offline Store Billing (Beawar Flagship Terminal)
router.post('/pos/order', async (req, res, next) => {
  try {
    const {
      sku_or_id,
      quantity = 1,
      payment_method = PAYMENT_METHODS.CASH,
      customer_name,
      customer_phone,
      is_stitched = false,
      stitching_config,
      delivery_type = DELIVERY_TYPES.STORE_PICKUP,
      delivery_address
    } = req.body;

    if (!sku_or_id) {
      return res.status(400).json({ success: false, error: 'Product SKU or Barcode is required for POS billing' });
    }

    const db = getDb();
    const product = await db.get(`
      SELECT * FROM products WHERE (sku = ? OR id = ?) AND is_active = 1
    `, [sku_or_id.trim(), sku_or_id.trim()]);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found in store catalog' });
    }

    if (product.is_sold_out || product.stock_quantity <= 0) {
      return res.status(400).json({ success: false, error: `Product "${product.title}" (${product.sku}) is already marked Sold Out!` });
    }

    const unitPrice = Number(product.base_price);
    const stitchingFee = is_stitched ? Number(product.stitching_price || 450) : 0;
    const subtotal = unitPrice * quantity;
    const totalAmount = subtotal + stitchingFee;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
    const orderNumber = `ABHA-POS-${dateStr}-${rand}`;
    const orderId = `ord_pos_${Date.now()}`;

    // Create POS Order Record
    await db.run(`
      INSERT INTO orders (
        id, order_number, customer_id, order_channel, store_id, order_type,
        subtotal, stitching_fee, delivery_fee, discount_amount, total_amount,
        payment_status, payment_method, order_status, delivery_type,
        shipping_name, shipping_phone, shipping_address, shipping_city,
        shipping_state, shipping_pincode, customer_notes
      ) VALUES (?, ?, NULL, 'OFFLINE_POS', 'store_beawar_01', ?, ?, ?, 0.0, 0.0, ?, 'PAID', ?, ?, ?, ?, ?, ?, 'Beawar', 'Rajasthan', '305901', 'Store POS walk-in customer')
    `, [
      orderId,
      orderNumber,
      is_stitched ? ORDER_TYPES.STITCHED : ORDER_TYPES.UNSTITCHED,
      subtotal,
      stitchingFee,
      totalAmount,
      payment_method,
      is_stitched ? ORDER_STATUSES.IN_CUTTING : ORDER_STATUSES.DELIVERED,
      delivery_type,
      (customer_name && customer_name.trim()) || 'Walk-in Store Customer',
      (customer_phone && customer_phone.trim()) || '9214837104',
      delivery_address ? delivery_address.trim() : 'Store Counter Pick-up (11, Ganesha Tower, Beawar)'
    ]);

    // Order Item
    await db.run(`
      INSERT INTO order_items (
        id, order_id, product_id, title, sku, unit_price, quantity, is_stitched, stitching_price, total_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      `oi_pos_${Date.now()}`,
      orderId,
      product.id,
      product.title,
      product.sku,
      unitPrice,
      quantity,
      is_stitched ? 1 : 0,
      stitchingFee,
      totalAmount
    ]);

    // Update Product Stock Immediately (Delist 1-of-1 items)
    const newStock = Math.max(0, product.stock_quantity - quantity);
    const isSoldOut = newStock === 0 || product.inventory_type === INVENTORY_TYPES.UNIQUE_1OF1 ? 1 : 0;

    await db.run(`
      UPDATE products
      SET stock_quantity = ?, is_sold_out = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newStock, isSoldOut, product.id]);

    // Log Inventory Transaction
    await db.run(`
      INSERT INTO inventory_transactions (
        id, product_id, store_id, transaction_type, quantity_change, quantity_after,
        reference_order_id, performed_by_user_id, notes
      ) VALUES (?, ?, 'store_beawar_01', 'OFFLINE_POS_SALE', ?, ?, ?, ?, ?)
    `, [
      `itx_pos_${Date.now()}`,
      product.id,
      -quantity,
      newStock,
      orderId,
      req.user.id,
      `Store POS Walk-in Sale (${orderNumber})`
    ]);

    await logAudit(req.user.id, 'POS_BILLING', 'ORDER', orderId, { orderNumber, sku: product.sku, totalAmount, payment_method }, req);

    res.status(201).json({
      success: true,
      message: 'Store POS order billed and stock synchronized successfully',
      data: {
        order_number: orderNumber,
        product: product.title,
        sku: product.sku,
        total_amount: totalAmount,
        payment_method,
        inventory_status: isSoldOut ? 'SOLD_OUT_DELISTED' : `${newStock} in stock`
      }
    });
  } catch (err) {
    next(err);
  }
});

// 3. Product Management (Add / Update / Toggle Status)
router.get('/products', async (req, res, next) => {
  try {
    const db = getDb();
    const products = await db.all(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

router.post('/products', uploadProductImage.single('photo'), async (req, res, next) => {
  try {
    const {
      title, sku, category_id, description, fabric,
      top_length, bottom_length, dupatta_length, work_type, wash_care,
      base_price, stitching_price = 450, inventory_type = 'UNIQUE_1OF1',
      stock_quantity = 1, is_featured = 0
    } = req.body;

    if (!title || !sku || !base_price || !fabric) {
      return res.status(400).json({ success: false, error: 'Title, SKU, fabric, and base price are required' });
    }

    const db = getDb();
    const existingSku = await db.get('SELECT id FROM products WHERE sku = ?', [sku.trim()]);
    if (existingSku) {
      return res.status(409).json({ success: false, error: `SKU '${sku}' is already in use` });
    }

    const id = `prod_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const imagePath = req.file ? `/uploads/products/${req.file.filename}` : (req.body.image_url || '/images/cream-lime-cotton-suit.jpg');

    await db.run(`
      INSERT INTO products (
        id, sku, title, slug, category_id, description, fabric,
        top_length, bottom_length, dupatta_length, work_type, wash_care,
        base_price, stitching_price, inventory_type, stock_quantity,
        is_sold_out, is_featured, is_active, primary_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, ?)
    `, [
      id, sku.trim(), title.trim(), `${slug}-${Date.now().toString().slice(-4)}`,
      category_id || 'cat_salwar_suits', description || '', fabric.trim(),
      top_length || '2.50 Meters', bottom_length || '2.50 Meters', dupatta_length || '2.25 Meters',
      work_type || 'Traditional Handcrafted', wash_care || 'Hand Wash in Cold Water',
      Number(base_price), Number(stitching_price), inventory_type, Number(stock_quantity),
      is_featured ? 1 : 0, imagePath
    ]);

    await logAudit(req.user.id, 'CREATE_PRODUCT', 'PRODUCT', id, { sku, title }, req);

    res.status(201).json({ success: true, message: 'Product created successfully', data: { id, sku, title } });
  } catch (err) {
    next(err);
  }
});

// 4. Category Management (Toggle Active vs Coming Soon - Section 52)
router.put('/categories/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active, badge_text } = req.body;
    const db = getDb();

    await db.run(`
      UPDATE categories
      SET is_active = ?, badge_text = ?
      WHERE id = ?
    `, [is_active ? 1 : 0, badge_text || (is_active ? 'Active' : 'Coming Soon'), id]);

    await logAudit(req.user.id, 'UPDATE_CATEGORY_STATUS', 'CATEGORY', id, { is_active, badge_text }, req);

    res.json({ success: true, message: 'Category status updated successfully' });
  } catch (err) {
    next(err);
  }
});

// 5. Review Moderation (Rule 10 & 22)
router.get('/reviews/pending', async (req, res, next) => {
  try {
    const db = getDb();
    const reviews = await db.all(`
      SELECT r.*, p.title as product_title, p.sku as product_sku
      FROM reviews r
      JOIN products p ON p.id = r.product_id
      WHERE r.is_approved = 0
      ORDER BY r.created_at ASC
    `);
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
});

router.put('/reviews/:id/moderate', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    const db = getDb();

    if (action === 'approve') {
      await db.run('UPDATE reviews SET is_approved = 1 WHERE id = ?', [id]);
    } else {
      await db.run('DELETE FROM reviews WHERE id = ?', [id]);
    }

    await logAudit(req.user.id, 'MODERATE_REVIEW', 'REVIEW', id, { action }, req);
    res.json({ success: true, message: `Review ${action === 'approve' ? 'approved' : 'rejected'}` });
  } catch (err) {
    next(err);
  }
});

// 6. Integration Health Status (Section 118)
router.get('/integrations/status', (req, res) => {
  const razorpayConnected = Boolean(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    !process.env.RAZORPAY_KEY_ID.includes('Placeholder')
  );

  const smsConnected = Boolean(
    process.env.SMS_API_KEY &&
    process.env.SMS_API_KEY.length > 5
  );

  res.json({
    success: true,
    data: {
      payments: {
        provider: 'Razorpay',
        status: razorpayConnected ? INTEGRATION_STATUS.CONNECTED : INTEGRATION_STATUS.READY_TO_CONNECT,
        description: 'Online card, UPI, and Netbanking payment processing with webhook verification'
      },
      sms_notifications: {
        provider: process.env.SMS_GATEWAY_PROVIDER || 'SMS Gateway',
        status: smsConnected ? INTEGRATION_STATUS.CONNECTED : INTEGRATION_STATUS.READY_TO_CONNECT,
        description: 'Customer order updates and OTP verification service'
      },
      storage_vault: {
        provider: 'Local Encrypted Storage Vault',
        status: INTEGRATION_STATUS.CONNECTED,
        description: 'Private directory isolated from web root for customer reference photos'
      },
      pos_barcode: {
        provider: 'ABHA Native Store POS & Inventory Sync',
        status: INTEGRATION_STATUS.CONNECTED,
        description: 'Instant synchronization between Beawar store walk-in counter and online storefront'
      }
    }
  });
});

// 7. Audit Logs
router.get('/audit-logs', async (req, res, next) => {
  try {
    const db = getDb();
    const logs = await db.all(`
      SELECT a.*, u.name as user_name, u.role as user_role
      FROM admin_audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
