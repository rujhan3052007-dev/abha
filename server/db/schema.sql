-- ============================================================================
-- ABHA Production Relational Database Schema
-- Master Specification Aligned: Strict Data Integrity & Zero Fabrication
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. STORES (Multi-Store Architecture Foundation)
CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    phone_primary TEXT NOT NULL,
    phone_secondary TEXT,
    whatsapp TEXT,
    instagram TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. DELIVERY ZONES (Beawar local vs Pan-India)
CREATE TABLE IF NOT EXISTS delivery_zones (
    id TEXT PRIMARY KEY,
    store_id TEXT REFERENCES stores(id) ON DELETE CASCADE,
    pincode TEXT NOT NULL,
    zone_name TEXT NOT NULL,
    delivery_fee REAL NOT NULL DEFAULT 0.0,
    free_delivery_min_amount REAL NOT NULL DEFAULT 0.0,
    estimated_delivery_time TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. USERS (RBAC: OWNER, MANAGER, TAILOR, DELIVERY, CUSTOMER)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL CHECK(role IN ('OWNER', 'MANAGER', 'TAILOR', 'DELIVERY', 'CUSTOMER')),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. CATEGORIES (Salwar Suits active; Sarees, Poshak, Men's as Coming Soon)
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 0, -- 1 = active, 0 = Coming Soon
    badge_text TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. COLLECTIONS
CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    banner_image TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. PRODUCTS (1-of-1 Unique Artisan Items vs Quantity Items)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    fabric TEXT NOT NULL,
    top_length TEXT NOT NULL,
    bottom_length TEXT NOT NULL,
    dupatta_length TEXT NOT NULL,
    work_type TEXT NOT NULL,
    wash_care TEXT NOT NULL,
    base_price REAL NOT NULL,
    stitching_price REAL NOT NULL DEFAULT 450.0,
    inventory_type TEXT NOT NULL CHECK(inventory_type IN ('UNIQUE_1OF1', 'QUANTITY')),
    stock_quantity INTEGER NOT NULL DEFAULT 1,
    is_sold_out INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    primary_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    is_primary INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. INVENTORY TRANSACTIONS (Audit Trail for Online & POS movements)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id TEXT REFERENCES stores(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK(transaction_type IN ('ONLINE_SALE', 'OFFLINE_POS_SALE', 'RESTOCK', 'ADJUSTMENT', 'RETURN')),
    quantity_change INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reference_order_id TEXT,
    performed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL, -- Format: ABHA-YYYYMMDD-XXXX
    customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    order_channel TEXT NOT NULL CHECK(order_channel IN ('ONLINE', 'OFFLINE_POS')),
    store_id TEXT REFERENCES stores(id) ON DELETE SET NULL,
    order_type TEXT NOT NULL CHECK(order_type IN ('UNSTITCHED', 'STITCHED')),
    subtotal REAL NOT NULL,
    stitching_fee REAL NOT NULL DEFAULT 0.0,
    delivery_fee REAL NOT NULL DEFAULT 0.0,
    discount_amount REAL NOT NULL DEFAULT 0.0,
    total_amount REAL NOT NULL,
    payment_status TEXT NOT NULL CHECK(payment_status IN ('PENDING', 'PAID', 'FAILED')),
    payment_method TEXT NOT NULL CHECK(payment_method IN ('RAZORPAY', 'CASH', 'STORE_UPI', 'STORE_CARD')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    order_status TEXT NOT NULL CHECK(order_status IN (
        'PENDING_PAYMENT',
        'PAYMENT_CONFIRMED',
        'IN_CUTTING',
        'IN_STITCHING',
        'STITCHING_COMPLETED',
        'READY_FOR_DISPATCH',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED'
    )),
    cancellation_reason TEXT,
    cancelled_at DATETIME,
    delivery_type TEXT NOT NULL CHECK(delivery_type IN ('LOCAL_HOME_DELIVERY', 'PAN_INDIA_COURIER', 'STORE_PICKUP')),
    shipping_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_pincode TEXT NOT NULL,
    customer_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    sku TEXT NOT NULL,
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_stitched INTEGER NOT NULL DEFAULT 0,
    stitching_price REAL NOT NULL DEFAULT 0.0,
    total_price REAL NOT NULL
);

-- 11. STITCHING DETAILS
CREATE TABLE IF NOT EXISTS stitching_details (
    id TEXT PRIMARY KEY,
    order_item_id TEXT UNIQUE NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    neck_design TEXT NOT NULL,
    sleeve_style TEXT NOT NULL,
    bottom_style TEXT NOT NULL,
    kurta_design TEXT NOT NULL,
    additional_requirements TEXT,
    assigned_tailor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    stitching_status TEXT NOT NULL DEFAULT 'QUEUED' CHECK(stitching_status IN (
        'QUEUED', 'IN_CUTTING', 'IN_STITCHING', 'FINISHING', 'COMPLETED'
    )),
    started_at DATETIME,
    completed_at DATETIME,
    tailor_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. STITCHING REFERENCE IMAGES (Vault Storage - Strictly Private)
CREATE TABLE IF NOT EXISTS stitching_reference_images (
    id TEXT PRIMARY KEY,
    stitching_details_id TEXT NOT NULL REFERENCES stitching_details(id) ON DELETE CASCADE,
    vault_storage_key TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. CUSTOMER MEASUREMENTS ARCHITECTURE (Backing schema for future Measurement Studio)
CREATE TABLE IF NOT EXISTS customer_measurements (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_name TEXT NOT NULL DEFAULT 'Default Profile',
    bust REAL,
    waist REAL,
    hips REAL,
    kurta_length REAL,
    shoulder REAL,
    armhole REAL,
    sleeve_length REAL,
    sleeve_opening REAL,
    front_neck_depth REAL,
    back_neck_depth REAL,
    salwar_length REAL,
    pant_length REAL,
    waist_bottom REAL,
    thigh REAL,
    ankle_opening REAL,
    notes TEXT,
    is_studio_active INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. DELIVERIES
CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    delivery_method TEXT NOT NULL CHECK(delivery_method IN ('IN_HOUSE_STAFF', 'THIRD_PARTY')),
    assigned_staff_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    third_party_name TEXT,
    tracking_number TEXT,
    delivery_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(delivery_status IN (
        'PENDING', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'
    )),
    dispatched_at DATETIME,
    delivered_at DATETIME,
    delivery_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 15. REVIEWS (Authentic Moderated Reviews - Rule 10 strictly enforced)
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    is_verified_buyer INTEGER NOT NULL DEFAULT 1,
    is_approved INTEGER NOT NULL DEFAULT 0, -- 0 = Pending moderation, 1 = Public
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 16. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details_json TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_inventory_tx_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, is_approved);
