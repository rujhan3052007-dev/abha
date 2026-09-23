/**
 * ABHA Orders API
 * Master Specification: Direct Buy Now, Unstitched vs Stitched validation, Local Delivery logic,
 * and Strict Cancellation Enforcement (Rule 9)
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getDb } = require('../config/database');
const { optionalAuth, verifyToken } = require('../middleware/auth');
const {
  BRAND,
  ORDER_STATUSES,
  ORDER_TYPES,
  ORDER_CHANNELS,
  DELIVERY_TYPES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  INVENTORY_TYPES,
  TRANSACTION_TYPES,
  STITCHING_STATUSES
} = require('../config/constants');

// Helper to generate format: ABHA-YYYYMMDD-XXXX
function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ABHA-${dateStr}-${rand}`;
}

// 1. Direct Buy Now / Create Order
router.post('/buy-now', optionalAuth, async (req, res, next) => {
  try {
    const {
      product_id,
      quantity = 1,
      order_type = ORDER_TYPES.UNSTITCHED,
      stitching_config, // { neck_design, sleeve_style, bottom_style, kurta_design, additional_requirements, reference_images: [] }
      shipping, // { name, phone, address, city, state, pincode, notes }
      delivery_preference // 'LOCAL_HOME_DELIVERY' or 'PAN_INDIA_COURIER'
    } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }

    if (!shipping || !shipping.name || !shipping.phone || !shipping.address || !shipping.pincode) {
      return res.status(400).json({ success: false, error: 'Complete shipping information (name, phone, address, pincode) is required' });
    }

    const db = getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [product_id]);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found or currently unavailable' });
    }

    if (product.is_sold_out || product.stock_quantity <= 0) {
      return res.status(400).json({ success: false, error: 'This exclusive product is currently sold out' });
    }

    if (product.inventory_type === INVENTORY_TYPES.UNIQUE_1OF1 && quantity > 1) {
      return res.status(400).json({ success: false, error: 'This is an exclusive 1-of-1 handcrafted piece. Maximum 1 allowed per order.' });
    }

    const isStitched = order_type === ORDER_TYPES.STITCHED;
    if (isStitched) {
      if (!stitching_config) stitching_config = {};
      const isAssistanceOrStore = (stitching_config.measurement_mode === 'ASSISTANCE' || stitching_config.measurement_mode === 'VISIT_STORE');
      if (!isAssistanceOrStore && (!stitching_config.neck_design || !stitching_config.sleeve_style || !stitching_config.bottom_style || !stitching_config.kurta_design)) {
        stitching_config.neck_design = stitching_config.neck_design || 'Round Neck with Slit';
        stitching_config.sleeve_style = stitching_config.sleeve_style || '3/4th Regular Sleeves';
        stitching_config.bottom_style = stitching_config.bottom_style || 'Straight Pants';
        stitching_config.kurta_design = stitching_config.kurta_design || 'Straight Fit Standard';
      }
    }

    const unitPrice = Number(product.base_price);
    const stitchingFeePerUnit = isStitched ? Number(product.stitching_price || 450) : 0;
    const subtotal = unitPrice * quantity;
    const totalStitchingFee = stitchingFeePerUnit * quantity;

    // Delivery calculation
    const cleanPincode = shipping.pincode.trim();
    let deliveryType = DELIVERY_TYPES.PAN_INDIA_COURIER;
    let deliveryFee = subtotal >= 2000 ? 0.0 : 99.0;

    // Check local Beawar zone
    const localZone = await db.get('SELECT * FROM delivery_zones WHERE pincode = ? AND is_active = 1', [cleanPincode]);
    if (localZone || cleanPincode === '305901') {
      deliveryType = DELIVERY_TYPES.LOCAL_HOME_DELIVERY;
      deliveryFee = 0.0; // Free local doorstep delivery in Beawar
    }

    const totalAmount = subtotal + totalStitchingFee + deliveryFee;
    const orderId = `ord_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const orderNumber = generateOrderNumber();
    const customerId = req.user ? req.user.id : null;

    // Insert order record
    await db.run(`
      INSERT INTO orders (
        id, order_number, customer_id, order_channel, store_id, order_type,
        subtotal, stitching_fee, delivery_fee, discount_amount, total_amount,
        payment_status, payment_method, order_status, delivery_type,
        shipping_name, shipping_phone, shipping_address, shipping_city,
        shipping_state, shipping_pincode, customer_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      orderNumber,
      customerId,
      ORDER_CHANNELS.ONLINE,
      'store_beawar_01',
      order_type,
      subtotal,
      totalStitchingFee,
      deliveryFee,
      totalAmount,
      PAYMENT_STATUSES.PENDING,
      PAYMENT_METHODS.RAZORPAY,
      ORDER_STATUSES.PENDING_PAYMENT,
      deliveryType,
      shipping.name.trim(),
      shipping.phone.trim(),
      shipping.address.trim(),
      shipping.city ? shipping.city.trim() : (cleanPincode === '305901' ? 'Beawar' : 'India'),
      shipping.state ? shipping.state.trim() : 'Rajasthan',
      cleanPincode,
      shipping.notes || null
    ]);

    // Insert Order Item
    const orderItemId = `oi_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    await db.run(`
      INSERT INTO order_items (
        id, order_id, product_id, title, sku, unit_price, quantity, is_stitched, stitching_price, total_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderItemId,
      orderId,
      product.id,
      product.title,
      product.sku,
      unitPrice,
      quantity,
      isStitched ? 1 : 0,
      stitchingFeePerUnit,
      subtotal + totalStitchingFee
    ]);

    // Insert Stitching Details if stitched
    if (isStitched) {
      const stitchingId = `st_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      await db.run(`
        INSERT INTO stitching_details (
          id, order_item_id, neck_design, sleeve_style, bottom_style,
          kurta_design, additional_requirements, stitching_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        stitchingId,
        orderItemId,
        stitching_config.neck_design,
        stitching_config.sleeve_style,
        stitching_config.bottom_style,
        stitching_config.kurta_design,
        stitching_config.additional_requirements || null,
        STITCHING_STATUSES.QUEUED
      ]);

      // Link any uploaded reference image storage keys
      if (Array.isArray(stitching_config.reference_images)) {
        for (const ref of stitching_config.reference_images) {
          if (ref.storage_key) {
            await db.run(`
              INSERT INTO stitching_reference_images (
                id, stitching_details_id, vault_storage_key, original_filename, file_size, mime_type
              ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
              `ref_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
              stitchingId,
              ref.storage_key,
              ref.original_name || 'reference_image',
              ref.size || 0,
              ref.mime_type || 'image/jpeg'
            ]);
          }
        }
      }
    }

    // Auto-create delivery record
    await db.run(`
      INSERT INTO deliveries (
        id, order_id, delivery_method, delivery_status, delivery_notes
      ) VALUES (?, ?, ?, 'PENDING', ?)
    `, [
      `del_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      orderId,
      deliveryType === DELIVERY_TYPES.LOCAL_HOME_DELIVERY ? 'IN_HOUSE_STAFF' : 'THIRD_PARTY',
      cleanPincode === '305901' ? 'Beawar local doorstep delivery' : 'Pan-India courier'
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order_id: orderId,
        order_number: orderNumber,
        product: {
          id: product.id,
          title: product.title,
          sku: product.sku,
          image: product.primary_image
        },
        pricing: {
          subtotal,
          stitching_fee: totalStitchingFee,
          delivery_fee: deliveryFee,
          total_amount: totalAmount
        },
        order_type,
        delivery_type: deliveryType,
        payment_status: PAYMENT_STATUSES.PENDING
      }
    });
  } catch (err) {
    next(err);
  }
});

// 2. Track Order by Order Number + Phone or Auth
router.get('/track/:orderNumber', optionalAuth, async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { phone } = req.query;
    const db = getDb();

    let sql = 'SELECT * FROM orders WHERE order_number = ?';
    const params = [orderNumber.trim()];

    // If user not authenticated, phone is required for privacy verification
    if (!req.user) {
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number is required to verify order tracking' });
      }
      sql += ' AND shipping_phone = ?';
      params.push(phone.trim().replace(/\D/g, '').slice(-10));
    }

    const order = await db.get(sql, params);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found with provided details' });
    }

    const items = await db.all(`
      SELECT oi.*, p.primary_image, p.slug
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `, [order.id]);

    const stitching = await db.all(`
      SELECT sd.*
      FROM stitching_details sd
      JOIN order_items oi ON oi.id = sd.order_item_id
      WHERE oi.order_id = ?
    `, [order.id]);

    const delivery = await db.get('SELECT * FROM deliveries WHERE order_id = ?', [order.id]);

    // Timeline calculation
    const timeline = [
      { step: 'Order Placed', completed: true, timestamp: order.created_at },
      { step: 'Payment Confirmed', completed: order.payment_status === PAYMENT_STATUSES.PAID },
      {
        step: order.order_type === ORDER_TYPES.STITCHED ? 'Cutting & Custom Stitching' : 'Garment Inspection & Packing',
        completed: ['IN_CUTTING', 'IN_STITCHING', 'STITCHING_COMPLETED', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status)
      },
      {
        step: 'Ready for Dispatch',
        completed: ['READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status)
      },
      {
        step: order.delivery_type === DELIVERY_TYPES.LOCAL_HOME_DELIVERY ? 'Out for Local Doorstep Delivery' : 'Dispatched via Courier',
        completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status)
      },
      { step: 'Delivered', completed: order.order_status === ORDER_STATUSES.DELIVERED }
    ];

    res.json({
      success: true,
      data: {
        order,
        items,
        stitching_details: stitching,
        delivery,
        timeline
      }
    });
  } catch (err) {
    next(err);
  }
});

// 3. Strict Cancellation Rule Enforcement (Rule 9 & Section 36)
router.post('/cancel/:orderNumber', optionalAuth, async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { reason, phone } = req.body;
    const db = getDb();

    let sql = 'SELECT * FROM orders WHERE order_number = ?';
    const params = [orderNumber.trim()];

    if (!req.user) {
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number required for order verification' });
      }
      sql += ' AND shipping_phone = ?';
      params.push(phone.trim().replace(/\D/g, '').slice(-10));
    }

    const order = await db.get(sql, params);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.order_status === ORDER_STATUSES.CANCELLED) {
      return res.status(400).json({ success: false, error: 'Order is already cancelled' });
    }

    // STRICT RULE 9: Stitched order cannot be cancelled once cutting/stitching starts!
    if (order.order_type === ORDER_TYPES.STITCHED) {
      const nonCancellableStatuses = [
        ORDER_STATUSES.IN_CUTTING,
        ORDER_STATUSES.IN_STITCHING,
        ORDER_STATUSES.STITCHING_COMPLETED,
        ORDER_STATUSES.READY_FOR_DISPATCH,
        ORDER_STATUSES.OUT_FOR_DELIVERY,
        ORDER_STATUSES.DELIVERED
      ];

      if (nonCancellableStatuses.includes(order.order_status)) {
        return res.status(400).json({
          success: false,
          error: 'Strict Policy: Custom stitched orders cannot be cancelled once fabric cutting or tailoring has commenced. We offer a 10-day alteration guarantee upon delivery.'
        });
      }
    }

    // Cancel order
    await db.run(`
      UPDATE orders
      SET order_status = 'CANCELLED', cancellation_reason = ?, cancelled_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [reason || 'Customer requested cancellation', order.id]);

    // Restore stock if product was deducted
    const items = await db.all('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [order.id]);
    for (const itm of items) {
      await db.run(`
        UPDATE products
        SET stock_quantity = stock_quantity + ?, is_sold_out = 0
        WHERE id = ?
      `, [itm.quantity, itm.product_id]);

      await db.run(`
        INSERT INTO inventory_transactions (
          id, product_id, store_id, transaction_type, quantity_change, quantity_after,
          reference_order_id, notes
        ) VALUES (?, ?, ?, 'RETURN', ?, (SELECT stock_quantity FROM products WHERE id = ?), ?, ?)
      `, [
        `itx_cancel_${Date.now()}`,
        itm.product_id,
        order.store_id || 'store_beawar_01',
        itm.quantity,
        itm.product_id,
        order.id,
        'Stock restored due to pre-stitching order cancellation'
      ]);
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully. If paid online, refund will be processed within 5-7 business days.'
    });
  } catch (err) {
    next(err);
  }
});

// 4. Customer Order History
router.get('/my-orders', verifyToken, async (req, res, next) => {
  try {
    const db = getDb();
    const orders = await db.all(`
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.customer_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
