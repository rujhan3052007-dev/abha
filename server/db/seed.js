/**
 * ABHA Database Seeder
 * Master Specification Aligned: Real store details, zero-fabrication, authentic products
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');
const { BRAND, ROLES, INVENTORY_TYPES, TRANSACTION_TYPES } = require('../config/constants');

async function seed() {
  const db = getDb();
  console.log('[ABHA Seed] Initializing database schema from schema.sql...');

  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await db.exec(schemaSql);
  console.log('[ABHA Seed] Schema tables and indices initialized.');

  // 1. Primary Store
  const storeId = 'store_beawar_01';
  const existingStore = await db.get('SELECT id FROM stores WHERE code = ?', [BRAND.PRIMARY_STORE.CODE]);
  if (!existingStore) {
    await db.run(`
      INSERT INTO stores (
        id, name, code, address_line1, address_line2, city, state, pincode,
        phone_primary, phone_secondary, whatsapp, instagram, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      storeId,
      BRAND.NAME,
      BRAND.PRIMARY_STORE.CODE,
      BRAND.PRIMARY_STORE.ADDRESS_LINE1,
      BRAND.PRIMARY_STORE.ADDRESS_LINE2,
      BRAND.PRIMARY_STORE.CITY,
      BRAND.PRIMARY_STORE.STATE,
      BRAND.PRIMARY_STORE.PINCODE,
      BRAND.PHONE_PRIMARY,
      BRAND.PHONE_SECONDARY,
      BRAND.WHATSAPP,
      BRAND.INSTAGRAM
    ]);
    console.log('[ABHA Seed] Primary Flagship Store registered (Beawar).');
  }

  // 2. Delivery Zones
  const existingZone = await db.get('SELECT id FROM delivery_zones WHERE pincode = ?', ['305901']);
  if (!existingZone) {
    await db.run(`
      INSERT INTO delivery_zones (
        id, store_id, pincode, zone_name, delivery_fee, free_delivery_min_amount, estimated_delivery_time, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      'zone_beawar_central',
      storeId,
      '305901',
      'Beawar City & Nearby Localities',
      0.0, // Free local doorstep delivery
      0.0,
      'Same Day / Within 24 Hours'
    ]);
    console.log('[ABHA Seed] Local delivery zone (Beawar 305901) initialized.');
  }

  // 3. Staff & Test Users
  const salt = bcrypt.genSaltSync(10);
  const usersToSeed = [
    {
      id: 'usr_owner_01',
      name: 'ABHA Management',
      phone: BRAND.PHONE_PRIMARY,
      email: 'admin@abha.in',
      password: 'AbhaAdmin2026!',
      role: ROLES.OWNER
    },
    {
      id: 'usr_manager_01',
      name: 'Store Manager',
      phone: BRAND.PHONE_SECONDARY,
      email: 'manager@abha.in',
      password: 'AbhaManager2026!',
      role: ROLES.MANAGER
    },
    {
      id: 'usr_tailor_01',
      name: 'Master Tailor (Beawar)',
      phone: '9829000001',
      email: 'master.tailor@abha.in',
      password: 'AbhaTailor2026!',
      role: ROLES.TAILOR
    },
    {
      id: 'usr_delivery_01',
      name: 'Local Delivery Fleet',
      phone: '9829000002',
      email: 'delivery@abha.in',
      password: 'AbhaDelivery2026!',
      role: ROLES.DELIVERY
    },
    {
      id: 'usr_customer_01',
      name: 'Priya Sharma',
      phone: '9829123456',
      email: 'priya.sharma@example.com',
      password: 'CustomerPass2026!',
      role: ROLES.CUSTOMER
    }
  ];

  for (const u of usersToSeed) {
    const exists = await db.get('SELECT id FROM users WHERE phone = ?', [u.phone]);
    if (!exists) {
      const hash = bcrypt.hashSync(u.password, salt);
      await db.run(`
        INSERT INTO users (id, name, phone, email, password_hash, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `, [u.id, u.name, u.phone, u.email, hash, u.role]);
    }
  }
  console.log('[ABHA Seed] Staff and test user accounts created.');

  // 4. Categories (Salwar Suit is ACTIVE; others marked COMING SOON per Master Spec Section 2)
  const categoriesToSeed = [
    {
      id: 'cat_salwar_suits',
      name: 'Salwar Suit Dress Materials',
      slug: 'salwar-suit-dress-materials',
      description: 'Handcrafted traditional and festive salwar suit dress materials with authentic Rajasthani craft.',
      is_active: 1,
      badge_text: 'Active Collection',
      display_order: 1
    },
    {
      id: 'cat_sarees',
      name: 'Sarees',
      slug: 'sarees',
      description: 'Handloom, Chanderi, and Silk Sarees curated from master weavers.',
      is_active: 0,
      badge_text: 'Coming Soon',
      display_order: 2
    },
    {
      id: 'cat_rajputi_poshak',
      name: 'Rajputi Poshak',
      slug: 'rajputi-poshak',
      description: 'Royal Rajasthani Poshaks with traditional zari, gotta patti, and kundan handwork.',
      is_active: 0,
      badge_text: 'Coming Soon',
      display_order: 3
    },
    {
      id: 'cat_chaniya_choli',
      name: 'Chaniya Choli',
      slug: 'chaniya-choli',
      description: 'Festive Navratri and wedding lehengas and chaniya cholis.',
      is_active: 0,
      badge_text: 'Coming Soon',
      display_order: 4
    },
    {
      id: 'cat_mens_traditional',
      name: 'Men’s Traditional Clothing',
      slug: 'mens-traditional',
      description: 'Classic Kurta Pajamas, Nehru jackets, and festive menswear.',
      is_active: 0,
      badge_text: 'Coming Soon',
      display_order: 5
    }
  ];

  for (const c of categoriesToSeed) {
    const exists = await db.get('SELECT id FROM categories WHERE slug = ?', [c.slug]);
    if (!exists) {
      await db.run(`
        INSERT INTO categories (id, name, slug, description, is_active, badge_text, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [c.id, c.name, c.slug, c.description, c.is_active, c.badge_text, c.display_order]);
    }
  }
  console.log('[ABHA Seed] Categories configured (Salwar Suit active, future categories as Coming Soon).');

  // 5. Authentic Products (Strictly the 5 real salwar suit dress materials)
  const productsToSeed = [
    {
      id: 'prod_ss_001',
      sku: 'ABHA-SS-001',
      title: 'Cream & Lime Cotton Salwar Suit Material',
      slug: 'cream-lime-cotton-salwar-suit',
      category_id: 'cat_salwar_suits',
      description: 'Authentic pure cotton dress material in soothing cream and lime palette with handcrafted floral motifs. Breathable, durable, and comfortable for all-day elegance.',
      fabric: '100% Pure Fine Cotton',
      top_length: '2.50 Meters',
      bottom_length: '2.50 Meters',
      dupatta_length: '2.25 Meters',
      work_type: 'Delicate Hand Block & Floral Motif Print',
      wash_care: 'Gentle Hand Wash in Cold Water',
      base_price: 1450.00,
      stitching_price: 450.00,
      inventory_type: INVENTORY_TYPES.UNIQUE_1OF1,
      stock_quantity: 1,
      primary_image: 'images/cream-lime-cotton-suit.jpg',
      is_featured: 1
    },
    {
      id: 'prod_ss_002',
      sku: 'ABHA-SS-002',
      title: 'Magenta Chanderi Silk Zari Suit Material',
      slug: 'magenta-chanderi-silk-suit',
      category_id: 'cat_salwar_suits',
      description: 'Regal magenta chanderi silk suit featuring handwoven zari booti and a shimmering border. Ideal for festive gatherings, weddings, and traditional celebrations.',
      fabric: 'Chanderi Silk with Golden Zari Border',
      top_length: '2.50 Meters',
      bottom_length: '2.50 Meters (Santoon)',
      dupatta_length: '2.40 Meters (Chanderi Silk)',
      work_type: 'Woven Zari Weave & Traditional Booti Work',
      wash_care: 'Dry Clean Recommended',
      base_price: 2650.00,
      stitching_price: 550.00,
      inventory_type: INVENTORY_TYPES.UNIQUE_1OF1,
      stock_quantity: 1,
      primary_image: 'images/magenta-chanderi-silk-suit.jpg',
      is_featured: 1
    },
    {
      id: 'prod_ss_003',
      sku: 'ABHA-SS-003',
      title: 'Mustard Bandhani Chanderi Festive Suit',
      slug: 'mustard-bandhani-chanderi-suit',
      category_id: 'cat_salwar_suits',
      description: 'Vibrant mustard and red traditional Rajasthani bandhani dress material. Embellished with classic tie-dye patterns and subtle gota patti border highlights.',
      fabric: 'Chanderi Cotton-Silk with Authentic Bandhej',
      top_length: '2.50 Meters',
      bottom_length: '2.50 Meters',
      dupatta_length: '2.30 Meters (Bandhani Dupatta)',
      work_type: 'Traditional Rajasthani Bandhani Tie-and-Dye',
      wash_care: 'Dry Clean First Wash, Hand Wash Separately Thereafter',
      base_price: 2250.00,
      stitching_price: 450.00,
      inventory_type: INVENTORY_TYPES.QUANTITY,
      stock_quantity: 5,
      primary_image: 'images/mustard-bandhani-chanderi-suit.jpg',
      is_featured: 1
    },
    {
      id: 'prod_ss_004',
      sku: 'ABHA-SS-004',
      title: 'Pink Leheriya Pure Cotton Summer Suit',
      slug: 'pink-leheriya-cotton-suit',
      category_id: 'cat_salwar_suits',
      description: 'Lightweight cambric cotton suit showcasing traditional Rajasthani pink and white leheriya diagonals. Accompanied by a whisper-soft malmal dupatta.',
      fabric: 'Cambric Cotton with Leheriya Waves',
      top_length: '2.50 Meters',
      bottom_length: '2.50 Meters',
      dupatta_length: '2.25 Meters (Cotton Malmal)',
      work_type: 'Authentic Leheriya Wave Resist Dye',
      wash_care: 'Gentle Machine Wash with Like Colors',
      base_price: 1350.00,
      stitching_price: 400.00,
      inventory_type: INVENTORY_TYPES.QUANTITY,
      stock_quantity: 4,
      primary_image: 'images/pink-leheriya-cotton-suit.jpg',
      is_featured: 0
    },
    {
      id: 'prod_ss_005',
      sku: 'ABHA-SS-005',
      title: 'Teal Geometric Handcrafted Cotton Suit',
      slug: 'teal-geometric-cotton-suit',
      category_id: 'cat_salwar_suits',
      description: 'Modern geometric motifs meet traditional Rajasthani hand block techniques on rich teal glazed cotton fabric with lustrous finish.',
      fabric: 'Glazed Cotton Silk Blend',
      top_length: '2.50 Meters',
      bottom_length: '2.50 Meters',
      dupatta_length: '2.30 Meters',
      work_type: 'Geometric Contemporary Hand Block Print',
      wash_care: 'Cold Water Wash',
      base_price: 1650.00,
      stitching_price: 450.00,
      inventory_type: INVENTORY_TYPES.UNIQUE_1OF1,
      stock_quantity: 1,
      primary_image: 'images/teal-geometric-cotton-suit.jpg',
      is_featured: 0
    }
  ];

  for (const p of productsToSeed) {
    const exists = await db.get('SELECT id FROM products WHERE sku = ?', [p.sku]);
    if (!exists) {
      await db.run(`
        INSERT INTO products (
          id, sku, title, slug, category_id, description, fabric,
          top_length, bottom_length, dupatta_length, work_type, wash_care,
          base_price, stitching_price, inventory_type, stock_quantity,
          is_sold_out, is_featured, is_active, primary_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 1, ?)
      `, [
        p.id, p.sku, p.title, p.slug, p.category_id, p.description, p.fabric,
        p.top_length, p.bottom_length, p.dupatta_length, p.work_type, p.wash_care,
        p.base_price, p.stitching_price, p.inventory_type, p.stock_quantity,
        p.is_featured, p.primary_image
      ]);

      // Seed initial inventory log
      await db.run(`
        INSERT INTO inventory_transactions (
          id, product_id, store_id, transaction_type, quantity_change, quantity_after, performed_by_user_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `itx_init_${p.id}`,
        p.id,
        storeId,
        TRANSACTION_TYPES.RESTOCK,
        p.stock_quantity,
        p.stock_quantity,
        'usr_owner_01',
        'Initial store stock intake'
      ]);
    }
  }
  console.log('[ABHA Seed] Real Salwar Suit dress material products seeded with inventory audit logs.');

  console.log('[ABHA Seed] Database seeding completed successfully.');
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('[ABHA Seed] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[ABHA Seed Fatal Error]', err);
      process.exit(1);
    });
}

module.exports = seed;
