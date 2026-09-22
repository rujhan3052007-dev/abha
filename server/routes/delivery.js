/**
 * ABHA Local Delivery Management API
 * Master Specification: Doorstep local delivery in Beawar (PIN 305901) and courier dispatching
 */

const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');
const { verifyToken, requireRole, requirePermission, logAudit } = require('../middleware/auth');
const { ROLES, ORDER_STATUSES, DELIVERY_STATUSES } = require('../config/constants');

router.use(verifyToken);

// 1. Get Delivery Queue (For Delivery Manager & Owner)
router.get('/queue', requirePermission('delivery.view'), async (req, res, next) => {
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
        d.assigned_staff_id,
        emp.name as assigned_staff_name,
        o.id as order_id,
        o.order_number,
        o.order_type,
        o.order_status,
        o.shipping_name,
        o.shipping_phone,
        o.shipping_address,
        o.shipping_city,
        o.shipping_pincode,
        o.customer_notes
      FROM deliveries d
      JOIN orders o ON o.id = d.order_id
      LEFT JOIN employees emp ON emp.user_id = d.assigned_staff_id
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

// 2. Delivery Boy: My Deliveries (Focused, privacy-safe, zero financials - §20, §34)
router.get('/my-deliveries', async (req, res, next) => {
  try {
    const db = getDb();
    const deliveries = await db.all(`
      SELECT 
        d.id as delivery_id,
        d.delivery_status,
        d.delivery_notes,
        o.order_number,
        o.shipping_name as customer_name,
        o.shipping_name,
        o.shipping_phone as phone,
        o.shipping_phone,
        o.shipping_address as address,
        o.shipping_address,
        o.shipping_city as city,
        o.shipping_city,
        o.shipping_pincode as pincode,
        o.shipping_pincode,
        o.customer_notes
      FROM deliveries d
      JOIN orders o ON o.id = d.order_id
      WHERE (d.assigned_staff_id = ? OR d.assigned_staff_id IS NULL)
        AND d.delivery_status != 'DELIVERED'
        AND o.order_status != 'CANCELLED'
      ORDER BY o.created_at ASC
    `, [req.user.id]);

    res.json({
      success: true,
      count: deliveries.length,
      data: deliveries
    });
  } catch (err) {
    next(err);
  }
});

// 3. Assign Delivery to Delivery Boy (Delivery Manager & Owner - §5, §15)
router.put('/orders/:deliveryId/assign', requirePermission('delivery.assign'), async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const { staff_id } = req.body;
    const db = getDb();

    const delivery = await db.get('SELECT * FROM deliveries WHERE id = ?', [deliveryId]);
    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Delivery record not found' });
    }

    const prevStaff = delivery.assigned_staff_id;
    let staffName = 'Unassigned';
    if (staff_id) {
      const emp = await db.get('SELECT name FROM employees WHERE user_id = ? OR id = ?', [staff_id, staff_id]);
      if (emp) staffName = emp.name;
    }

    await db.run(`
      UPDATE deliveries
      SET assigned_staff_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [staff_id || null, deliveryId]);

    await logAudit(req, {
      action: 'ASSIGN_DELIVERY',
      entityType: 'DELIVERY',
      entityId: deliveryId,
      previousValue: prevStaff,
      newValue: staff_id,
      details: `${req.user.name || req.user.role} assigned delivery #${deliveryId.slice(-6)} to ${staffName}.`
    });

    res.json({
      success: true,
      message: `Delivery successfully assigned to ${staffName}`,
      data: { delivery_id: deliveryId, assigned_staff_id: staff_id, assigned_staff_name: staffName }
    });
  } catch (err) {
    next(err);
  }
});

// 4. Update Delivery Status (Out for Delivery -> Delivered - §21)
router.put('/orders/:deliveryId/status', async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const { status, delivery_notes } = req.body; // 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RESCHEDULED'
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

    const prevStatus = delivery.delivery_status;

    await db.run(`
      UPDATE deliveries
      SET delivery_status = ?,
          dispatched_at = ?,
          delivered_at = COALESCE(?, delivered_at),
          delivery_notes = COALESCE(?, delivery_notes),
          assigned_staff_id = COALESCE(assigned_staff_id, ?),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, dispatchedAt, deliveredAt, delivery_notes, req.user.id, deliveryId]);

    // Synchronize parent order
    await db.run(`
      UPDATE orders
      SET order_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [orderStatusUpdate, delivery.order_id]);

    await logAudit(req, {
      action: 'UPDATE_DELIVERY_STATUS',
      entityType: 'DELIVERY',
      entityId: deliveryId,
      previousValue: prevStatus,
      newValue: status,
      details: `${req.user.name || req.user.role} updated delivery status to ${status}. Notes: ${delivery_notes || 'None'}`
    });

    res.json({
      success: true,
      message: `Delivery status updated to ${status}`,
      data: { delivery_status: status, order_status: orderStatusUpdate }
    });
  } catch (err) {
    next(err);
  }
});

// 5. Report Delivery Issue (§20)
router.post('/orders/:deliveryId/issue', async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const { reason, notes } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Delivery issue reason is mandatory.' });
    }

    const db = getDb();
    const delivery = await db.get('SELECT * FROM deliveries WHERE id = ?', [deliveryId]);
    if (!delivery) {
      return res.status(404).json({ success: false, error: 'Delivery record not found.' });
    }

    const fullNote = `[ISSUE: ${reason}] ${notes || ''}`.trim();

    await db.run(`
      UPDATE deliveries
      SET delivery_status = 'FAILED',
          delivery_notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [fullNote, deliveryId]);

    await logAudit(req, {
      action: 'REPORT_DELIVERY_ISSUE',
      entityType: 'DELIVERY',
      entityId: deliveryId,
      previousValue: delivery.delivery_status,
      newValue: 'FAILED',
      details: `Delivery issue reported by ${req.user.name || req.user.role}: ${reason}. Notes: ${notes || 'None'}`
    });

    res.json({
      success: true,
      message: `Delivery issue recorded (${reason}). Status set to FAILED for manager review.`,
      data: { delivery_id: deliveryId, status: 'FAILED', reason }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
