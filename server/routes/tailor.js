/**
 * ABHA Tailor Workspace API
 * Master Specification: Dedicated portal for master tailor showing garment customization specs,
 * secure private reference image streaming, and tailoring status progression
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getDb } = require('../config/database');
const { verifyToken, requireRole, requirePermission, logAudit } = require('../middleware/auth');
const { ROLES, ORDER_STATUSES, STITCHING_STATUSES } = require('../config/constants');
const { privateVaultDir } = require('../middleware/upload');

router.use(verifyToken);

// 1. Get Tailor Atelier Queue (For Tailoring Manager & Owner - §7)
router.get('/queue', requirePermission('tailoring.view'), async (req, res, next) => {
  try {
    const db = getDb();
    const items = await db.all(`
      SELECT 
        sd.id as stitching_id,
        sd.neck_design,
        sd.sleeve_style,
        sd.bottom_style,
        sd.kurta_design,
        sd.additional_requirements,
        sd.stitching_status,
        sd.started_at,
        sd.completed_at,
        sd.tailor_notes,
        sd.assigned_tailor_id,
        emp.name as assigned_tailor_name,
        oi.id as order_item_id,
        oi.title as product_title,
        oi.sku as product_sku,
        p.primary_image,
        p.fabric,
        o.id as order_id,
        o.order_number,
        o.order_status,
        o.shipping_name as customer_name,
        o.created_at as order_date
      FROM stitching_details sd
      JOIN order_items oi ON oi.id = sd.order_item_id
      JOIN orders o ON o.id = oi.order_id
      LEFT JOIN products p ON p.id = oi.product_id
      LEFT JOIN employees emp ON emp.user_id = sd.assigned_tailor_id
      WHERE sd.stitching_status != 'COMPLETED' AND o.order_status != 'CANCELLED'
      ORDER BY o.created_at ASC
    `);

    // Attach reference image keys for each stitching order
    for (const item of items) {
      item.reference_images = await db.all(`
        SELECT id, vault_storage_key, original_filename, file_size
        FROM stitching_reference_images
        WHERE stitching_details_id = ?
      `, [item.stitching_id]);
    }

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
});

// 2. Tailor: My Stitching Orders (Strictly focused on tailor's own tasks; NO prices/revenue - §8, §34)
router.get('/my-tasks', async (req, res, next) => {
  try {
    const db = getDb();
    const items = await db.all(`
      SELECT 
        sd.id as stitching_id,
        sd.neck_design,
        sd.sleeve_style,
        sd.bottom_style,
        sd.kurta_design,
        sd.additional_requirements,
        sd.stitching_status,
        sd.started_at,
        sd.completed_at,
        sd.tailor_notes,
        oi.title as product_title,
        oi.sku as product_sku,
        p.primary_image,
        p.fabric,
        o.customer_id,
        o.order_number,
        o.shipping_name as customer_name,
        o.created_at as order_date
      FROM stitching_details sd
      JOIN order_items oi ON oi.id = sd.order_item_id
      JOIN orders o ON o.id = oi.order_id
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE (sd.assigned_tailor_id = ? OR sd.assigned_tailor_id IS NULL)
        AND sd.stitching_status != 'COMPLETED'
        AND o.order_status != 'CANCELLED'
      ORDER BY o.created_at ASC
    `, [req.user.id]);

    for (const item of items) {
      item.reference_images = await db.all(`
        SELECT id, vault_storage_key, original_filename
        FROM stitching_reference_images
        WHERE stitching_details_id = ?
      `, [item.stitching_id]);

      // Fetch customer body measurements if recorded
      let meas = null;
      if (item.customer_id) {
        meas = await db.get(`
          SELECT bust, waist, hips as hip, shoulder, kurta_length as length, sleeve_length, salwar_length, notes
          FROM customer_measurements
          WHERE customer_id = ?
        `, [item.customer_id]);
      }
      item.measurements = meas || null;
      if (meas) {
        item.bust = meas.bust;
        item.waist = meas.waist;
        item.hip = meas.hip;
        item.length = meas.length;
        item.shoulder = meas.shoulder;
      }
    }

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
});

// 3. Assign Stitching Order to Tailor (Tailoring Manager & Owner - §7, §15)
router.put('/orders/:stitchingId/assign', requirePermission('tailoring.assign'), async (req, res, next) => {
  try {
    const { stitchingId } = req.params;
    const { tailor_id } = req.body;
    const db = getDb();

    const stitching = await db.get('SELECT * FROM stitching_details WHERE id = ?', [stitchingId]);
    if (!stitching) {
      return res.status(404).json({ success: false, error: 'Stitching record not found' });
    }

    const prevTailor = stitching.assigned_tailor_id;
    let tailorName = 'Unassigned';
    if (tailor_id) {
      const emp = await db.get('SELECT name FROM employees WHERE user_id = ? OR id = ?', [tailor_id, tailor_id]);
      if (emp) tailorName = emp.name;
    }

    await db.run(`
      UPDATE stitching_details
      SET assigned_tailor_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [tailor_id || null, stitchingId]);

    await logAudit(req, {
      action: 'ASSIGN_TAILOR',
      entityType: 'TAILORING',
      entityId: stitchingId,
      previousValue: prevTailor,
      newValue: tailor_id,
      details: `${req.user.name || req.user.role} assigned stitching #${stitchingId.slice(-6)} to ${tailorName}.`
    });

    res.json({
      success: true,
      message: `Stitching task assigned to ${tailorName}`,
      data: { stitching_id: stitchingId, assigned_tailor_id: tailor_id, assigned_tailor_name: tailorName }
    });
  } catch (err) {
    next(err);
  }
});

// 4. Stream Private Customer Reference Image from Vault (Rule 4 Enforced)
router.get('/reference-image/:key', (req, res) => {
  const { key } = req.params;
  const safeFilename = path.basename(key);
  const filePath = path.join(privateVaultDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Reference file not found in secure vault' });
  }

  res.sendFile(filePath);
});

// 5. Advance Tailoring Status (§7, §8)
router.put('/orders/:stitchingId/status', async (req, res, next) => {
  try {
    const { stitchingId } = req.params;
    const { status, tailor_notes } = req.body; // 'IN_CUTTING', 'IN_STITCHING', 'FINISHING', 'QUALITY_CHECK', 'ALTERATION', 'COMPLETED'
    const db = getDb();

    const stitching = await db.get('SELECT * FROM stitching_details WHERE id = ?', [stitchingId]);
    if (!stitching) {
      return res.status(404).json({ success: false, error: 'Stitching record not found' });
    }

    const orderItem = await db.get('SELECT order_id FROM order_items WHERE id = ?', [stitching.order_item_id]);

    let newOrderStatus = ORDER_STATUSES.IN_CUTTING;
    let completedAt = null;
    let startedAt = stitching.started_at || new Date().toISOString();

    if (status === 'IN_STITCHING') {
      newOrderStatus = ORDER_STATUSES.IN_STITCHING;
    } else if (status === 'COMPLETED') {
      newOrderStatus = ORDER_STATUSES.STITCHING_COMPLETED;
      completedAt = new Date().toISOString();
    }

    const prevStatus = stitching.stitching_status;

    await db.run(`
      UPDATE stitching_details
      SET stitching_status = ?,
          tailor_notes = COALESCE(?, tailor_notes),
          assigned_tailor_id = COALESCE(assigned_tailor_id, ?),
          started_at = ?,
          completed_at = COALESCE(?, completed_at),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, tailor_notes, req.user.id, startedAt, completedAt, stitchingId]);

    // Update parent order status
    if (orderItem) {
      await db.run(`
        UPDATE orders
        SET order_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newOrderStatus, orderItem.order_id]);
    }

    await logAudit(req, {
      action: 'UPDATE_TAILORING_STATUS',
      entityType: 'TAILORING',
      entityId: stitchingId,
      previousValue: prevStatus,
      newValue: status,
      details: `${req.user.name || req.user.role} updated tailoring status to ${status}. Notes: ${tailor_notes || 'None'}`
    });

    res.json({
      success: true,
      message: `Garment status advanced to ${status}`,
      data: { stitching_status: status, order_status: newOrderStatus }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
