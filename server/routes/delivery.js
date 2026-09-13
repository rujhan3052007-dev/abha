/**
 * ABHA Local Delivery Management API
 * Master Specification: Doorstep local delivery in Beawar (PIN 305901) and courier dispatching
 */

const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth');
const { ROLES, ORDER_STATUSES, DELIVERY_STATUSES } = require('../config/constants');

router.use(verifyToken);
router.use(requireRole(ROLES.DELIVERY, ROLES.MANAGER, ROLES.OWNER));

// 1. Get Delivery Queue
router.get('/queue', async (req, res, next) => {
  try {
    const db = getDb();
    const deliveries = await db.all(`
      SELECT 
        d.id as delivery_id,
        d.delivery_method,
        d.delivery_status,
        d.dispatched_at,
        d.delivered_at,
        d.delivery_notes,
        o.id as order_id,
        o.order_number,
        o.order_type,
        o.order_status,
        o.total_amount,
        o.shipping_name,
        o.shipping_phone,
        o.shipping_address,
        o.shipping_city,
        o.shipping_pincode,
        o.customer_notes
      FROM deliveries d
      JOIN orders o ON o.id = d.order_id
      WHERE d.delivery_status != 'DELIVERED' AND o.order_status != 'CANCELLED'
      ORDER BY o.created_at ASC
    `);

    res.json({
      success: true,
      count: deliveries.length,
      data: deliveries
    });
  } catch (err) {
    next(err);
  }
});

// 2. Update Delivery Status (Out for Delivery -> Delivered)
router.put('/orders/:deliveryId/status', async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const { status, delivery_notes } = req.body; // 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'
    const db = getDb();

    const delivery = await db.get('SELECT * FROM deliveries WHERE id = ?', [deliveryId]);
    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Delivery record not found' });
    }

    let deliveredAt = null;
    let dispatchedAt = delivery.dispatched_at;
    let orderStatusUpdate = ORDER_STATUSES.READY_FOR_DISPATCH;

    if (status === 'OUT_FOR_DELIVERY') {
      dispatchedAt = dispatchedAt || new Date().toISOString();
      orderStatusUpdate = ORDER_STATUSES.OUT_FOR_DELIVERY;
    } else if (status === 'DELIVERED') {
      deliveredAt = new Date().toISOString();
      orderStatusUpdate = ORDER_STATUSES.DELIVERED;
    }

    await db.run(`
      UPDATE deliveries
      SET delivery_status = ?,
          dispatched_at = ?,
          delivered_at = COALESCE(?, delivered_at),
          delivery_notes = COALESCE(?, delivery_notes),
          assigned_staff_id = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, dispatchedAt, deliveredAt, delivery_notes, req.user.id, deliveryId]);

    // Synchronize parent order
    await db.run(`
      UPDATE orders
      SET order_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [orderStatusUpdate, delivery.order_id]);

    res.json({
      success: true,
      message: `Delivery status updated to ${status}`,
      data: { delivery_status: status, order_status: orderStatusUpdate }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
