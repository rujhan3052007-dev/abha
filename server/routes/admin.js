/**
 * ABHA Admin & POS Management API
 * Master Specification: Store Operations, POS Offline Billing, Stock Sync,
 * Review Moderation, and Integration Health Dashboard
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { verifyToken, requireRole, requirePermission, logAudit } = require('../middleware/auth');
const {
  ROLES,
  DEPARTMENTS,
  PERMISSIONS,
  EMPLOYEE_STATUSES,
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

// Enforce authenticated staff session
router.use(verifyToken);
router.use(requireRole(ROLES.OWNER, ROLES.MANAGER, ROLES.TAILOR, ROLES.DELIVERY));

// 1. Dashboard Overview Metrics
router.get('/dashboard', requirePermission(PERMISSIONS.ORDERS_VIEW, PERMISSIONS.REPORTS_VIEW), async (req, res, next) => {
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

    const canViewFinancials = req.user.role === ROLES.OWNER ||
      (req.user.permissions && (req.user.permissions.includes(PERMISSIONS.PAYMENTS_VIEW) || req.user.permissions.includes('*')));

    res.json({
      success: true,
      data: {
        financials: canViewFinancials ? {
          total_revenue: revenueResult.total_revenue || 0,
          online_revenue: revenueResult.online_revenue || 0,
          offline_revenue: revenueResult.offline_revenue || 0,
          total_orders: revenueResult.total_orders || 0
        } : null,
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
router.post('/pos/order', requirePermission('pos.bill'), async (req, res, next) => {
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

    await logAudit(req, {
      action: 'POS_BILLING',
      entityType: 'ORDER',
      entityId: orderId,
      newValue: { orderNumber, sku: product.sku, totalAmount, payment_method }
    });

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

router.post('/products', requirePermission('products.create'), uploadProductImage.single('photo'), async (req, res, next) => {
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

    await logAudit(req, { action: 'CREATE_PRODUCT', entityType: 'PRODUCT', entityId: id, newValue: { sku, title } });

    res.status(201).json({ success: true, message: 'Product created successfully', data: { id, sku, title } });
  } catch (err) {
    next(err);
  }
});

// 4. Category Management (Create, Edit, Delete, Toggle Active vs Coming Soon - Section 52)
router.post('/categories', requirePermission('settings.edit', 'products.edit'), async (req, res, next) => {
  try {
    const { name, slug, description, image, is_active, badge_text, display_order } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }
    const db = getDb();
    try {
      await db.run('ALTER TABLE categories ADD COLUMN image TEXT');
    } catch (e) {}

    const catSlug = (slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await db.get('SELECT id FROM categories WHERE slug = ?', [catSlug]);
    if (existing) {
      return res.status(400).json({ success: false, error: `Category slug "${catSlug}" already exists.` });
    }

    const id = 'cat_' + Date.now();
    const activeVal = (is_active === 1 || is_active === true) ? 1 : 0;
    const badge = badge_text || (activeVal ? 'Active Collection' : 'Coming Soon');

    await db.run(`
      INSERT INTO categories (id, name, slug, description, image, is_active, badge_text, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name.trim(), catSlug, (description || '').trim(), (image || '').trim(), activeVal, badge, display_order || 99]);

    await logAudit(req, { action: 'CREATE_CATEGORY', entityType: 'CATEGORY', entityId: id, newValue: { name, slug: catSlug } });
    res.status(201).json({ success: true, message: 'Category created successfully', data: { id, name, slug: catSlug } });
  } catch (err) {
    next(err);
  }
});

router.put('/categories/:id', requirePermission('settings.edit', 'products.edit'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, is_active, badge_text, display_order } = req.body;
    const db = getDb();
    try {
      await db.run('ALTER TABLE categories ADD COLUMN image TEXT');
    } catch (e) {}

    const existing = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const newName = name !== undefined ? name.trim() : existing.name;
    const newSlug = slug !== undefined ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : existing.slug;
    const newDesc = description !== undefined ? description.trim() : existing.description;
    const newImage = image !== undefined ? image.trim() : existing.image;
    const newActive = is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active;
    const newBadge = badge_text !== undefined ? badge_text : (newActive ? 'Active Collection' : 'Coming Soon');
    const newOrder = display_order !== undefined ? display_order : existing.display_order;

    await db.run(`
      UPDATE categories
      SET name = ?, slug = ?, description = ?, image = ?, is_active = ?, badge_text = ?, display_order = ?
      WHERE id = ?
    `, [newName, newSlug, newDesc, newImage, newActive, newBadge, newOrder, id]);

    await logAudit(req, { action: 'UPDATE_CATEGORY', entityType: 'CATEGORY', entityId: id, newValue: { name: newName, slug: newSlug } });
    res.json({ success: true, message: 'Category updated successfully' });
  } catch (err) {
    next(err);
  }
});

router.delete('/categories/:id', requirePermission('settings.edit', 'products.edit'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const existing = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    if (existing.slug === 'salwar-suit-dress-materials' || existing.id === 'cat_salwar_suits') {
      return res.status(400).json({ success: false, error: 'Cannot delete primary Salwar Suits category.' });
    }

    await db.run('DELETE FROM categories WHERE id = ?', [id]);
    await logAudit(req, { action: 'DELETE_CATEGORY', entityType: 'CATEGORY', entityId: id, previousValue: existing });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
});

router.put('/categories/:id/status', requirePermission('settings.edit', 'products.edit'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active, badge_text } = req.body;
    const db = getDb();

    await db.run(`
      UPDATE categories
      SET is_active = ?, badge_text = ?
      WHERE id = ?
    `, [is_active ? 1 : 0, badge_text || (is_active ? 'Active' : 'Coming Soon'), id]);

    await logAudit(req, { action: 'UPDATE_CATEGORY_STATUS', entityType: 'CATEGORY', entityId: id, newValue: { is_active, badge_text } });

    res.json({ success: true, message: 'Category status updated successfully' });
  } catch (err) {
    next(err);
  }
});

// 5. Review Moderation (Rule 10 & 22)
router.get('/reviews/pending', requirePermission('reviews.view', 'reviews.moderate'), async (req, res, next) => {
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

router.put('/reviews/:id/moderate', requirePermission('reviews.moderate'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    const db = getDb();

    if (action === 'approve') {
      await db.run('UPDATE reviews SET is_approved = 1 WHERE id = ?', [id]);
    } else {
      await db.run('DELETE FROM reviews WHERE id = ?', [id]);
    }

    await logAudit(req, { action: 'MODERATE_REVIEW', entityType: 'REVIEW', entityId: id, details: { action } });
    res.json({ success: true, message: `Review ${action === 'approve' ? 'approved' : 'rejected'}` });
  } catch (err) {
    next(err);
  }
});

// 6. Integration Health Status (Section 118)
router.get('/integrations/status', requirePermission('settings.view'), (req, res) => {
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
router.get('/audit-logs', requirePermission('audit.view'), async (req, res, next) => {
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

// ==========================================
// 8. MANAGER MANAGEMENT (Owner Only - §2, §3, §27)
// ==========================================

// List all Managers
router.get('/managers', async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.OWNER) {
      return res.status(403).json({ success: false, error: 'Forbidden: Only the ABHA Owner can manage managers.' });
    }
    const db = getDb();
    const managers = await db.all(`
      SELECT 
        e.id as employee_id,
        e.user_id,
        e.employee_code,
        e.name,
        e.mobile,
        e.email,
        e.department_code,
        e.role_code,
        e.status,
        e.permissions_override_json,
        e.joining_date,
        e.authorized_by_name,
        e.authorized_at,
        u.is_active
      FROM employees e
      JOIN users u ON u.id = e.user_id
      WHERE e.role_code LIKE '%MANAGER%' OR u.role = 'MANAGER'
      ORDER BY e.created_at ASC
    `);

    const result = managers.map(m => {
      let perms = [];
      if (m.permissions_override_json) {
        try { perms = JSON.parse(m.permissions_override_json); } catch {}
      }
      return { ...m, permissions: perms };
    });

    res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    next(err);
  }
});

// Create Manager (Owner Only)
router.post('/managers', async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.OWNER) {
      return res.status(403).json({ success: false, error: 'Forbidden: Only the ABHA Owner can create managers.' });
    }

    const { name, mobile, phone, email, password, department_code, department, role_code, role, assigned_area, permissions = [] } = req.body;
    const finalPhone = (mobile || phone || '').trim();
    const finalDept = (department_code || department || '').trim().toUpperCase();
    const finalRole = role_code || role || `${finalDept}_MANAGER`;
    const finalArea = assigned_area || req.body.area || 'Beawar';

    if (!name || !finalPhone || !finalDept || !password) {
      return res.status(400).json({ success: false, error: 'Name, mobile, password, and department are required.' });
    }

    const db = getDb();
    const existing = await db.get('SELECT id FROM users WHERE phone = ? OR (email = ? AND email IS NOT NULL)', [finalPhone, (email || '').trim().toLowerCase()]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'A user with this mobile number or email already exists.' });
    }

    const userId = `usr_mgr_${Date.now()}`;
    const employeeId = `emp_mgr_${Date.now()}`;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const employeeCode = `ABHA-M-${Date.now().toString().slice(-4)}`;

    await db.run(`
      INSERT INTO users (id, name, phone, email, password_hash, role, is_active)
      VALUES (?, ?, ?, ?, ?, 'MANAGER', 1)
    `, [userId, name.trim(), finalPhone, email ? email.trim().toLowerCase() : null, hash]);

    await db.run(`
      INSERT INTO employees (
        id, user_id, employee_code, name, mobile, email, department_code, role_code,
        assigned_area, status, permissions_override_json, authorized_by_user_id, authorized_by_name,
        authorized_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, CURRENT_TIMESTAMP, 1)
    `, [
      employeeId, userId, employeeCode, name.trim(), finalPhone,
      email ? email.trim().toLowerCase() : null, finalDept,
      finalRole, finalArea, JSON.stringify(permissions), req.user.id, req.user.name || 'ABHA Owner'
    ]);

    await logAudit(req, {
      action: 'CREATE_MANAGER',
      entityType: 'MANAGER',
      entityId: employeeId,
      newValue: { name, department: finalDept, permissions },
      details: `Owner created manager ${name} (${employeeCode}) with ${permissions.length} permissions.`
    });

    res.status(201).json({
      success: true,
      message: `Manager ${name} created successfully.`,
      data: { id: employeeId, employee_id: employeeId, user_id: userId, employee_code: employeeCode, permissions }
    });
  } catch (err) {
    next(err);
  }
});

// Update Manager Permissions (Owner Only - §13, §23)
router.put('/managers/:id/permissions', async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.OWNER) {
      return res.status(403).json({ success: false, error: 'Forbidden: Only the ABHA Owner can modify manager permissions.' });
    }

    const { id } = req.params;
    const { permissions = [] } = req.body;
    const db = getDb();

    const emp = await db.get('SELECT * FROM employees WHERE id = ? OR user_id = ?', [id, id]);
    if (!emp) {
      return res.status(404).json({ success: false, error: 'Manager employee record not found.' });
    }

    const prevPerms = emp.permissions_override_json ? JSON.parse(emp.permissions_override_json) : [];

    await db.run(`
      UPDATE employees
      SET permissions_override_json = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [JSON.stringify(permissions), emp.id]);

    await logAudit(req, {
      action: 'UPDATE_MANAGER_PERMISSIONS',
      entityType: 'MANAGER',
      entityId: emp.id,
      previousValue: prevPerms,
      newValue: permissions,
      details: `Owner updated permissions for manager ${emp.name} (${emp.employee_code}).`
    });

    res.json({
      success: true,
      message: `Permissions updated for manager ${emp.name}.`,
      data: { employee_id: emp.id, permissions }
    });
  } catch (err) {
    next(err);
  }
});

// Update Manager Status (Owner Only - Suspend / Reactivate / Revoke - §25, §31)
router.put('/managers/:id/status', async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.OWNER) {
      return res.status(403).json({ success: false, error: 'Forbidden: Only the ABHA Owner can change manager status.' });
    }

    const { id } = req.params;
    const { status, notes } = req.body; // 'ACTIVE', 'SUSPENDED', 'REVOKED', 'INACTIVE'
    const db = getDb();

    const emp = await db.get('SELECT * FROM employees WHERE id = ? OR user_id = ?', [id, id]);
    if (!emp) {
      return res.status(404).json({ success: false, error: 'Manager record not found.' });
    }

    const prevStatus = emp.status;
    const isUserActive = (status === 'ACTIVE') ? 1 : 0;

    await db.run(`
      UPDATE employees
      SET status = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, isUserActive, emp.id]);

    await db.run(`
      UPDATE users
      SET is_active = ?
      WHERE id = ?
    `, [isUserActive, emp.user_id]);

    await logAudit(req, {
      action: 'UPDATE_MANAGER_STATUS',
      entityType: 'MANAGER',
      entityId: emp.id,
      previousValue: prevStatus,
      newValue: status,
      details: `Manager ${emp.name} status changed from ${prevStatus} to ${status}. Notes: ${notes || 'None'}`
    });

    res.json({
      success: true,
      message: `Manager ${emp.name} status updated to ${status}.`,
      data: { employee_id: emp.id, status }
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 9. EMPLOYEE MANAGEMENT & AUTHORIZATION (§6, §15, §16, §17, §26)
// ==========================================

// List Employees (Owner sees all; Managers see their department only)
router.get('/employees', async (req, res, next) => {
  try {
    const db = getDb();
    let query = `
      SELECT 
        e.*,
        u.is_active as user_active,
        u.role as user_role
      FROM employees e
      JOIN users u ON u.id = e.user_id
    `;
    const params = [];

    if (req.user.role !== ROLES.OWNER) {
      // Non-owner: Must have employees.view or delivery.view or tailoring.view
      const userPerms = req.user.permissions || [];
      const canView = userPerms.includes('employees.view') || 
                      userPerms.includes('delivery.view') || 
                      userPerms.includes('tailoring.view');
      if (!canView) {
        return res.status(403).json({ success: false, error: 'Forbidden: Lacks permission to view employees.' });
      }
      query += ` WHERE e.department_code = ?`;
      params.push(req.user.department || '');
    }

    query += ` ORDER BY e.created_at DESC`;
    const employees = await db.all(query, params);

    const result = employees.map(emp => {
      let perms = [];
      if (emp.permissions_override_json) {
        try { perms = JSON.parse(emp.permissions_override_json); } catch {}
      }
      return { ...emp, permissions: perms };
    });

    res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    next(err);
  }
});

// Create Department Employee (§6, §15)
router.post('/employees', async (req, res, next) => {
  try {
    const db = getDb();
    const {
      name,
      mobile,
      email,
      password = 'AbhaStaff2026!',
      department_code,
      role_code,
      role,
      role_title,
      assigned_area,
      emergency_contact,
      status = 'PENDING',
      permissions = []
    } = req.body;

    const finalPhone = (mobile || req.body.phone || '').trim();
    const dept = (department_code || req.body.department || '').trim().toUpperCase();
    const finalRole = role_code || role || role_title || `${dept}_STAFF`;

    if (!name || !finalPhone || !dept) {
      return res.status(400).json({ success: false, error: 'Name, mobile, and department are required.' });
    }

    // Check manager delegation: Managers cannot create employees outside their department
    if (req.user.role !== ROLES.OWNER) {
      if (req.user.department !== dept) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: As a ${req.user.department} manager, you cannot create employees in the ${dept} department.`
        });
      }
      // Check create permission
      const userPerms = req.user.permissions || [];
      const canCreate = userPerms.includes('employees.create') ||
        (dept === 'STORE' && (userPerms.includes('pos.access') || userPerms.includes('employees.view'))) ||
        (dept === 'DELIVERY' && userPerms.includes('delivery.create_employee')) ||
        (dept === 'TAILORING' && userPerms.includes('tailoring.assign'));
      if (!canCreate) {
        return res.status(403).json({ success: false, error: 'Forbidden: Missing permission to create employees.' });
      }
    }

    const existing = await db.get('SELECT id FROM users WHERE phone = ?', [finalPhone]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'An employee with this mobile phone already exists.' });
    }

    const userId = `usr_emp_${Date.now()}`;
    const employeeId = `emp_${Date.now()}`;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    
    // Determine system role
    let baseRole = 'EMPLOYEE';
    if (dept === 'DELIVERY') baseRole = ROLES.DELIVERY;
    if (dept === 'TAILORING') baseRole = ROLES.TAILOR;
    if (dept === 'STORE') baseRole = ROLES.MANAGER;

    const prefix = dept === 'DELIVERY' ? 'ABHA-D' : dept === 'TAILORING' ? 'ABHA-T' : 'ABHA-E';
    const employeeCode = `${prefix}-${Date.now().toString().slice(-4)}`;

    // Initial status: PENDING unless caller has authorization permission
    let initialStatus = 'PENDING';
    const userPerms = req.user.permissions || [];
    const canAuthorize = req.user.role === ROLES.OWNER ||
      userPerms.includes('employees.authorize') ||
      (dept === 'DELIVERY' && userPerms.includes('delivery.employee.authorize')) ||
      (dept === 'TAILORING' && userPerms.includes('tailoring.employee.authorize'));

    if (canAuthorize && status === 'ACTIVE') {
      initialStatus = 'ACTIVE';
    }

    await db.run(`
      INSERT INTO users (id, name, phone, email, password_hash, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [userId, name.trim(), finalPhone, email ? email.trim().toLowerCase() : null, hash, baseRole]);

    await db.run(`
      INSERT INTO employees (
        id, user_id, employee_code, name, mobile, email, department_code, role_code,
        status, assigned_area, emergency_contact, joining_date, permissions_override_json,
        authorized_by_user_id, authorized_by_name, authorized_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, 1)
    `, [
      employeeId, userId, employeeCode, name.trim(), finalPhone,
      email ? email.trim().toLowerCase() : null, dept, finalRole,
      initialStatus, assigned_area || 'Beawar', emergency_contact || null,
      JSON.stringify(permissions),
      initialStatus === 'ACTIVE' ? req.user.id : null,
      initialStatus === 'ACTIVE' ? (req.user.name || req.user.role) : null,
      initialStatus === 'ACTIVE' ? new Date().toISOString() : null
    ]);

    await logAudit(req, {
      action: 'CREATE_EMPLOYEE',
      entityType: 'EMPLOYEE',
      entityId: employeeId,
      newValue: { name, department: dept, status: initialStatus },
      details: `${req.user.name || req.user.role} created employee ${name} (${employeeCode}) with status ${initialStatus}.`
    });

    res.status(201).json({
      success: true,
      message: `Employee ${name} registered (${initialStatus}).`,
      data: {
        id: employeeId,
        employee_id: employeeId,
        user_id: userId,
        employee_code: employeeCode,
        email: email ? email.trim().toLowerCase() : `${employeeCode.toLowerCase()}@abha.in`,
        status: initialStatus,
        requires_authorization: initialStatus === 'PENDING'
      }
    });
  } catch (err) {
    next(err);
  }
});

// Authorize Employee (§6, §16, §17)
router.put('/employees/:id/authorize', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const emp = await db.get('SELECT * FROM employees WHERE id = ? OR user_id = ?', [id, id]);
    if (!emp) {
      return res.status(404).json({ success: false, error: 'Employee record not found.' });
    }

    // Check authorization permission
    if (req.user.role !== ROLES.OWNER) {
      if (req.user.department !== emp.department_code) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: Cannot authorize employee outside your department (${emp.department_code}).`
        });
      }

      const userPerms = req.user.permissions || [];
      const hasAuthPerm = userPerms.includes('employees.authorize') ||
        (emp.department_code === 'DELIVERY' && userPerms.includes('delivery.employee.authorize')) ||
        (emp.department_code === 'TAILORING' && userPerms.includes('tailoring.employee.authorize'));

      if (!hasAuthPerm) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: Missing required authorization permission ('${emp.department_code.toLowerCase()}.employee.authorize').`
        });
      }
    }

    const prevStatus = emp.status;

    await db.run(`
      UPDATE employees
      SET status = 'ACTIVE',
          authorized_by_user_id = ?,
          authorized_by_name = ?,
          authorized_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [req.user.id, req.user.name || req.user.role, emp.id]);

    // Record in employee_authorizations audit
    const authId = `eauth_${Date.now()}`;
    await db.run(`
      INSERT INTO employee_authorizations (
        id, employee_id, requested_by_user_id, action, previous_status, new_status,
        authorized_by_user_id, authorized_by_name, notes
      ) VALUES (?, ?, ?, 'AUTHORIZE', ?, 'ACTIVE', ?, ?, ?)
    `, [
      authId, emp.id, req.user.id, prevStatus, req.user.id,
      req.user.name || req.user.role, req.body.notes || 'Authorized for duty'
    ]);

    await logAudit(req, {
      action: 'AUTHORIZE_EMPLOYEE',
      entityType: 'EMPLOYEE',
      entityId: emp.id,
      previousValue: prevStatus,
      newValue: 'ACTIVE',
      details: `${req.user.name || req.user.role} authorized employee ${emp.name} (${emp.employee_code}).`
    });

    res.json({
      success: true,
      message: `Employee ${emp.name} is now ACTIVE and authorized.`,
      data: { employee_id: emp.id, status: 'ACTIVE', authorized_by: req.user.name || req.user.role }
    });
  } catch (err) {
    next(err);
  }
});

// Update Employee Status (Suspend / Reactivate / Revoke / Inactive - §31)
router.put('/employees/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // 'ACTIVE', 'SUSPENDED', 'REVOKED', 'INACTIVE'
    const db = getDb();

    const emp = await db.get('SELECT * FROM employees WHERE id = ? OR user_id = ?', [id, id]);
    if (!emp) {
      return res.status(404).json({ success: false, error: 'Employee record not found.' });
    }

    if (req.user.role !== ROLES.OWNER) {
      if (req.user.department !== emp.department_code) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: Cannot modify employee outside your department (${emp.department_code}).`
        });
      }
      const userPerms = req.user.permissions || [];
      const canManage = userPerms.includes('employees.suspend') ||
        (emp.department_code === 'DELIVERY' && userPerms.includes('delivery.suspend_employee')) ||
        userPerms.includes('employees.edit');
      if (!canManage) {
        return res.status(403).json({ success: false, error: 'Forbidden: Missing permission to alter employee status.' });
      }
    }

    const prevStatus = emp.status;
    const isUserActive = status === 'ACTIVE' ? 1 : 0;

    await db.run(`
      UPDATE employees
      SET status = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, isUserActive, emp.id]);

    await db.run(`
      UPDATE users
      SET is_active = ?
      WHERE id = ?
    `, [isUserActive, emp.user_id]);

    // Record in employee_authorizations history
    const authId = `eauth_${Date.now()}`;
    await db.run(`
      INSERT INTO employee_authorizations (
        id, employee_id, requested_by_user_id, action, previous_status, new_status,
        authorized_by_user_id, authorized_by_name, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      authId, emp.id, req.user.id, status === 'SUSPENDED' ? 'SUSPEND' : status === 'REVOKED' ? 'REVOKE' : 'REACTIVATE',
      prevStatus, status, req.user.id, req.user.name || req.user.role, notes || ''
    ]);

    await logAudit(req, {
      action: 'UPDATE_EMPLOYEE_STATUS',
      entityType: 'EMPLOYEE',
      entityId: emp.id,
      previousValue: prevStatus,
      newValue: status,
      details: `${req.user.name || req.user.role} changed status of ${emp.name} (${emp.employee_code}) to ${status}.`
    });

    res.json({
      success: true,
      message: `Employee ${emp.name} status updated to ${status}.`,
      data: { employee_id: emp.id, status }
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 10. SYSTEM PERMISSIONS, DEPARTMENTS & ROLES (§4, §12, §13)
// ==========================================

router.get('/permissions', async (req, res, next) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT * FROM permissions ORDER BY module ASC, action ASC');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
});

router.get('/departments', async (req, res, next) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT * FROM departments ORDER BY name ASC');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/departments', async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.OWNER) {
      return res.status(403).json({ success: false, error: 'Forbidden: Only the ABHA Owner can create departments.' });
    }
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'Department name and code are required.' });
    }
    const db = getDb();
    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    const id = `dept_${cleanCode.toLowerCase()}`;
    await db.run('INSERT INTO departments (id, name, code, description, is_active) VALUES (?, ?, ?, ?, 1)', [id, name.trim(), cleanCode, description || '']);
    await logAudit(req, {
      action: 'CREATE_DEPARTMENT',
      entityType: 'DEPARTMENT',
      entityId: id,
      newValue: { name, code: cleanCode }
    });
    res.status(201).json({ success: true, message: `Department ${name} created.`, data: { id, code: cleanCode, name } });
  } catch (err) {
    next(err);
  }
});

router.get('/roles', async (req, res, next) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT * FROM roles ORDER BY name ASC');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
});

// 21. Owner Change Password (Authenticated Session)
router.put('/users/password', requireRole(ROLES.OWNER), async (req, res, next) => {
  try {
    const { targetIdentifier, newPassword } = req.body;
    if (!targetIdentifier || !newPassword) {
      return res.status(400).json({ success: false, error: 'Target identifier and new password are required' });
    }
    if (newPassword.length < 4) {
      return res.status(400).json({ success: false, error: 'Password must be at least 4 characters' });
    }

    const db = getDb();
    const cleanTarget = targetIdentifier.trim().toLowerCase();
    let targetUser = await db.get(`
      SELECT * FROM users 
      WHERE lower(email) = ? OR phone = ? OR lower(role) = ?
    `, [cleanTarget, targetIdentifier.trim(), cleanTarget]);

    if (!targetUser) {
      if (cleanTarget === 'owner' || cleanTarget === 'rujhan3052007@gmail.com') {
        targetUser = await db.get(`SELECT * FROM users WHERE role = 'OWNER' LIMIT 1`);
      } else if (cleanTarget === 'manager' || cleanTarget === 'manager@abha.in') {
        targetUser = await db.get(`SELECT * FROM users WHERE role = 'MANAGER' LIMIT 1`);
      } else if (cleanTarget === 'tailor' || cleanTarget === 'master.tailor@abha.in') {
        targetUser = await db.get(`SELECT * FROM users WHERE role = 'TAILOR' LIMIT 1`);
      } else if (cleanTarget === 'delivery' || cleanTarget === 'delivery@abha.in') {
        targetUser = await db.get(`SELECT * FROM users WHERE role = 'DELIVERY' LIMIT 1`);
      }
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, error: `Account "${targetIdentifier}" not found` });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, targetUser.id]);

    await logAudit(db, {
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PASSWORD_CHANGED_BY_OWNER',
      entityType: 'USER',
      entityId: targetUser.id,
      details: { target_email: targetUser.email, target_role: targetUser.role, target_name: targetUser.name }
    });

    res.json({
      success: true,
      message: `Password for ${targetUser.name} (${targetUser.role}) updated successfully.`,
      target: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
