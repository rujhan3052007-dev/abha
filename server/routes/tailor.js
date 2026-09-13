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
const { verifyToken, requireRole } = require('../middleware/auth');
const { ROLES, ORDER_STATUSES, STITCHING_STATUSES } = require('../config/constants');
const { privateVaultDir } = require('../middleware/upload');

// Enforce Tailor, Manager, or Owner roles
router.use(verifyToken);
router.use(requireRole(ROLES.TAILOR, ROLES.MANAGER, ROLES.OWNER));

// 1. Get Tailor Queue (Active Custom Stitched Garments)
router.get('/queue', async (req, res, next) => {
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

// 2. Stream Private Customer Reference Image from Vault (Rule 4 Enforced)
router.get('/reference-image/:key', (req, res) => {
  const { key } = req.params;
  // Prevent directory traversal
  const safeFilename = path.basename(key);
  const filePath = path.join(privateVaultDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Reference file not found in secure vault' });
  }

  res.sendFile(filePath);
});

// 3. Advance Tailoring Status
router.put('/orders/:stitchingId/status', async (req, res, next) => {
  try {
    const { stitchingId } = req.params;
    const { status, tailor_notes } = req.body; // 'IN_CUTTING', 'IN_STITCHING', 'FINISHING', 'COMPLETED'
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

    await db.run(`
      UPDATE stitching_details
      SET stitching_status = ?,
          tailor_notes = COALESCE(?, tailor_notes),
          assigned_tailor_id = ?,
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
