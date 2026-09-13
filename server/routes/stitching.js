/**
 * ABHA Stitching Workflow API
 * Master Specification: Custom neck, sleeve, bottom, kurta options, private reference uploads, and Measurement Studio status
 */

const express = require('express');
const router = express.Router();
const { CUSTOMIZATION_OPTIONS } = require('../config/constants');
const { uploadReferenceImages } = require('../middleware/upload');

// 1. Get Stitching Customization Options
router.get('/options', (req, res) => {
  res.json({
    success: true,
    measurement_studio_status: 'Coming Soon',
    measurement_studio_message: 'Our interactive 3D anatomical measurement studio is currently in development. Please use standard tailoring selections and custom notes for your order.',
    data: {
      neck_designs: CUSTOMIZATION_OPTIONS.NECK_DESIGNS,
      sleeve_styles: CUSTOMIZATION_OPTIONS.SLEEVE_STYLES,
      bottom_styles: CUSTOMIZATION_OPTIONS.BOTTOM_STYLES,
      kurta_designs: CUSTOMIZATION_OPTIONS.KURTA_DESIGNS
    }
  });
});

// 2. Upload Private Reference Images (Max 3 files, 5MB each)
router.post('/upload-reference', uploadReferenceImages.array('reference_images', 3), (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No reference images uploaded' });
    }

    const uploaded = req.files.map(file => ({
      storage_key: file.filename,
      original_name: file.originalname,
      size: file.size,
      mime_type: file.mimetype
    }));

    res.json({
      success: true,
      message: `${uploaded.length} reference image(s) uploaded to private vault`,
      data: uploaded
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
