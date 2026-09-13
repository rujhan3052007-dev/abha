/**
 * ABHA Secure File Upload Middleware
 * Master Specification: Isolates public product photography from private customer reference vaults
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure storage directories exist
const publicUploadsDir = path.join(__dirname, '../uploads/products');
const privateVaultDir = path.join(__dirname, '../vault/references');

[publicUploadsDir, privateVaultDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// Storage for public product photos
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, publicUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(8).toString('hex');
    cb(null, `prod_${Date.now()}_${hash}${ext}`);
  }
});

// Storage for PRIVATE customer reference images (Vault)
const privateVaultStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, privateVaultDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(16).toString('hex');
    cb(null, `ref_vault_${Date.now()}_${hash}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPG, PNG, and WEBP images are permitted.'), false);
  }
};

const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max for high-res product photos
  fileFilter
});

const uploadReferenceImages = multer({
  storage: privateVaultStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per reference image
  fileFilter
});

module.exports = {
  uploadProductImage,
  uploadReferenceImages,
  publicUploadsDir,
  privateVaultDir
};
