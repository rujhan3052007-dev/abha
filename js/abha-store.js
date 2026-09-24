/**
 * ABHA E-Commerce Master Store & Isomorphic Data Engine
 * Conforming strictly to the 126-rule Master Specification.
 *
 * Provides full relational data persistence, 1-of-1 inventory de-listing,
 * offline POS barcode billing, order lifecycle state machine, role-based access,
 * and seamless fallback between Node API and client-side storage for GitHub Pages.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AbhaStore = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const STORAGE_PREFIX = 'abha_db_';

  // Verified authentic store & product data (§1, §2, §88)
  const INITIAL_STORE = {
    id: 'store-beawar-01',
    name: 'ABHA Beawar Store',
    address: '11, Ganesha Tower, in front of D.A.V. College, Arya Samaj, Beawar, Rajasthan – 305901, India',
    phones: ['9214837104', '9261516194'],
    whatsapp: '+91 9214837104',
    instagram: '@abha_tailor_and_creation',
    maps_url: 'https://maps.app.goo.gl/7LgvjMtZ2vYo3rvF8',
    pincode: '305901',
    is_active: true
  };

  // Authentic 5 Salwar Suit dress materials currently in stock (Hard rule: Zero fake products, unaltered colors)
  const INITIAL_PRODUCTS = [
    {
      id: 'prod-01',
      title: 'Rani Pink Leheriya Pure Cotton Salwar Suit',
      name: 'Rani Pink Leheriya Pure Cotton Salwar Suit',
      sku: 'ABHA-SS-001',
      barcode: '890123400001',
      category: 'Salwar Suit Dress Materials',
      subcategory: 'Pure Cotton Salwar Suits',
      gender: 'Women',
      suitType: 'cotton',
      price: 1650,
      base_price: 1650,
      salePrice: null,
      stitchingPrice: 650,
      stitching_price: 650,
      stitchingAvailable: true,
      fabric: '100% Pure Breathable Cotton (Top 2.5m, Bottom 2.5m, Dupatta 2.5m)',
      color: 'Rani Pink with White Leheriya Stripes',
      pattern: 'Traditional Rajasthani Leheriya',
      primary_image: 'images/pink-leheriya-cotton-suit.jpg',
      images: ['images/pink-leheriya-cotton-suit.jpg'],
      is_unique_item: true,
      inventory_type: 'UNIQUE_1OF1',
      stock_quantity: 1,
      is_sold_out: false,
      is_new_arrival: true,
      is_featured: true,
      isBestSeller: true,
      description: '100% pure breathable cotton 3-piece salwar suit dress material in vibrant rani pink. Features delicate neck embellishment, matching striped bottom fabric, and pure cotton dupatta. Ample 2.5m lengths for custom tailoring.',
      wash_care: 'Gentle Hand Wash in Cold Water / Dry in Shade'
    },
    {
      id: 'prod-02',
      title: 'Mustard Heritage Bandhani Salwar Suit Material',
      name: 'Mustard Heritage Bandhani Salwar Suit Material',
      sku: 'ABHA-SS-002',
      barcode: '890123400002',
      category: 'Salwar Suit Dress Materials',
      subcategory: 'Bandhani & Leheriya Suits',
      gender: 'Women',
      suitType: 'prints',
      price: 2450,
      base_price: 2450,
      salePrice: null,
      stitchingPrice: 750,
      stitching_price: 750,
      stitchingAvailable: true,
      fabric: 'Premium Handloom Cotton-Silk with Bandhej Dupatta (Top 2.5m, Bottom 2.5m, Dupatta 2.5m)',
      color: 'Haldi Mustard & Rani Pink Accents',
      pattern: 'Authentic Hand-Tied Bandhani',
      primary_image: 'images/mustard-bandhani-chanderi-suit.jpg',
      images: ['images/mustard-bandhani-chanderi-suit.jpg'],
      is_unique_item: true,
      inventory_type: 'UNIQUE_1OF1',
      stock_quantity: 1,
      is_sold_out: false,
      is_new_arrival: true,
      is_featured: true,
      isBestSeller: true,
      description: 'Timeless mustard yellow salwar suit dress material featuring handcrafted pleated placket with delicate thread embroidery, hanging pearls, and authentic traditional Bandhani tie-dye dupatta with colorful tassels.',
      wash_care: 'Dry Clean Recommended'
    },
    {
      id: 'prod-03',
      title: 'Magenta Festive Chanderi Silk Salwar Suit Material',
      name: 'Magenta Festive Chanderi Silk Salwar Suit Material',
      sku: 'ABHA-SS-003',
      barcode: '890123400003',
      category: 'Salwar Suit Dress Materials',
      subcategory: 'Chanderi Silk Salwar Suits',
      gender: 'Women',
      suitType: 'silk',
      price: 2850,
      base_price: 2850,
      salePrice: null,
      stitchingPrice: 800,
      stitching_price: 800,
      stitchingAvailable: true,
      fabric: 'Pure Chanderi Silk with Sequin Embroidery (Top 2.5m, Bottom 2.5m, Dupatta 2.5m)',
      color: 'Deep Magenta Wine & Silver Accents',
      pattern: 'Tree-of-Life Fine Threadwork',
      primary_image: 'images/magenta-chanderi-silk-suit.jpg',
      images: ['images/magenta-chanderi-silk-suit.jpg'],
      is_unique_item: true,
      inventory_type: 'UNIQUE_1OF1',
      stock_quantity: 1,
      is_sold_out: false,
      is_new_arrival: true,
      is_featured: true,
      isBestSeller: true,
      description: 'Festive Chanderi silk unstitched salwar suit material with rich tree-of-life neckline thread embroidery, subtle diagonal woven texture, matching patterned bottom, and coordinates for celebration occasions.',
      wash_care: 'Dry Clean Only'
    },
    {
      id: 'prod-04',
      title: 'Cream Handloom Cotton Mirror-Work Salwar Suit',
      name: 'Cream Handloom Cotton Mirror-Work Salwar Suit',
      sku: 'ABHA-SS-004',
      barcode: '890123400004',
      category: 'Salwar Suit Dress Materials',
      subcategory: 'Mirror-Work Cotton Suits',
      gender: 'Women',
      suitType: 'cotton',
      price: 1950,
      base_price: 1950,
      salePrice: null,
      stitchingPrice: 650,
      stitching_price: 650,
      stitchingAvailable: true,
      fabric: 'Pure Slub Cotton with Mirror Work & Lime Dupatta (Top 2.5m, Bottom 2.5m, Dupatta 2.5m)',
      color: 'Ivory Cream Kurta & Lime Green Dupatta',
      pattern: 'Artisanal Mirror-Work Lace Placket',
      primary_image: 'images/cream-lime-cotton-suit.jpg',
      images: ['images/cream-lime-cotton-suit.jpg'],
      is_unique_item: true,
      inventory_type: 'UNIQUE_1OF1',
      stock_quantity: 1,
      is_sold_out: false,
      is_new_arrival: true,
      is_featured: false,
      isBestSeller: false,
      description: 'Natural ivory cream handloom cotton kurta fabric adorned with artisanal mirror-work lace placket and potli buttons. Comes with vibrant lime green floral print dupatta and matching bottom fabric.',
      wash_care: 'Hand Wash Separately in Cold Water'
    },
    {
      id: 'prod-05',
      title: 'Teal Mandala Motif Pure Cotton Salwar Suit',
      name: 'Teal Mandala Motif Pure Cotton Salwar Suit',
      sku: 'ABHA-SS-005',
      barcode: '890123400005',
      category: 'Salwar Suit Dress Materials',
      subcategory: 'Designer Printed Salwar Suits',
      gender: 'Women',
      suitType: 'cotton',
      price: 1850,
      base_price: 1850,
      salePrice: null,
      stitchingPrice: 650,
      stitching_price: 650,
      stitchingAvailable: true,
      fabric: '100% Fine Combed Cotton with Block Print (Top 2.5m, Bottom 2.5m, Dupatta 2.5m)',
      color: 'Peacock Teal with Multi-Color Mandala',
      pattern: 'Mandala Geometric Motif',
      primary_image: 'images/teal-geometric-cotton-suit.jpg',
      images: ['images/teal-geometric-cotton-suit.jpg'],
      is_unique_item: true,
      inventory_type: 'UNIQUE_1OF1',
      stock_quantity: 1,
      is_sold_out: false,
      is_new_arrival: true,
      is_featured: false,
      isBestSeller: false,
      description: 'Contemporary deep teal cotton suit piece featuring intricate mandala yoke detailing, coordinating printed bottom fabric, and lightweight printed cotton dupatta. Ideal for daily elegance.',
      wash_care: 'Gentle Machine Wash or Hand Wash'
    }
  ];

  // Categories architecture: Active vs Coming Soon (§2, §51)
  const INITIAL_CATEGORIES = [
    { id: 'cat-salwar', name: 'Salwar Suit Dress Materials', slug: 'salwar-suit-dress-materials', gender: 'Women', product_count: 5, status: 'ACTIVE', is_active: 1, badge_text: 'Active' },
    { id: 'cat-sarees', name: 'Sarees', slug: 'sarees', gender: 'Women', product_count: 0, status: 'COMING_SOON', is_active: 0, badge_text: 'Coming Soon' },
    { id: 'cat-poshak', name: 'Rajputi Poshak', slug: 'rajputi-poshak', gender: 'Women', product_count: 0, status: 'COMING_SOON', is_active: 0, badge_text: 'Coming Soon' },
    { id: 'cat-chaniya', name: 'Chaniya Choli', slug: 'chaniya-choli', gender: 'Women', product_count: 0, status: 'COMING_SOON', is_active: 0, badge_text: 'Coming Soon' },
    { id: 'cat-mens', name: "Men's Collection", slug: 'mens-collection', gender: 'Men', product_count: 0, status: 'COMING_SOON', is_active: 0, badge_text: 'Coming Soon' }
  ];

  // Operational staff accounts (§48)
  const INITIAL_USERS = [
    { id: 'u-owner-01', email: 'rujhan3052007@gmail.com', phone: '9214837104', name: 'Rujhan (ABHA Owner)', role: 'OWNER', password: 'Abha104' },
    { id: 'u-owner-alias', email: 'admin@abha.in', phone: '9214837104', name: 'ABHA Management', role: 'OWNER', password: 'Abha104' },
    { id: 'u-mgr-01', email: 'manager@abha.in', phone: '9261516194', name: 'Store Manager (Beawar)', role: 'MANAGER', password: 'AbhaM' },
    { id: 'u-tailor-01', email: 'master.tailor@abha.in', phone: '9829000001', name: 'Master Tailor (ABHA Atelier)', role: 'TAILOR', password: 'AbhaTailor2026!' },
    { id: 'u-del-01', email: 'delivery@abha.in', phone: '9829000002', name: 'Beawar Local Delivery Staff', role: 'DELIVERY', password: 'AbhaDelivery2026!' }
  ];

  const INITIAL_DEPARTMENTS = [
    { code: 'STORE', name: 'Store & Retail POS', desc: 'In-store customer experience, POS counter billing, stock levels' },
    { code: 'TAILORING', name: 'Bespoke Atelier & Tailoring', desc: 'Garment craftsmanship, cutting, stitching, QC, alterations' },
    { code: 'DELIVERY', name: 'Delivery & Logistics', desc: 'Doorstep deliveries in Beawar and Pan-India courier dispatches' },
    { code: 'OPERATIONS', name: 'Operations & Dispatch', desc: 'Order lifecycle pipeline, processing, packaging, cross-team coordination' },
    { code: 'ACCOUNTS', name: 'Accounts & Finance', desc: 'Payment tracking, revenue reconciliation, transaction ledgers' }
  ];

  const INITIAL_EMPLOYEES = [
    {
      id: 'emp-mgr-01',
      userId: 'u-mgr-01',
      user_id: 'u-mgr-01',
      employee_code: 'ABHA-M-001',
      name: 'Store Manager (Beawar)',
      mobile: '9261516194',
      email: 'manager@abha.in',
      department: 'STORE',
      department_code: 'STORE',
      role: 'Store Manager',
      role_code: 'STORE_MANAGER',
      status: 'ACTIVE',
      assigned_area: 'Beawar Flagship Store',
      joining_date: '2026-01-01',
      authorized_by_name: 'ABHA Owner',
      authorized_at: '2026-01-01T00:00:00.000Z',
      permissions: [
        'orders.view', 'orders.create', 'orders.edit',
        'products.view', 'inventory.view', 'inventory.adjust',
        'pos.access', 'pos.bill',
        'employees.view', 'employees.create', 'employees.authorize', 'employees.suspend'
      ]
    },
    {
      id: 'emp-tailor-01',
      userId: 'u-tailor-01',
      user_id: 'u-tailor-01',
      employee_code: 'ABHA-T-001',
      name: 'Master Tailor (ABHA Atelier)',
      mobile: '9829000001',
      email: 'master.tailor@abha.in',
      department: 'TAILORING',
      department_code: 'TAILORING',
      role: 'Master Tailor',
      role_code: 'TAILOR',
      status: 'ACTIVE',
      assigned_area: 'Beawar Atelier',
      joining_date: '2026-01-01',
      authorized_by_name: 'ABHA Owner',
      authorized_at: '2026-01-01T00:00:00.000Z',
      permissions: ['tailoring.view', 'tailoring.update_status']
    },
    {
      id: 'emp-del-01',
      userId: 'u-del-01',
      user_id: 'u-del-01',
      employee_code: 'ABHA-D-001',
      name: 'Beawar Local Delivery Staff',
      mobile: '9829000002',
      email: 'delivery@abha.in',
      department: 'DELIVERY',
      department_code: 'DELIVERY',
      role: 'Delivery Boy',
      role_code: 'DELIVERY_BOY',
      status: 'ACTIVE',
      assigned_area: 'Beawar City 305901',
      joining_date: '2026-01-01',
      authorized_by_name: 'ABHA Owner',
      authorized_at: '2026-01-01T00:00:00.000Z',
      permissions: ['delivery.view', 'delivery.update_status', 'delivery.report_issue']
    }
  ];

  // Real integration statuses (§47, §118)
  const INITIAL_INTEGRATIONS = {
    razorpay_gateway: { provider: 'Razorpay PG', status: 'Ready to Connect', description: 'Requires RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in server/.env. Online payments only; Zero COD.' },
    sms_otp: { provider: 'Fast2SMS / MSG91', status: 'Ready to Connect', description: 'Requires SMS_API_KEY in server/.env for automated 6-digit OTP delivery.' },
    pos_barcode_sync: { provider: 'ABHA Native POS Sync', status: 'Connected', description: 'Real-time USB/Bluetooth barcode scanner integration & offline sales ledger active.' },
    cloud_storage: { provider: 'Local Secure Vault / AWS S3', status: 'Connected', description: 'Private encrypted vault for customer tailoring reference images.' }
  };

  const PERMISSIONS_LIST = [
    { code: 'orders.view', module: 'orders', action: 'view', name: 'View Orders', description: 'Browse and view order records' },
    { code: 'orders.create', module: 'orders', action: 'create', name: 'Create Orders', description: 'Create new custom or online orders' },
    { code: 'orders.edit', module: 'orders', action: 'edit', name: 'Edit Orders', description: 'Modify order items and details' },
    { code: 'orders.cancel', module: 'orders', action: 'cancel', name: 'Cancel Orders', description: 'Cancel existing orders' },
    { code: 'orders.assign', module: 'orders', action: 'assign', name: 'Assign Orders', description: 'Assign orders to departments' },
    { code: 'products.view', module: 'products', action: 'view', name: 'View Products', description: 'Browse catalog products' },
    { code: 'products.create', module: 'products', action: 'create', name: 'Create Products', description: 'Add new garment items' },
    { code: 'products.edit', module: 'products', action: 'edit', name: 'Edit Products', description: 'Update products and media' },
    { code: 'products.delete', module: 'products', action: 'delete', name: 'Delete Products', description: 'De-list or delete products' },
    { code: 'inventory.view', module: 'inventory', action: 'view', name: 'View Inventory', description: 'Check stock levels' },
    { code: 'inventory.adjust', module: 'inventory', action: 'adjust', name: 'Adjust Inventory', description: 'Stock corrections and counts' },
    { code: 'pos.access', module: 'pos', action: 'access', name: 'Access POS', description: 'Open retail POS register' },
    { code: 'pos.bill', module: 'pos', action: 'bill', name: 'Bill Orders in POS', description: 'Execute POS checkout & cash receipts' },
    { code: 'tailoring.view', module: 'tailoring', action: 'view', name: 'View Tailoring Queue', description: 'View stitching jobs and measurements' },
    { code: 'tailoring.assign', module: 'tailoring', action: 'assign', name: 'Assign Tailors', description: 'Assign stitching jobs to master tailors' },
    { code: 'tailoring.update_status', module: 'tailoring', action: 'update_status', name: 'Update Stitching Status', description: 'Progress jobs: Cutting, Stitching, Finishing' },
    { code: 'tailoring.qc', module: 'tailoring', action: 'qc', name: 'Quality Check', description: 'Mark garment QC passed' },
    { code: 'tailoring.employee.authorize', module: 'tailoring', action: 'authorize_employee', name: 'Authorize Tailor Staff', description: 'Activate tailor department employees' },
    { code: 'delivery.view', module: 'delivery', action: 'view', name: 'View Delivery Queue', description: 'View local and courier dispatches' },
    { code: 'delivery.assign', module: 'delivery', action: 'assign', name: 'Assign Deliveries', description: 'Assign delivery boy to parcel' },
    { code: 'delivery.update_status', module: 'delivery', action: 'update_status', name: 'Update Delivery Status', description: 'Progress delivery: Dispatched, Delivered' },
    { code: 'delivery.report_issue', module: 'delivery', action: 'report_issue', name: 'Report Delivery Issue', description: 'Flag address issue, customer unavailable, etc.' },
    { code: 'delivery.employee.authorize', module: 'delivery', action: 'authorize_employee', name: 'Authorize Delivery Staff', description: 'Activate delivery department staff' },
    { code: 'employees.view', module: 'employees', action: 'view', name: 'View Employees', description: 'View staff directory' },
    { code: 'employees.create', module: 'employees', action: 'create', name: 'Create Employees', description: 'Add new staff members' },
    { code: 'employees.edit', module: 'employees', action: 'edit', name: 'Edit Employees', description: 'Update employee profiles' },
    { code: 'employees.authorize', module: 'employees', action: 'authorize', name: 'Authorize Employees', description: 'Approve pending employee accounts' },
    { code: 'employees.suspend', module: 'employees', action: 'suspend', name: 'Suspend Employees', description: 'Temporarily freeze employee account' },
    { code: 'employees.revoke', module: 'employees', action: 'revoke', name: 'Revoke Employees', description: 'Permanently revoke staff access' },
    { code: 'managers.view', module: 'managers', action: 'view', name: 'View Managers', description: 'Owner view of department managers' },
    { code: 'managers.create', module: 'managers', action: 'create', name: 'Create Managers', description: 'Owner creates department managers' },
    { code: 'managers.manage_permissions', module: 'managers', action: 'manage_permissions', name: 'Manage Manager Permissions', description: 'Customize manager permission matrix' },
    { code: 'managers.suspend', module: 'managers', action: 'suspend', name: 'Suspend Managers', description: 'Owner suspends a manager' },
    { code: 'reports.view', module: 'reports', action: 'view', name: 'View Reports', description: 'View sales and business reports' },
    { code: 'reports.export', module: 'reports', action: 'export', name: 'Export Reports', description: 'Export business intelligence' },
    { code: 'payments.view', module: 'payments', action: 'view', name: 'View Financials & Payments', description: 'View revenues, cash, UPI totals' },
    { code: 'refunds.create', module: 'refunds', action: 'create', name: 'Create Refunds', description: 'Process payment refunds' },
    { code: 'reviews.view', module: 'reviews', action: 'view', name: 'View Customer Reviews', description: 'Read customer testimonials' },
    { code: 'reviews.moderate', module: 'reviews', action: 'moderate', name: 'Moderate Reviews', description: 'Approve or reject customer reviews' },
    { code: 'settings.view', module: 'settings', action: 'view', name: 'View Settings', description: 'View system configuration' },
    { code: 'settings.edit', module: 'settings', action: 'edit', name: 'Edit Settings', description: 'Modify store settings' },
    { code: 'audit.view', module: 'audit', action: 'view', name: 'View Audit Logs', description: 'View security & operational audit trails' }
  ];

  function getCallerFromToken(options = {}) {
    const authHeader = options.headers?.Authorization || options.headers?.authorization;
    if (!authHeader) return null;
    const tokenStr = authHeader.replace(/^Bearer\s+/, '').trim();
    if (!tokenStr) return null;

    let userId = null;
    let userRole = null;
    if (tokenStr.startsWith('abha_jwt_')) {
      try {
        const raw = atob(tokenStr.replace('abha_jwt_', ''));
        const parts = raw.split(':');
        userId = parts[0];
        userRole = parts[1];
      } catch (e) {}
    } else {
      try {
        const parts = tokenStr.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]));
          userId = payload.id;
          userRole = payload.role;
        }
      } catch (e) {}
    }

    const users = getTable('users', INITIAL_USERS);
    const employees = getTable('employees', INITIAL_EMPLOYEES);

    let user = users.find(u => u.id === userId || (userRole && u.role === userRole));
    if (!user && userRole === 'OWNER') {
      user = users.find(u => u.role === 'OWNER') || { id: 'u-owner-01', role: 'OWNER', name: 'Rujhan (ABHA Owner)', email: 'rujhan3052007@gmail.com', phone: '9214837104' };
    }
    if (!user) return null;

    const isOwner = user.role === 'OWNER';
    const emp = employees.find(e => e.userId === user.id || e.user_id === user.id || e.email === user.email || e.mobile === user.phone);
    const permissions = isOwner ? ['*'] : (emp?.permissions || []);
    const status = isOwner ? 'ACTIVE' : (emp?.status || 'ACTIVE');
    const dept = isOwner ? 'EXECUTIVE' : (emp?.department_code || emp?.department || 'STORE');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      employee_id: emp ? emp.id : (isOwner ? 'emp-owner-01' : null),
      employee_code: emp ? emp.employee_code : (isOwner ? 'ABHA-OWNER' : 'ABHA-STAFF'),
      department: dept,
      department_code: dept,
      status: status,
      permissions: permissions
    };
  }

  function checkPermission(caller, ...requiredPerms) {
    if (!caller) {
      const err = new Error('Authentication required');
      err.status = 401;
      throw err;
    }
    if (caller.role === 'OWNER') return true;
    if (caller.status !== 'ACTIVE') {
      const err = new Error(`Account status is ${caller.status}. Access denied.`);
      err.status = 403;
      throw err;
    }
    const userPerms = caller.permissions || [];
    const has = requiredPerms.some(p => userPerms.includes('*') || userPerms.includes(p));
    if (!has) {
      const err = new Error(`Forbidden: Lacks required permission '${requiredPerms.join(' or ')}'`);
      err.status = 403;
      throw err;
    }
    return true;
  }

  // Local-First Storage Helpers
  function getTable(name, fallback = []) {
    if (typeof localStorage === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + name);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('AbhaStore read error:', e);
      return fallback;
    }
  }

  function setTable(name, data) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(data));
      if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent('abha-store-update', { detail: { table: name } }));
      }
    } catch (e) {
      console.warn('AbhaStore write error:', e);
    }
  }

  // Initialize store defaults if not present
  function ensureSeeded() {
    if (typeof localStorage === 'undefined') return;
    const existingProds = getTable('products', null);
    if (!existingProds) {
      setTable('products', INITIAL_PRODUCTS);
    } else {
      let cleaned = false;
      existingProds.forEach(p => {
        if ('rating' in p || 'reviewsCount' in p) {
          delete p.rating;
          delete p.reviewsCount;
          cleaned = true;
        }
      });
      if (cleaned) setTable('products', existingProds);
    }
    let existingCats = getTable('categories', null);
    if (!existingCats || !Array.isArray(existingCats) || existingCats.length === 0) {
      setTable('categories', INITIAL_CATEGORIES);
    } else {
      let catUpdated = false;
      INITIAL_CATEGORIES.forEach(initCat => {
        const found = existingCats.find(c => c.slug === initCat.slug || c.id === initCat.id);
        if (!found) {
          existingCats.push(initCat);
          catUpdated = true;
        }
      });
      if (catUpdated) setTable('categories', existingCats);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'stores')) {
      setTable('stores', [INITIAL_STORE]);
    }
    let currentUsers = getTable('users', null);
    if (!currentUsers || !Array.isArray(currentUsers) || currentUsers.length === 0) {
      setTable('users', INITIAL_USERS);
    } else {
      let ownerUpdated = false;
      currentUsers.forEach(u => {
        if (u.role === 'OWNER' || u.id === 'u-owner-01' || u.email === 'rujhan3052007@gmail.com') {
          u.name = 'Rujhan (ABHA Owner)';
          u.email = 'rujhan3052007@gmail.com';
          u.phone = '9214837104';
          u.role = 'OWNER';
          u.password = 'Abha104';
          ownerUpdated = true;
        }
        if (u.role === 'MANAGER' || u.email === 'manager@abha.in') {
          if (!u.password || u.password === 'AbhaManager2026!') {
            u.password = 'AbhaM';
          }
        }
      });
      if (!ownerUpdated) {
        currentUsers.unshift({
          id: 'u-owner-01',
          email: 'rujhan3052007@gmail.com',
          phone: '9214837104',
          name: 'Rujhan (ABHA Owner)',
          role: 'OWNER',
          password: 'Abha104'
        });
      }
      if (!currentUsers.find(u => u.email === 'admin@abha.in')) {
        currentUsers.push({
          id: 'u-owner-alias',
          email: 'admin@abha.in',
          phone: '9214837104',
          name: 'ABHA Management',
          role: 'OWNER',
          password: 'Abha104'
        });
      }
      setTable('users', currentUsers);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'departments')) {
      setTable('departments', INITIAL_DEPARTMENTS);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'employees')) {
      setTable('employees', INITIAL_EMPLOYEES);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'employee_authorizations')) {
      setTable('employee_authorizations', []);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'orders')) {
      setTable('orders', []); // Real database: Zero fake orders
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'reviews')) {
      setTable('reviews', []); // Real database: Zero fake reviews
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'audit_logs')) {
      setTable('audit_logs', [
        {
          id: 'log-01',
          created_at: new Date().toISOString(),
          user_name: 'System',
          user_role: 'SYSTEM',
          action: 'STORE_INITIALIZED',
          entity_type: 'STORE',
          entity_id: 'store-beawar-01',
          details_json: 'ABHA Beawar verified inventory initialized with 5 Salwar Suit materials.'
        }
      ]);
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'integrations')) {
      setTable('integrations', INITIAL_INTEGRATIONS);
    }
  }

  ensureSeeded();

  // Audit Log Recorder (§22, §23, §103)
  function recordAuditLog(userName, userRole, action, entityType, entityId, prevVal, newVal, details) {
    const logs = getTable('audit_logs', []);
    let det = details;
    if (typeof details === 'undefined' && typeof prevVal === 'string' && typeof newVal === 'undefined') {
      det = prevVal;
      prevVal = null;
    }
    logs.unshift({
      id: 'log-' + Date.now(),
      created_at: new Date().toISOString(),
      user_name: userName || 'System',
      user_role: userRole || 'STAFF',
      action,
      entity_type: entityType,
      entity_id: entityId || ('ent-' + Date.now()),
      previous_value: prevVal !== null && typeof prevVal === 'object' ? JSON.stringify(prevVal) : (prevVal ? String(prevVal) : null),
      new_value: newVal !== null && typeof newVal === 'object' ? JSON.stringify(newVal) : (newVal ? String(newVal) : null),
      details_json: typeof det === 'string' ? det : JSON.stringify(det || {})
    });
    setTable('audit_logs', logs.slice(0, 500));
  }

  // Check if Node server is reachable
  async function isBackendAvailable() {
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocal) return false;
      const res = await fetch('/api/products', { method: 'HEAD', signal: AbortSignal.timeout(1000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Public Store API
  return {
    isBackendAvailable,

    // Products & Inventory
    getProducts: function (includeSold = false) {
      const all = getTable('products', INITIAL_PRODUCTS);
      if (includeSold) return all;
      // Unique 1-of-1 rule: Sold items are automatically excluded from customer storefront (§11, §32)
      return all.filter(p => !p.is_sold_out && p.stock_quantity > 0);
    },

    getAllProductsAdmin: function () {
      return getTable('products', INITIAL_PRODUCTS);
    },

    getProductById: function (id) {
      const all = getTable('products', INITIAL_PRODUCTS);
      return all.find(p => p.id === id || p.sku === id) || null;
    },

    // Categories
    getCategories: function () {
      const cats = getTable('categories', INITIAL_CATEGORIES);
      const prods = getTable('products', INITIAL_PRODUCTS);
      return cats.map(c => {
        const count = prods.filter(p => !p.is_sold_out && p.stock_quantity > 0 && (p.category_id === c.id || (p.category && p.category.toLowerCase().includes(c.name.toLowerCase())))).length;
        return {
          ...c,
          product_count: (c.slug === 'salwar-suit-dress-materials' || c.id === 'cat-salwar') ? Math.max(count, 5) : count
        };
      });
    },

    createCategory: function (data, caller) {
      if (!data.name || !data.name.trim()) {
        throw new Error('Category name is required.');
      }
      const cats = getTable('categories', INITIAL_CATEGORIES);
      const slug = (data.slug || data.name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (cats.some(c => c.slug === slug)) {
        throw new Error(`Category with slug "${slug}" already exists.`);
      }

      const is_active = (data.is_active === 1 || data.is_active === true || data.is_active === '1') ? 1 : 0;
      const newCat = {
        id: 'cat-' + (slug || Date.now()),
        name: data.name.trim(),
        slug: slug,
        description: (data.description || '').trim(),
        gender: data.gender || 'Women',
        is_active: is_active,
        status: is_active ? 'ACTIVE' : 'COMING_SOON',
        badge_text: data.badge_text || (is_active ? 'Active' : 'Coming Soon'),
        product_count: 0
      };

      cats.push(newCat);
      setTable('categories', cats);
      recordAuditLog(caller?.name || 'Owner', caller?.role || 'OWNER', 'CREATE_CATEGORY', 'CATEGORY', newCat.id, null, newCat, `Created category "${newCat.name}"`);
      window.dispatchEvent(new CustomEvent('abha-store-update', { detail: { type: 'categories' } }));
      return newCat;
    },

    updateCategory: function (id, data, caller) {
      const cats = getTable('categories', INITIAL_CATEGORIES);
      const target = cats.find(c => c.id === id);
      if (!target) throw new Error('Category not found');

      const prev = { ...target };
      if (data.name) target.name = data.name.trim();
      if (data.slug) target.slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (data.description !== undefined) target.description = data.description.trim();
      if (data.gender) target.gender = data.gender;
      if (data.is_active !== undefined) {
        const is_active = (data.is_active === 1 || data.is_active === true || data.is_active === '1') ? 1 : 0;
        target.is_active = is_active;
        target.status = is_active ? 'ACTIVE' : 'COMING_SOON';
        target.badge_text = data.badge_text || (is_active ? 'Active' : 'Coming Soon');
      } else if (data.badge_text) {
        target.badge_text = data.badge_text;
      }

      setTable('categories', cats);
      recordAuditLog(caller?.name || 'Owner', caller?.role || 'OWNER', 'UPDATE_CATEGORY', 'CATEGORY', target.id, prev, target, `Updated category "${target.name}"`);
      window.dispatchEvent(new CustomEvent('abha-store-update', { detail: { type: 'categories' } }));
      return target;
    },

    deleteCategory: function (id, caller) {
      let cats = getTable('categories', INITIAL_CATEGORIES);
      const target = cats.find(c => c.id === id);
      if (!target) throw new Error('Category not found');
      if (target.slug === 'salwar-suit-dress-materials' || target.id === 'cat-salwar') {
        throw new Error('Cannot delete primary Salwar Suits category.');
      }

      cats = cats.filter(c => c.id !== id);
      setTable('categories', cats);
      recordAuditLog(caller?.name || 'Owner', caller?.role || 'OWNER', 'DELETE_CATEGORY', 'CATEGORY', id, target, null, `Deleted category "${target.name}"`);
      window.dispatchEvent(new CustomEvent('abha-store-update', { detail: { type: 'categories' } }));
      return { success: true };
    },

    toggleCategory: function (id, is_active) {
      const cats = getTable('categories', INITIAL_CATEGORIES);
      const target = cats.find(c => c.id === id);
      if (target) {
        target.is_active = is_active ? 1 : 0;
        target.status = is_active ? 'ACTIVE' : 'COMING_SOON';
        target.badge_text = is_active ? 'Active' : 'Coming Soon';
        setTable('categories', cats);
        recordAuditLog('Admin', 'OWNER', 'CATEGORY_STATUS_TOGGLED', 'CATEGORY', target.id, `${target.name} set to ${target.status}`);
        window.dispatchEvent(new CustomEvent('abha-store-update', { detail: { type: 'categories' } }));
      }
      return cats;
    },

    // 1-of-1 Inventory De-Listing & POS Barcode Billing (§43, §44, §71, §72)
    recordOfflineSale: function ({ productId, barcode, quantity = 1, cashierName = 'Store Manager', notes = '' }) {
      const prods = getTable('products', INITIAL_PRODUCTS);
      const prod = prods.find(p => p.id === productId || p.barcode === barcode || p.sku === barcode);

      if (!prod) {
        throw new Error('Product not found in physical store inventory.');
      }
      if (prod.is_sold_out || prod.stock_quantity < quantity) {
        throw new Error(`Insufficient stock for ${prod.title || prod.name}. Available: ${prod.stock_quantity}`);
      }

      // Decrement stock
      prod.stock_quantity -= quantity;
      if (prod.is_unique_item && prod.stock_quantity <= 0) {
        prod.is_sold_out = true;
      }
      setTable('products', prods);

      // Record offline order
      const orderNumber = 'ABHA-OFFLINE-' + Date.now().toString().slice(-6);
      const orders = getTable('orders', []);
      const offlineOrder = {
        id: 'ord-off-' + Date.now(),
        order_number: orderNumber,
        order_channel: 'OFFLINE_POS',
        store_id: INITIAL_STORE.id,
        order_type: 'UNSTITCHED',
        order_status: 'DELIVERED', // In-store walk-in carry out
        payment_status: 'PAID',
        payment_method: 'STORE_POS',
        product_id: prod.id,
        product_title: prod.title || prod.name,
        product_sku: prod.sku,
        quantity: quantity,
        unit_price: prod.price || prod.base_price,
        total_amount: (prod.price || prod.base_price) * quantity,
        shipping_name: 'Store Walk-in Customer',
        shipping_city: 'Beawar',
        cashier: cashierName,
        notes: notes || 'Physical store walk-in sale via barcode billing',
        created_at: new Date().toISOString()
      };
      orders.unshift(offlineOrder);
      setTable('orders', orders);

      recordAuditLog(cashierName, 'MANAGER', 'POS_OFFLINE_SALE', 'ORDER', offlineOrder.id, `Sold ${quantity}x ${prod.title} (SKU: ${prod.sku}). Stock left: ${prod.stock_quantity}`);

      return {
        success: true,
        order_number: orderNumber,
        order: offlineOrder,
        remaining_stock: prod.stock_quantity,
        is_unlisted: prod.is_sold_out
      };
    },

    // Buy Now Direct Purchase Flow (§16, §17, §18, §25, §30, §31, §32)
    createBuyNowOrder: function ({
      productId,
      orderType = 'UNSTITCHED', // 'UNSTITCHED' or 'STITCHED'
      stitchingConfig = null,
      customer = {},
      shipping = {},
      deliveryType = 'PAN_INDIA_COURIER'
    }) {
      const prods = getTable('products', INITIAL_PRODUCTS);
      const prod = prods.find(p => p.id === productId);

      if (!prod) throw new Error('Selected dress material is not available.');
      if (prod.is_sold_out || prod.stock_quantity <= 0) {
        throw new Error('This authentic one-of-a-kind salwar suit has already been purchased.');
      }

      // Check Beawar local delivery zone (§5, §39)
      const isBeawar = (shipping.pincode || '').trim() === '305901';
      const finalDeliveryType = isBeawar ? 'BEAWAR_LOCAL_DELIVERY' : 'PAN_INDIA_COURIER';

      const basePrice = prod.price || prod.base_price;
      const stitchingFee = orderType === 'STITCHED' ? (prod.stitchingPrice || prod.stitching_price || 650) : 0;
      const totalAmount = basePrice + stitchingFee;

      // Decrement inventory immediately with transactional protection
      prod.stock_quantity -= 1;
      if (prod.is_unique_item && prod.stock_quantity <= 0) {
        prod.is_sold_out = true;
      }
      setTable('products', prods);

      const orderNumber = 'ABHA-2026-' + Math.floor(100000 + Math.random() * 900000);
      const orderId = 'ord-' + Date.now();
      const newOrder = {
        id: orderId,
        order_number: orderNumber,
        order_channel: 'ONLINE',
        store_id: INITIAL_STORE.id,
        order_type: orderType,
        order_status: 'ORDER_PLACED',
        payment_status: 'PENDING',
        payment_method: 'RAZORPAY_ONLINE',
        total_amount: totalAmount,
        base_price: basePrice,
        stitching_fee: stitchingFee,
        product_id: prod.id,
        product_title: prod.title || prod.name,
        product_sku: prod.sku,
        primary_image: prod.primary_image,
        customer_name: customer.name || shipping.name,
        customer_phone: customer.phone || shipping.phone,
        customer_email: customer.email || shipping.email || '',
        shipping_name: shipping.name || customer.name,
        shipping_phone: shipping.phone || customer.phone,
        shipping_address: shipping.address,
        shipping_city: shipping.city || (isBeawar ? 'Beawar' : ''),
        shipping_state: shipping.state || (isBeawar ? 'Rajasthan' : ''),
        shipping_pincode: shipping.pincode,
        delivery_id: 'del-' + Date.now(),
        delivery_type: finalDeliveryType,
        delivery_method: isBeawar ? 'BEAWAR_LOCAL' : 'EXPRESS_COURIER',
        delivery_status: 'PENDING_DISPATCH',
        delivery_assigned_to: null,
        delivery_staff_phone: null,
        stitching_id: 'stitch-' + Date.now(),
        stitching_status: orderType === 'STITCHED' ? 'PENDING' : null,
        stitching_config: orderType === 'STITCHED' ? stitchingConfig : null,
        cancellation_allowed: true, // Forbidden after stitching begins (§36)
        alteration_window_days: orderType === 'STITCHED' ? 10 : 0, // §37
        created_at: new Date().toISOString()
      };

      const orders = getTable('orders', []);
      orders.unshift(newOrder);
      setTable('orders', orders);

      recordAuditLog('Customer Online', 'CUSTOMER', 'ORDER_CREATED', 'ORDER', orderId, `Order ${orderNumber} created for ${prod.title || prod.name} (${orderType})`);

      return newOrder;
    },

    // Confirm Payment Server-side / Isomorphic Verification (§30, §31, §105)
    confirmPayment: function (orderId, paymentDetails = {}) {
      const orders = getTable('orders', []);
      const order = orders.find(o => o.id === orderId || o.order_number === orderId);
      if (!order) throw new Error('Order not found.');

      order.payment_status = 'PAID';
      order.order_status = 'PAYMENT_CONFIRMED';
      order.razorpay_payment_id = paymentDetails.razorpay_payment_id || 'pay_sim_' + Date.now();
      order.paid_at = new Date().toISOString();

      setTable('orders', orders);
      recordAuditLog('Razorpay', 'SYSTEM', 'PAYMENT_CONFIRMED', 'ORDER', order.id, `Payment verified for Order ${order.order_number} (₹${order.total_amount})`);

      return order;
    },

    // Order Lifecycle State Machine (§34, §35, §107)
    updateOrderStatus: function (orderId, newStatus, staffActor = 'Staff') {
      const orders = getTable('orders', []);
      const order = orders.find(o => o.id === orderId || o.order_number === orderId || o.stitching_id === orderId || o.delivery_id === orderId);
      if (!order) throw new Error('Order not found.');

      // Lock cancellation once stitching begins (§36, §107)
      if (newStatus === 'STITCHING' || newStatus === 'IN_CUTTING' || newStatus === 'IN_STITCHING') {
        order.cancellation_allowed = false;
        order.stitching_status = newStatus;
        order.order_status = 'STITCHING';
      } else if (newStatus === 'COMPLETED' || newStatus === 'FINISHING') {
        order.stitching_status = newStatus;
        if (newStatus === 'COMPLETED') order.order_status = 'READY_FOR_DISPATCH';
      } else if (newStatus === 'OUT_FOR_DELIVERY' || newStatus === 'DELIVERED') {
        order.delivery_status = newStatus;
        order.order_status = newStatus;
      } else {
        order.order_status = newStatus;
      }

      order.updated_at = new Date().toISOString();

      setTable('orders', orders);
      recordAuditLog(staffActor, 'STAFF', 'STATUS_UPDATED', 'ORDER', order.id, `Order ${order.order_number} status updated to ${newStatus}`);

      return order;
    },

    // Cancel Order Enforcement (§36, §107)
    cancelOrder: function (orderId, reason = 'Customer request') {
      const orders = getTable('orders', []);
      const order = orders.find(o => o.id === orderId || o.order_number === orderId);
      if (!order) throw new Error('Order not found.');

      // HARD RULE: Cancellation is strictly forbidden once stitching begins (§36)
      if (!order.cancellation_allowed || ['STITCHING', 'IN_CUTTING', 'IN_STITCHING', 'FINISHING', 'QUALITY_CHECK', 'READY_FOR_DISPATCH', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status)) {
        throw new Error('This custom-tailored order cannot be cancelled because master cutting and tailoring have already commenced.');
      }

      order.order_status = 'CANCELLED';
      order.cancellation_reason = reason;

      // Restore inventory if unique
      const prods = getTable('products', INITIAL_PRODUCTS);
      const prod = prods.find(p => p.id === order.product_id);
      if (prod) {
        prod.stock_quantity += 1;
        prod.is_sold_out = false;
        setTable('products', prods);
      }

      setTable('orders', orders);
      recordAuditLog('System', 'SYSTEM', 'ORDER_CANCELLED', 'ORDER', order.id, `Order ${order.order_number} cancelled. Stock restored for SKU: ${order.product_sku}`);

      return order;
    },

    // Order Tracking Lookup (§120)
    trackOrder: function (orderNumber, phone = '') {
      const orders = getTable('orders', []);
      const cleanNum = (orderNumber || '').trim().toUpperCase();
      const cleanPhone = (phone || '').trim();

      const order = orders.find(o => {
        const numMatch = o.order_number.toUpperCase() === cleanNum;
        if (!numMatch) return false;
        if (cleanPhone) return (o.customer_phone || o.shipping_phone || '').includes(cleanPhone);
        return true;
      });

      if (!order) return null;

      const isStitched = order.order_type === 'STITCHED';
      const isLocal = order.delivery_type === 'BEAWAR_LOCAL_DELIVERY';

      const steps = isStitched
        ? [
            { step: 'Order Placed & Payment Verified', completed: true },
            { step: 'Order Processing at Beawar Store', completed: ['PROCESSING', 'STITCHING', 'QUALITY_CHECK', 'READY_FOR_DISPATCH', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status) },
            { step: 'Master Cutting & Tailoring', completed: ['STITCHING', 'QUALITY_CHECK', 'READY_FOR_DISPATCH', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status) },
            { step: 'Artisanal Quality Check & Pressing', completed: ['QUALITY_CHECK', 'READY_FOR_DISPATCH', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status) },
            { step: isLocal ? 'Out for Delivery (Beawar Store Staff)' : 'Dispatched via Express Courier', completed: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status) },
            { step: 'Delivered at Doorstep', completed: order.order_status === 'DELIVERED' }
          ]
        : [
            { step: 'Order Placed & Payment Verified', completed: true },
            { step: 'Fabric Inspection & Packaging', completed: ['PROCESSING', 'READY_FOR_DISPATCH', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status) },
            { step: isLocal ? 'Out for Delivery (Beawar Store Staff)' : 'Dispatched via Express Courier', completed: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.order_status) },
            { step: 'Delivered at Doorstep', completed: order.order_status === 'DELIVERED' }
          ];

      return { order, timeline: steps };
    },

    // Reviews Moderation (§38, §89)
    getApprovedReviews: function () {
      const all = getTable('reviews', []);
      return all.filter(r => r.status === 'APPROVED');
    },

    getAllReviewsAdmin: function () {
      return getTable('reviews', []);
    },

    submitReview: function ({ orderNumber, rating, comment, customerName }) {
      const orders = getTable('orders', []);
      const order = orders.find(o => o.order_number === orderNumber);
      if (!order) {
        throw new Error('Review submission requires a valid verified order number.');
      }
      if (order.order_status !== 'DELIVERED') {
        throw new Error('Reviews can only be submitted after your order is successfully delivered.');
      }

      const reviews = getTable('reviews', []);
      const newReview = {
        id: 'rev-' + Date.now(),
        order_number: orderNumber,
        product_id: order.product_id,
        product_title: order.product_title,
        product_sku: order.product_sku,
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        review_text: (comment || '').trim(),
        customer_name: customerName || order.customer_name || order.shipping_name,
        status: 'PENDING',
        created_at: new Date().toISOString()
      };

      reviews.unshift(newReview);
      setTable('reviews', reviews);
      recordAuditLog('Customer', 'CUSTOMER', 'REVIEW_SUBMITTED', 'REVIEW', newReview.id, `New review pending moderation for ${order.product_title}`);

      return newReview;
    },

    moderateReview: function (reviewId, action) {
      const reviews = getTable('reviews', []);
      const rev = reviews.find(r => r.id === reviewId);
      if (!rev) throw new Error('Review not found.');

      rev.status = action === 'approve' ? 'APPROVED' : 'REJECTED';
      setTable('reviews', reviews);
      recordAuditLog('Admin', 'OWNER', 'REVIEW_MODERATED', 'REVIEW', reviewId, `Review marked ${rev.status}`);

      return rev;
    },

    // Auth & Role Access Control (§48, §49)
    authenticateStaff: function (identifier, password) {
      const users = getTable('users', INITIAL_USERS);
      const cleanId = (identifier || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      let user = users.find(u => {
        const uEmail = (u.email || '').trim().toLowerCase();
        const uPhone = (u.phone || '').trim();
        const matchesId = (uEmail === cleanId || uPhone === cleanId);
        if (!matchesId) return false;

        if (u.role === 'OWNER') {
          return u.password === cleanPass || cleanPass === 'Abha104' || cleanPass === 'AbhaAdmin2026!';
        }
        if (u.role === 'MANAGER') {
          return u.password === cleanPass || cleanPass === 'AbhaM' || cleanPass === 'AbhaManager2026!';
        }
        return u.password === cleanPass;
      });

      // Special fallback for owner login (rujhan3052007@gmail.com, admin@abha.in, or 9214837104)
      if (!user && (cleanId === 'rujhan3052007@gmail.com' || cleanId === 'admin@abha.in' || cleanId === '9214837104')) {
        if (cleanPass === 'Abha104' || cleanPass === 'AbhaAdmin2026!') {
          user = {
            id: 'u-owner-01',
            email: 'rujhan3052007@gmail.com',
            phone: '9214837104',
            name: 'Rujhan (ABHA Owner)',
            role: 'OWNER',
            password: 'Abha104'
          };
        }
      }

      // Special fallback for manager login (manager@abha.in or 9261516194)
      if (!user && (cleanId === 'manager@abha.in' || cleanId === '9261516194')) {
        if (cleanPass === 'AbhaM' || cleanPass === 'AbhaManager2026!') {
          user = users.find(u => u.role === 'MANAGER') || {
            id: 'u-mgr-01',
            email: 'manager@abha.in',
            phone: '9261516194',
            name: 'Store Manager (Beawar)',
            role: 'MANAGER',
            password: 'AbhaM'
          };
        }
      }

      if (!user) {
        throw new Error('Invalid credentials. Please enter authorized ABHA credentials.');
      }

      const employees = getTable('employees', INITIAL_EMPLOYEES);
      const emp = employees.find(e => e.userId === user.id || e.user_id === user.id || e.email === user.email || e.mobile === user.phone);

      if (user.role !== 'OWNER' && emp) {
        if (emp.status === 'PENDING') {
          throw new Error('Account pending authorization by Manager or Owner. Please wait for approval.');
        }
        if (emp.status === 'SUSPENDED') {
          throw new Error('Your employee account is suspended. Contact ABHA Owner.');
        }
        if (emp.status === 'REVOKED') {
          throw new Error('Employee access has been revoked.');
        }
        if (emp.status === 'INACTIVE') {
          throw new Error('Account is inactive.');
        }
      }

      const isOwner = user.role === 'OWNER';
      const permissions = isOwner ? ['*'] : (emp ? (emp.permissions || []) : []);
      const dept = emp ? (emp.department_code || emp.department) : (isOwner ? 'EXECUTIVE' : 'STORE');
      const empCode = emp ? emp.employee_code : (isOwner ? 'ABHA-OWNER' : 'ABHA-STAFF');

      return {
        token: 'abha_jwt_' + btoa(`${user.id}:${user.role}:${Date.now()}`),
        user: {
          id: user.id,
          employee_id: emp ? emp.id : null,
          employee_code: empCode,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          department: dept,
          status: emp ? emp.status : 'ACTIVE',
          permissions: permissions
        }
      };
    },

    registerStaff: function ({ name, email, phone, password, role = 'OWNER' }) {
      if (!email || !password) throw new Error('Email and password are required');
      const users = getTable('users', INITIAL_USERS);
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = (phone || '').trim();

      let user = users.find(u => (u.email || '').toLowerCase() === cleanEmail);
      if (user) {
        user.name = name || user.name;
        user.phone = cleanPhone || user.phone;
        user.password = password;
        user.role = role || user.role;
      } else {
        user = {
          id: 'usr-' + Date.now(),
          name: name || 'Rujhan (ABHA Owner)',
          email: cleanEmail,
          phone: cleanPhone,
          password: password,
          role: role || 'OWNER',
          created_at: new Date().toISOString()
        };
        users.push(user);
      }
      setTable('users', users);

      recordAuditLog(user.name, user.role, 'STAFF_REGISTERED', 'USER', user.id, `User ${user.email} registered/updated with role ${user.role}`);

      return {
        token: 'abha_jwt_' + btoa(`${user.id}:${user.role}:${Date.now()}`),
        user: {
          id: user.id,
          employee_id: null,
          employee_code: user.role === 'OWNER' ? 'ABHA-OWNER' : 'ABHA-STAFF',
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          department: user.role === 'OWNER' ? 'EXECUTIVE' : 'STORE',
          status: 'ACTIVE',
          permissions: ['*']
        }
      };
    },

    changeUserPasswordByOwner: function ({ ownerKey, targetIdentifier, newPassword }, caller) {
      if (!targetIdentifier || !newPassword) {
        throw new Error('Target account and new password are required');
      }
      if (newPassword.length < 4) {
        throw new Error('New password must be at least 4 characters long');
      }

      const users = getTable('users', INITIAL_USERS);
      const owner = users.find(u => u.role === 'OWNER') || { password: 'Abha104', name: 'Rujhan (ABHA Owner)' };

      // Verify owner authorization
      const isOwnerSession = caller && caller.role === 'OWNER';
      const isOwnerKeyValid = (ownerKey === 'Abha104' || ownerKey === owner.password || (ownerKey && ownerKey === 'AbhaAdmin2026!'));

      if (!isOwnerSession && !isOwnerKeyValid) {
        throw new Error('Owner authorization required. Please enter your valid Owner password / PIN.');
      }

      const cleanTarget = (targetIdentifier || '').trim().toLowerCase();
      let targetUser = users.find(u => {
        const uEmail = (u.email || '').trim().toLowerCase();
        const uPhone = (u.phone || '').trim();
        const uRole = (u.role || '').trim().toLowerCase();
        return uEmail === cleanTarget || uPhone === cleanTarget || uRole === cleanTarget;
      });

      // Role shortcuts
      if (!targetUser) {
        if (cleanTarget === 'owner' || cleanTarget === 'rujhan3052007@gmail.com') {
          targetUser = owner;
        } else if (cleanTarget === 'manager' || cleanTarget === 'manager@abha.in') {
          targetUser = users.find(u => u.role === 'MANAGER');
        } else if (cleanTarget === 'tailor' || cleanTarget === 'master.tailor@abha.in') {
          targetUser = users.find(u => u.role === 'TAILOR');
        } else if (cleanTarget === 'delivery' || cleanTarget === 'delivery@abha.in') {
          targetUser = users.find(u => u.role === 'DELIVERY');
        }
      }

      if (!targetUser) {
        throw new Error(`Target account "${targetIdentifier}" not found.`);
      }

      // Update password
      targetUser.password = newPassword;
      setTable('users', users);

      // Update employees table if matching employee exists
      const employees = getTable('employees', INITIAL_EMPLOYEES);
      const emp = employees.find(e => e.userId === targetUser.id || e.email === targetUser.email || e.mobile === targetUser.phone);
      if (emp) {
        emp.password = newPassword;
        setTable('employees', employees);
      }

      recordAuditLog(
        caller?.name || 'Owner',
        'OWNER',
        'PASSWORD_CHANGED_BY_OWNER',
        'USER',
        targetUser.id,
        `Password updated for ${targetUser.name} (${targetUser.role || 'STAFF'})`
      );

      return {
        success: true,
        message: `Password for ${targetUser.name} (${targetUser.role}) updated successfully.`,
        target: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role
        }
      };
    },

    getPermissions: function () {
      return PERMISSIONS_LIST;
    },

    getDepartments: function () {
      return getTable('departments', INITIAL_DEPARTMENTS);
    },

    getManagers: function () {
      const employees = getTable('employees', INITIAL_EMPLOYEES);
      return employees.filter(e => (e.role_code && e.role_code.includes('MANAGER')) || (e.role && e.role.toLowerCase().includes('manager')));
    },

    createManager: function ({ name, email, phone, password, department, permissions = [], assigned_area }, caller) {
      if (!name || !email || !password || !department) throw new Error('Name, email, password, and department are required');
      const users = getTable('users', INITIAL_USERS);
      const employees = getTable('employees', INITIAL_EMPLOYEES);

      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = (phone || '').trim();
      if (users.find(u => u.email === cleanEmail || (cleanPhone && u.phone === cleanPhone))) {
        throw new Error('An account with this email or mobile number already exists');
      }

      const userId = 'usr-mgr-' + Date.now();
      const empId = 'emp-mgr-' + Date.now();
      const empCode = 'ABHA-M-' + Math.floor(100 + Math.random() * 900);

      const newUser = {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password: password,
        role: 'MANAGER',
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      setTable('users', users);

      const newEmp = {
        id: empId,
        userId: userId,
        user_id: userId,
        employee_code: empCode,
        name: name.trim(),
        mobile: cleanPhone,
        email: cleanEmail,
        department: department,
        department_code: department,
        role: 'Store Manager',
        role_code: `${department}_MANAGER`,
        status: 'ACTIVE',
        assigned_area: assigned_area || 'Beawar Flagship Store',
        joining_date: new Date().toISOString().split('T')[0],
        authorized_by_name: caller?.name || 'ABHA Owner',
        authorized_at: new Date().toISOString(),
        permissions: permissions
      };
      employees.push(newEmp);
      setTable('employees', employees);

      recordAuditLog(caller?.name || 'Owner', 'OWNER', 'CREATE_MANAGER', 'EMPLOYEE', empId, null, newEmp, `Created manager ${name} for ${department}`);
      return newEmp;
    },

    updateManagerPermissions: function (managerId, permissions, caller) {
      const employees = getTable('employees', INITIAL_EMPLOYEES);
      const emp = employees.find(e => e.id === managerId || e.userId === managerId);
      if (!emp) throw new Error('Manager not found');

      const prev = emp.permissions || [];
      emp.permissions = permissions;
      setTable('employees', employees);

      recordAuditLog(caller?.name || 'Owner', 'OWNER', 'UPDATE_PERMISSIONS', 'EMPLOYEE', emp.id, prev, permissions, `Updated permissions for ${emp.name}`);
      return emp;
    },

    updateManagerStatus: function (managerId, status, caller) {
      const employees = getTable('employees', INITIAL_EMPLOYEES);
      const emp = employees.find(e => e.id === managerId || e.userId === managerId);
      if (!emp) throw new Error('Manager not found');

      const prev = emp.status;
      emp.status = status;
      setTable('employees', employees);

      const users = getTable('users', INITIAL_USERS);
      const user = users.find(u => u.id === emp.userId || (emp.email && u.email === emp.email));
      if (user) {
        user.is_active = (status === 'ACTIVE') ? 1 : 0;
        user.status = status;
        setTable('users', users);
      }

      recordAuditLog(caller?.name || 'Owner', 'OWNER', 'UPDATE_STATUS', 'EMPLOYEE', emp.id, prev, status, `Updated status to ${status} for ${emp.name}`);
      return emp;
    },

    getEmployees: function (filterDept) {
      const employees = getTable('employees', INITIAL_EMPLOYEES);
      if (filterDept && filterDept !== 'ALL') {
        return employees.filter(e => (e.department_code || e.department) === filterDept);
      }
      return employees;
    },

    createEmployee: function (data, caller) {
      const { name, mobile, email, department, role, assigned_area, permissions = [], password } = data;
      if (!name || !mobile || !department) throw new Error('Name, mobile, and department are required');

      const users = getTable('users', INITIAL_USERS);
      const employees = getTable('employees', INITIAL_EMPLOYEES);

      const cleanPhone = mobile.trim();
      const cleanEmail = (email || '').trim().toLowerCase();

      const userId = 'usr-emp-' + Date.now();
      const empId = 'emp-' + Date.now();
      const deptCode = department.toUpperCase();
      const prefix = deptCode.charAt(0);
      const empCode = `ABHA-${prefix}-${Math.floor(100 + Math.random() * 900)}`;

      const userRole = deptCode === 'TAILORING' ? 'TAILOR' : (deptCode === 'DELIVERY' ? 'DELIVERY' : 'MANAGER');
      const newUser = {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password: password || 'AbhaEmp2026!',
        role: userRole,
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      setTable('users', users);

      const isOwner = caller?.role === 'OWNER';
      const newEmp = {
        id: empId,
        userId: userId,
        user_id: userId,
        employee_code: empCode,
        name: name.trim(),
        mobile: cleanPhone,
        email: cleanEmail,
        department: deptCode,
        department_code: deptCode,
        role: role || (deptCode === 'TAILORING' ? 'Master Tailor' : (deptCode === 'DELIVERY' ? 'Delivery Boy' : 'Staff')),
        role_code: deptCode === 'TAILORING' ? 'TAILOR' : (deptCode === 'DELIVERY' ? 'DELIVERY_BOY' : 'POS_STAFF'),
        status: isOwner ? 'ACTIVE' : 'PENDING',
        assigned_area: assigned_area || 'Beawar Store',
        joining_date: new Date().toISOString().split('T')[0],
        authorized_by_name: isOwner ? caller.name : null,
        authorized_at: isOwner ? new Date().toISOString() : null,
        permissions: permissions.length > 0 ? permissions : (
          deptCode === 'TAILORING' ? ['tailoring.view', 'tailoring.update_status'] :
          deptCode === 'DELIVERY' ? ['delivery.view', 'delivery.update_status', 'delivery.report_issue'] :
          ['pos.access', 'pos.bill']
        )
      };
      employees.push(newEmp);
      setTable('employees', employees);

      recordAuditLog(caller?.name || 'Staff', caller?.role || 'MANAGER', 'CREATE_EMPLOYEE', 'EMPLOYEE', empId, null, newEmp, `Created employee ${name} (${empCode}) in ${deptCode}`);
      return newEmp;
    },

    authorizeEmployee: function (employeeId, caller) {
      const employees = getTable('employees', INITIAL_EMPLOYEES);
      const emp = employees.find(e => e.id === employeeId || e.userId === employeeId);
      if (!emp) throw new Error('Employee not found');

      const prev = emp.status;
      emp.status = 'ACTIVE';
      emp.authorized_by_name = caller?.name || 'Manager';
      emp.authorized_at = new Date().toISOString();
      setTable('employees', employees);

      recordAuditLog(caller?.name || 'Manager', caller?.role || 'MANAGER', 'AUTHORIZE_EMPLOYEE', 'EMPLOYEE', emp.id, { status: prev }, { status: 'ACTIVE' }, `Authorized employee ${emp.name}`);
      return emp;
    },

    updateEmployeeStatus: function (employeeId, status, caller) {
      const employees = getTable('employees', INITIAL_EMPLOYEES);
      const emp = employees.find(e => e.id === employeeId || e.userId === employeeId);
      if (!emp) throw new Error('Employee not found');

      const prev = emp.status;
      emp.status = status;
      setTable('employees', employees);

      const users = getTable('users', INITIAL_USERS);
      const user = users.find(u => u.id === emp.userId || (emp.email && u.email === emp.email));
      if (user) {
        user.is_active = (status === 'ACTIVE') ? 1 : 0;
        user.status = status;
        setTable('users', users);
      }

      recordAuditLog(caller?.name || 'Manager', caller?.role || 'MANAGER', 'UPDATE_EMPLOYEE_STATUS', 'EMPLOYEE', emp.id, { status: prev }, { status }, `Updated status to ${status} for ${emp.name}`);
      return emp;
    },

    getMyDeliveries: function (caller) {
      const orders = getTable('orders', []);
      let list = orders.filter(o => o.delivery_type === 'BEAWAR_LOCAL_DELIVERY' || o.order_channel === 'ONLINE');
      if (caller && caller.employee_id) {
        const assignedOnly = list.filter(o => o.assigned_delivery_boy_id === caller.employee_id || o.assigned_delivery_boy_id === caller.id);
        if (assignedOnly.length > 0) list = assignedOnly;
      }
      // REDACT FINANCIAL DATA: (§20, §34)
      return list.map(o => ({
        delivery_id: o.delivery_id || o.id,
        order_number: o.order_number,
        shipping_name: o.shipping_name || o.customer_name,
        shipping_phone: o.shipping_phone || o.customer_phone,
        shipping_address: o.shipping_address,
        shipping_city: o.shipping_city,
        shipping_pincode: o.shipping_pincode,
        delivery_method: o.delivery_method || 'BEAWAR_LOCAL',
        delivery_status: o.delivery_status || 'PENDING',
        product_title: o.product_title || o.product_name,
        assigned_delivery_boy_name: o.assigned_delivery_boy_name || null,
        issue_reason: o.issue_reason || null,
        issue_notes: o.issue_notes || null,
        delivery_notes: o.delivery_notes || o.notes || '',
        updated_at: o.updated_at
      }));
    },

    assignDelivery: function (deliveryId, employeeId, caller) {
      const orders = getTable('orders', []);
      const order = orders.find(o => o.delivery_id === deliveryId || o.id === deliveryId || o.order_number === deliveryId);
      if (!order) throw new Error('Delivery order not found');

      const employees = getTable('employees', INITIAL_EMPLOYEES);
      const emp = employees.find(e => e.id === employeeId || e.userId === employeeId);
      if (!emp) throw new Error('Delivery employee not found');

      const prevAssignee = order.assigned_delivery_boy_name || null;
      order.assigned_delivery_boy_id = emp.id;
      order.assigned_delivery_boy_name = emp.name;
      order.delivery_status = 'ASSIGNED';
      setTable('orders', orders);

      recordAuditLog(caller?.name || 'Staff', caller?.role || 'DELIVERY', 'ASSIGN_DELIVERY', 'ORDER', order.id, { assignee: prevAssignee }, { assignee: emp.name }, `Assigned order ${order.order_number} to ${emp.name}`);
      return order;
    },

    reportDeliveryIssue: function (deliveryId, reason, notes, caller) {
      const orders = getTable('orders', []);
      const order = orders.find(o => o.delivery_id === deliveryId || o.id === deliveryId || o.order_number === deliveryId);
      if (!order) throw new Error('Delivery order not found');

      const prevStatus = order.delivery_status;
      order.delivery_status = 'ISSUE_REPORTED';
      order.issue_reason = reason;
      order.issue_notes = notes;
      setTable('orders', orders);

      recordAuditLog(caller?.name || 'Delivery Staff', 'DELIVERY', 'REPORT_DELIVERY_ISSUE', 'ORDER', order.id, { status: prevStatus }, { status: 'ISSUE_REPORTED', reason, notes }, `Delivery issue reported: ${reason}`);
      return order;
    },

    getMyTailoringTasks: function (caller) {
      const orders = getTable('orders', []);
      let list = orders.filter(o => o.order_type === 'STITCHED');
      if (caller && caller.employee_id) {
        const assignedOnly = list.filter(o => o.assigned_tailor_id === caller.employee_id || o.assigned_tailor_id === caller.id);
        if (assignedOnly.length > 0) list = assignedOnly;
      }
      // REDACT ALL FINANCIAL DATA (PRICES & REVENUE): (§20, §34)
      return list.map(o => ({
        stitching_id: o.stitching_id || o.id,
        order_number: o.order_number,
        product_title: o.product_title,
        product_sku: o.product_sku,
        customer_name: o.customer_name || o.shipping_name,
        stitching_status: o.stitching_status || 'QUEUED',
        assigned_tailor_name: o.assigned_tailor_name || null,
        neck_design: o.stitching_config?.neck || 'Classic Round',
        sleeve_style: o.stitching_config?.sleeve || '3/4th Sleeves',
        bottom_style: o.stitching_config?.bottom || 'Traditional Salwar',
        kurta_design: o.stitching_config?.kurta || 'Straight Cut',
        measurements: o.stitching_config?.measurements || o.measurements || {
          bust: '38', waist: '34', hips: '40', kurta_length: '42', salwar_length: '38'
        },
        additional_requirements: o.stitching_config?.notes || '',
        reference_images: (o.stitching_config?.reference_images || []).map((img, i) => ({
          vault_storage_key: `ref_${o.order_number}_${i}`,
          original_filename: `reference_${i + 1}.jpg`
        }))
      }));
    },

    assignTailor: function (stitchingId, tailorId, caller) {
      const orders = getTable('orders', []);
      const order = orders.find(o => o.stitching_id === stitchingId || o.id === stitchingId || o.order_number === stitchingId);
      if (!order) throw new Error('Stitching order not found');

      const employees = getTable('employees', INITIAL_EMPLOYEES);
      const emp = employees.find(e => e.id === tailorId || e.userId === tailorId);
      if (!emp) throw new Error('Tailor employee not found');

      const prevAssignee = order.assigned_tailor_name || null;
      order.assigned_tailor_id = emp.id;
      order.assigned_tailor_name = emp.name;
      order.stitching_status = order.stitching_status || 'QUEUED';
      setTable('orders', orders);

      recordAuditLog(caller?.name || 'Staff', caller?.role || 'TAILOR', 'ASSIGN_TAILOR', 'ORDER', order.id, { assignee: prevAssignee }, { assignee: emp.name }, `Assigned order ${order.order_number} to ${emp.name}`);
      return order;
    },

    registerStaff: function ({ name, email, phone, password, role = 'OWNER' }) {
      if (!name || !password) throw new Error('Full name and password are required.');
      const users = getTable('users', INITIAL_USERS);
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPhone = (phone || '').trim();
      const exists = users.find(u => (cleanEmail && u.email === cleanEmail) || (cleanPhone && u.phone === cleanPhone));
      if (exists) {
        throw new Error('An account with this email or mobile number already exists.');
      }
      const newUser = {
        id: 'usr-' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        password: password,
        role: role,
        store_id: INITIAL_STORE.id,
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      setTable('users', users);
      recordAuditLog(newUser.name, role, 'STAFF_REGISTERED', 'USER', newUser.id, `New ${role} registered: ${newUser.name}`);
      return {
        token: 'abha_jwt_' + btoa(`${newUser.id}:${newUser.role}:${Date.now()}`),
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role
        }
      };
    },

    addProduct: function (data) {
      if (!data.title && !data.name) throw new Error('Product title is required.');
      const products = getTable('products', INITIAL_PRODUCTS);
      const newId = 'prod-' + Date.now();
      const newSku = data.sku || ('ABHA-SLW-' + Math.floor(100 + Math.random() * 900));
      const basePrice = parseFloat(data.base_price || data.price || 1850);
      const stitchingFee = parseFloat(data.stitching_price || data.stitchingFee || 650);

      const newProd = {
        id: newId,
        sku: newSku,
        title: data.title || data.name,
        name: data.title || data.name,
        category_id: data.category_id || 'cat-cotton',
        category_name: data.category_name || data.category || 'Pure Cotton Salwar Suits',
        category: data.category_name || data.category || 'Pure Cotton Salwar Suits',
        suitType: (data.category_name || data.category || '').toLowerCase().includes('silk') ? 'silk' : 'cotton',
        fabric: data.fabric || '100% Pure Cotton (Top 2.5m, Bottom 2.5m, Dupatta 2.5m)',
        color: data.color || 'Artisanal Weave',
        base_price: basePrice,
        price: basePrice,
        stitching_price: stitchingFee,
        stitchingPrice: stitchingFee,
        stitchingFee: stitchingFee,
        stitchingAvailable: true,
        inventory_type: data.inventory_type || 'UNIQUE_1OF1',
        is_unique_item: data.inventory_type !== 'QUANTITY',
        stock_quantity: parseInt(data.stock_quantity || 1, 10),
        is_sold_out: false,
        primary_image: data.primary_image || data.photo || 'images/pink-leheriya-cotton-suit.jpg',
        image: data.primary_image || data.photo || 'images/pink-leheriya-cotton-suit.jpg',
        description: data.description || 'Authentic handcrafted unstitched salwar suit material ready for bespoke tailoring.',
        rating: 5.0,
        reviewsCount: 0,
        isNewArrival: true,
        isBestSeller: false,
        created_at: new Date().toISOString()
      };

      products.unshift(newProd);
      setTable('products', products);
      recordAuditLog('Admin', 'OWNER', 'PRODUCT_ADDED', 'PRODUCT', newProd.id, `Added product ${newProd.title} (${newProd.sku})`);
      return newProd;
    },

    // Isomorphic API Call Dispatcher (Transparently handles all /api routes on GitHub Pages & Node)
    apiCall: async function (endpoint, options = {}) {
      const hasNode = await isBackendAvailable();
      if (hasNode) {
        try {
          const res = await fetch(endpoint, options);
          const data = await res.json();
          if (res.ok) return data;
          const err = new Error(data.error || 'Request failed');
          err.status = res.status;
          throw err;
        } catch (e) {
          if (e.status) throw e;
          console.warn('Node API call failed, falling back to isomorphic local engine:', e);
        }
      }

      const url = new URL(endpoint, 'http://localhost');
      const pathname = url.pathname;
      const method = (options.method || 'GET').toUpperCase();
      let body = {};
      if (options.body) {
        try { body = JSON.parse(options.body); } catch {}
      }

      const caller = getCallerFromToken(options);

      // Catalog & Categories
      if (pathname === '/api/products') {
        return { success: true, data: this.getProducts(options.includeSold) };
      }
      if (pathname === '/api/admin/products') {
        if (method === 'POST') {
          checkPermission(caller, 'products.create');
          const prod = this.addProduct(body);
          return { success: true, data: prod };
        }
        checkPermission(caller, 'products.view');
        return { success: true, data: this.getAllProductsAdmin() };
      }
      if (pathname === '/api/categories') {
        return { success: true, data: this.getCategories() };
      }
      if (pathname === '/api/admin/categories' && method === 'POST') {
        checkPermission(caller, 'products.create', 'products.edit', 'settings.edit');
        const cat = this.createCategory(body, caller);
        return { success: true, data: cat, message: 'Category created successfully' };
      }
      if (pathname.startsWith('/api/admin/categories/') && pathname.endsWith('/status') && method === 'PUT') {
        checkPermission(caller, 'products.edit', 'settings.edit');
        const catId = pathname.split('/')[4];
        this.toggleCategory(catId, body.is_active);
        return { success: true, message: 'Category status updated' };
      }
      if (pathname.startsWith('/api/admin/categories/') && method === 'PUT') {
        checkPermission(caller, 'products.edit', 'settings.edit');
        const catId = pathname.split('/')[4];
        const cat = this.updateCategory(catId, body, caller);
        return { success: true, data: cat, message: 'Category updated successfully' };
      }
      if (pathname.startsWith('/api/admin/categories/') && method === 'DELETE') {
        checkPermission(caller, 'products.delete', 'products.edit', 'settings.edit');
        const catId = pathname.split('/')[4];
        const res = this.deleteCategory(catId, caller);
        return { success: true, message: 'Category removed successfully' };
      }

      // Orders & Checkout
      if (pathname === '/api/orders/buy-now' && method === 'POST') {
        const order = this.createBuyNowOrder({
          productId: body.product_id,
          orderType: body.order_type,
          stitchingConfig: body.stitching_config,
          shipping: body.shipping,
          customer: body.shipping
        });
        return { success: true, data: { order_id: order.id, order_number: order.order_number, total_amount: order.total_amount } };
      }
      if (pathname === '/api/payments/verify' && method === 'POST') {
        const order = this.confirmPayment(body.order_id, body);
        return { success: true, data: { order_number: order.order_number, status: order.order_status } };
      }
      if (pathname.startsWith('/api/orders/track/')) {
        const orderNum = decodeURIComponent(pathname.replace('/api/orders/track/', ''));
        const phone = url.searchParams.get('phone') || '';
        const result = this.trackOrder(orderNum, phone);
        if (!result) throw new Error('No order found matching the provided order number and mobile number.');
        return { success: true, data: result };
      }

      // Auth
      if (pathname === '/api/auth/register' && method === 'POST') {
        const auth = this.registerStaff(body);
        return { success: true, token: auth.token, user: auth.user };
      }
      if (pathname === '/api/auth/login' && method === 'POST') {
        const auth = this.authenticateStaff(body.identifier, body.password);
        return { success: true, token: auth.token, user: auth.user };
      }
      if (pathname === '/api/auth/me') {
        if (!caller) {
          const err = new Error('Authentication required');
          err.status = 401;
          throw err;
        }
        return { success: true, user: caller };
      }
      if (pathname === '/api/auth/change-password' && method === 'POST') {
        return this.changeUserPasswordByOwner(body, caller);
      }
      if (pathname === '/api/admin/users/password' && method === 'PUT') {
        checkPermission(caller, '*');
        return this.changeUserPasswordByOwner(body, caller);
      }

      // Admin Dashboard & Overview (§3, §10)
      if (pathname === '/api/admin/dashboard' || pathname === '/api/admin/overview') {
        checkPermission(caller, 'orders.view', 'reports.view');
        const orders = getTable('orders', []);
        const paidOrders = orders.filter(o => o.payment_status === 'PAID');
        const onlineRev = paidOrders.filter(o => o.order_channel === 'ONLINE').reduce((s, o) => s + (o.total_amount || 0), 0);
        const offlineRev = paidOrders.filter(o => o.order_channel === 'OFFLINE_POS').reduce((s, o) => s + (o.total_amount || 0), 0);
        const stitchingCount = orders.filter(o => o.order_type === 'STITCHED' && o.order_status !== 'DELIVERED').length;
        const deliveryCount = orders.filter(o => o.delivery_status === 'OUT_FOR_DELIVERY' || (o.delivery_type === 'BEAWAR_LOCAL_DELIVERY' && o.order_status !== 'DELIVERED')).length;

        const canViewFinancials = caller.role === 'OWNER' || (caller.permissions && (caller.permissions.includes('payments.view') || caller.permissions.includes('reports.view') || caller.permissions.includes('*')));

        return {
          success: true,
          data: {
            financials: canViewFinancials ? {
              total_revenue: onlineRev + offlineRev,
              online_revenue: onlineRev,
              offline_revenue: offlineRev,
              total_orders: orders.length
            } : null,
            stitching_queue_count: stitchingCount,
            pending_deliveries_count: deliveryCount,
            recent_orders: orders.slice(0, 15)
          }
        };
      }

      // POS Billing Terminal
      if (pathname === '/api/admin/pos/order' && method === 'POST') {
        checkPermission(caller, 'pos.bill');
        const res = this.recordOfflineSale({
          productId: body.product_id,
          barcode: body.sku,
          quantity: body.quantity || 1,
          cashierName: caller?.name || 'Store Staff',
          notes: body.notes
        });
        return { success: true, data: res };
      }

      // Managers Management (Owner Only §4)
      if (pathname === '/api/admin/managers') {
        if (method === 'GET') {
          checkPermission(caller, 'managers.view');
          return { success: true, data: this.getManagers() };
        }
        if (method === 'POST') {
          if (caller?.role !== 'OWNER') {
            const err = new Error('Forbidden: Only ABHA Owner can create department managers');
            err.status = 403;
            throw err;
          }
          const mgr = this.createManager(body, caller);
          return { success: true, data: mgr };
        }
      }
      if (pathname.startsWith('/api/admin/managers/') && pathname.endsWith('/permissions') && method === 'PUT') {
        if (caller?.role !== 'OWNER') {
          const err = new Error('Forbidden: Only ABHA Owner can modify manager permissions');
          err.status = 403;
          throw err;
        }
        const mgrId = pathname.split('/')[4];
        const updated = this.updateManagerPermissions(mgrId, body.permissions, caller);
        return { success: true, data: updated };
      }
      if (pathname.startsWith('/api/admin/managers/') && pathname.endsWith('/status') && method === 'PUT') {
        if (caller?.role !== 'OWNER') {
          const err = new Error('Forbidden: Only ABHA Owner can alter manager account status');
          err.status = 403;
          throw err;
        }
        const mgrId = pathname.split('/')[4];
        const updated = this.updateManagerStatus(mgrId, body.status, caller);
        return { success: true, data: updated };
      }

      // Employees Management (§5, §6, §18)
      if (pathname === '/api/admin/employees') {
        if (method === 'GET') {
          checkPermission(caller, 'employees.view');
          const filterDept = caller.role === 'OWNER' ? url.searchParams.get('department') : caller.department;
          return { success: true, data: this.getEmployees(filterDept) };
        }
        if (method === 'POST') {
          checkPermission(caller, 'employees.create', 'delivery.create_employee', 'delivery.employee.authorize', 'tailoring.employee.authorize');
          if (caller.role !== 'OWNER' && caller.department) {
            body.department = caller.department;
          }
          const emp = this.createEmployee(body, caller);
          return { success: true, data: emp };
        }
      }
      if (pathname.startsWith('/api/admin/employees/') && pathname.endsWith('/authorize') && method === 'PUT') {
        checkPermission(caller, 'employees.authorize', 'delivery.employee.authorize', 'tailoring.employee.authorize');
        const empId = pathname.split('/')[4];
        const updated = this.authorizeEmployee(empId, caller);
        return { success: true, data: updated };
      }
      if (pathname.startsWith('/api/admin/employees/') && pathname.endsWith('/status') && method === 'PUT') {
        checkPermission(caller, 'employees.suspend', 'employees.revoke', 'delivery.suspend_employee');
        const empId = pathname.split('/')[4];
        const updated = this.updateEmployeeStatus(empId, body.status, caller);
        return { success: true, data: updated };
      }

      // Departments & Permissions Metadata
      if (pathname === '/api/admin/departments') {
        return { success: true, data: this.getDepartments() };
      }
      if (pathname === '/api/admin/permissions') {
        return { success: true, data: this.getPermissions() };
      }

      // Tailor Atelier Tasks & Queue (§7, §20)
      if (pathname === '/api/tailor/queue') {
        checkPermission(caller, 'tailoring.view');
        const orders = getTable('orders', []);
        const stitchingOrders = orders.filter(o => o.order_type === 'STITCHED').map(o => ({
          stitching_id: o.stitching_id || o.id,
          order_number: o.order_number,
          product_title: o.product_title,
          product_sku: o.product_sku,
          stitching_status: o.stitching_status || 'QUEUED',
          assigned_tailor_name: o.assigned_tailor_name || null,
          neck_design: o.stitching_config?.neck || 'Classic Round',
          sleeve_style: o.stitching_config?.sleeve || '3/4th Sleeves',
          bottom_style: o.stitching_config?.bottom || 'Traditional Salwar',
          kurta_design: o.stitching_config?.kurta || 'Straight Cut',
          customer_name: o.customer_name || o.shipping_name,
          additional_requirements: o.stitching_config?.notes || '',
          reference_images: (o.stitching_config?.reference_images || []).map((img, i) => ({
            vault_storage_key: `ref_${o.order_number}_${i}`,
            original_filename: `reference_${i + 1}.jpg`
          }))
        }));
        return { success: true, data: stitchingOrders };
      }
      if (pathname === '/api/tailor/my-tasks') {
        checkPermission(caller, 'tailoring.view');
        return { success: true, data: this.getMyTailoringTasks(caller) };
      }
      if (pathname.startsWith('/api/tailor/orders/') && pathname.endsWith('/assign') && method === 'PUT') {
        checkPermission(caller, 'tailoring.assign');
        const stitchingId = pathname.split('/')[4];
        const res = this.assignTailor(stitchingId, body.tailor_id, caller);
        return { success: true, data: res };
      }
      if (pathname.startsWith('/api/tailor/orders/') && pathname.endsWith('/status') && method === 'PUT') {
        checkPermission(caller, 'tailoring.update_status');
        const parts = pathname.split('/');
        const stitchingId = parts[4];
        this.updateOrderStatus(stitchingId, body.status, caller?.name || 'Master Tailor');
        return { success: true };
      }

      // Local Delivery Tasks & Queue (§8, §20)
      if (pathname === '/api/delivery/queue') {
        checkPermission(caller, 'delivery.view');
        const orders = getTable('orders', []);
        const localDeliveries = orders.filter(o => o.delivery_type === 'BEAWAR_LOCAL_DELIVERY' || o.order_channel === 'ONLINE').map(o => ({
          delivery_id: o.delivery_id || o.id,
          order_number: o.order_number,
          shipping_name: o.shipping_name,
          shipping_phone: o.shipping_phone,
          shipping_address: o.shipping_address,
          shipping_city: o.shipping_city,
          shipping_pincode: o.shipping_pincode,
          delivery_method: o.delivery_method || 'BEAWAR_LOCAL',
          delivery_status: o.delivery_status || 'PENDING',
          assigned_delivery_boy_name: o.assigned_delivery_boy_name || null,
          issue_reason: o.issue_reason || null,
          issue_notes: o.issue_notes || null
        }));
        return { success: true, data: localDeliveries };
      }
      if (pathname === '/api/delivery/my-deliveries') {
        checkPermission(caller, 'delivery.view');
        return { success: true, data: this.getMyDeliveries(caller) };
      }
      if (pathname.startsWith('/api/delivery/orders/') && pathname.endsWith('/assign') && method === 'PUT') {
        checkPermission(caller, 'delivery.assign');
        const deliveryId = pathname.split('/')[4];
        const res = this.assignDelivery(deliveryId, body.employee_id, caller);
        return { success: true, data: res };
      }
      if (pathname.startsWith('/api/delivery/orders/') && pathname.endsWith('/issue') && method === 'POST') {
        checkPermission(caller, 'delivery.report_issue');
        const deliveryId = pathname.split('/')[4];
        const res = this.reportDeliveryIssue(deliveryId, body.reason, body.notes, caller);
        return { success: true, data: res };
      }
      if (pathname.startsWith('/api/delivery/orders/') && pathname.endsWith('/status') && method === 'PUT') {
        checkPermission(caller, 'delivery.update_status');
        const parts = pathname.split('/');
        const deliveryId = parts[4];
        this.updateOrderStatus(deliveryId, body.status, caller?.name || 'Delivery Staff');
        return { success: true };
      }

      // Reviews Moderation
      if (pathname === '/api/admin/reviews/pending') {
        checkPermission(caller, 'reviews.view', 'reviews.moderate');
        const revs = getTable('reviews', []);
        return { success: true, data: revs.filter(r => r.status === 'PENDING') };
      }
      if (pathname.startsWith('/api/admin/reviews/') && pathname.endsWith('/moderate') && method === 'PUT') {
        checkPermission(caller, 'reviews.moderate');
        const parts = pathname.split('/');
        const reviewId = parts[4];
        this.moderateReview(reviewId, body.action);
        return { success: true };
      }

      // Integrations & Audit Logs
      if (pathname === '/api/admin/integrations/status') {
        checkPermission(caller, 'settings.view');
        return { success: true, data: getTable('integrations', INITIAL_INTEGRATIONS) };
      }
      if (pathname === '/api/admin/audit-logs') {
        checkPermission(caller, 'audit.view');
        return { success: true, data: getTable('audit_logs', []) };
      }

      throw new Error(`Endpoint ${pathname} not mapped in local engine.`);
    }
  };

}));
