/**
 * ABHA E-Commerce Master Backend Server
 * Master Specification Aligned: Production-ready, secure, store-synchronized architecture
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { BRAND } = require('./config/constants');
const { getDb } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const stitchingRoutes = require('./routes/stitching');
const ordersRoutes = require('./routes/orders');
const paymentsRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const tailorRoutes = require('./routes/tailor');
const deliveryRoutes = require('./routes/delivery');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection on boot
getDb();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Permissive for local preview scripts and SVG rendering
  crossOriginEmbedderPolicy: false
}));

const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5000,http://127.0.0.1:5000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl) or matching allowed origins
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Assets
// 1. Public Product Uploads
app.use('/uploads/products', express.static(path.join(__dirname, 'uploads/products')));
// 2. Client Storefront Assets (Root d:/ABHA)
app.use(express.static(path.join(__dirname, '..')));

// NOTE: Rule 4 Compliance - Private Reference Vault (/vault) is intentionally NOT mounted as static!
// It is exclusively accessible via authenticated API /api/tailor/reference-image/:key.

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/stitching', stitchingRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tailor', tailorRoutes);
app.use('/api/delivery', deliveryRoutes);

// Health Check & Brand Info Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    brand: BRAND.NAME,
    tagline: BRAND.TAGLINE,
    flagship_store: BRAND.PRIMARY_STORE,
    contacts: {
      phone_primary: BRAND.PHONE_PRIMARY,
      phone_secondary: BRAND.PHONE_SECONDARY,
      whatsapp: BRAND.WHATSAPP,
      instagram: BRAND.INSTAGRAM
    },
    version: '1.0.0-production'
  });
});

// Fallback to Storefront for client navigation
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin.html'));
});

// Central Error Handler
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n===============================================================`);
    console.log(`  ABHA Production E-Commerce Platform Server Running`);
    console.log(`  Flagship Store: ${BRAND.PRIMARY_STORE.NAME}, ${BRAND.PRIMARY_STORE.CITY}`);
    console.log(`  Local URL:      http://localhost:${PORT}`);
    console.log(`  Admin Portal:   http://localhost:${PORT}/admin.html`);
    console.log(`===============================================================\n`);
  });
}

module.exports = app;
