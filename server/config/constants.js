/**
 * ABHA - Production E-Commerce Platform Constants
 * Master Specification aligned
 */

module.exports = {
  BRAND: {
    NAME: 'ABHA',
    TAGLINE: 'Traditional Elegance, Crafted for Perfection',
    INSTAGRAM: '@abha_tailor_and_creation',
    PHONE_PRIMARY: '9214837104',
    PHONE_SECONDARY: '9261516194',
    WHATSAPP: '+91 9214837104',
    SUPPORT_EMAIL: 'support@abha.in',
    PRIMARY_STORE: {
      CODE: 'STORE-001',
      NAME: 'ABHA Beawar Flagship',
      ADDRESS_LINE1: '11, Ganesha Tower',
      ADDRESS_LINE2: 'In front of D.A.V. College, Arya Samaj',
      CITY: 'Beawar',
      STATE: 'Rajasthan',
      PINCODE: '305901',
      MAPS_URL: 'https://maps.app.goo.gl/7LgvjMtZ2vYo3rvF8',
      COORDINATES: {
        LATITUDE: 26.1010065,
        LONGITUDE: 74.3155576
      }
    }
  },

  ROLES: {
    OWNER: 'OWNER',
    MANAGER: 'MANAGER',
    TAILOR: 'TAILOR',
    DELIVERY: 'DELIVERY',
    CUSTOMER: 'CUSTOMER'
  },

  DEPARTMENTS: {
    STORE: 'STORE',
    TAILORING: 'TAILORING',
    DELIVERY: 'DELIVERY',
    OPERATIONS: 'OPERATIONS',
    ACCOUNTS: 'ACCOUNTS'
  },

  EMPLOYEE_STATUSES: {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    REVOKED: 'REVOKED',
    INACTIVE: 'INACTIVE'
  },

  PERMISSIONS: {
    ORDERS_VIEW: 'orders.view',
    ORDERS_CREATE: 'orders.create',
    ORDERS_EDIT: 'orders.edit',
    ORDERS_CANCEL: 'orders.cancel',
    ORDERS_ASSIGN: 'orders.assign',
    PRODUCTS_VIEW: 'products.view',
    PRODUCTS_CREATE: 'products.create',
    PRODUCTS_EDIT: 'products.edit',
    PRODUCTS_DELETE: 'products.delete',
    INVENTORY_VIEW: 'inventory.view',
    INVENTORY_ADJUST: 'inventory.adjust',
    POS_ACCESS: 'pos.access',
    POS_BILL: 'pos.bill',
    TAILORING_VIEW: 'tailoring.view',
    TAILORING_ASSIGN: 'tailoring.assign',
    TAILORING_UPDATE_STATUS: 'tailoring.update_status',
    TAILORING_QC: 'tailoring.qc',
    TAILORING_EMPLOYEE_AUTHORIZE: 'tailoring.employee.authorize',
    DELIVERY_VIEW: 'delivery.view',
    DELIVERY_ASSIGN: 'delivery.assign',
    DELIVERY_UPDATE_STATUS: 'delivery.update_status',
    DELIVERY_REPORT_ISSUE: 'delivery.report_issue',
    DELIVERY_EMPLOYEE_CREATE: 'delivery.create_employee',
    DELIVERY_EMPLOYEE_AUTHORIZE: 'delivery.employee.authorize',
    DELIVERY_EMPLOYEE_SUSPEND: 'delivery.suspend_employee',
    EMPLOYEES_VIEW: 'employees.view',
    EMPLOYEES_CREATE: 'employees.create',
    EMPLOYEES_EDIT: 'employees.edit',
    EMPLOYEES_AUTHORIZE: 'employees.authorize',
    EMPLOYEES_SUSPEND: 'employees.suspend',
    EMPLOYEES_REVOKE: 'employees.revoke',
    MANAGERS_VIEW: 'managers.view',
    MANAGERS_CREATE: 'managers.create',
    MANAGERS_EDIT: 'managers.edit',
    MANAGERS_PERMISSIONS: 'managers.manage_permissions',
    MANAGERS_SUSPEND: 'managers.suspend',
    REPORTS_VIEW: 'reports.view',
    REPORTS_EXPORT: 'reports.export',
    PAYMENTS_VIEW: 'payments.view',
    REFUNDS_CREATE: 'refunds.create',
    REVIEWS_VIEW: 'reviews.view',
    REVIEWS_MODERATE: 'reviews.moderate',
    SETTINGS_VIEW: 'settings.view',
    SETTINGS_EDIT: 'settings.edit',
    AUDIT_VIEW: 'audit.view'
  },

  INVENTORY_TYPES: {
    UNIQUE_1OF1: 'UNIQUE_1OF1',
    QUANTITY: 'QUANTITY'
  },

  ORDER_CHANNELS: {
    ONLINE: 'ONLINE',
    OFFLINE_POS: 'OFFLINE_POS'
  },

  ORDER_TYPES: {
    UNSTITCHED: 'UNSTITCHED',
    STITCHED: 'STITCHED'
  },

  ORDER_STATUSES: {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
    IN_CUTTING: 'IN_CUTTING',
    IN_STITCHING: 'IN_STITCHING',
    STITCHING_COMPLETED: 'STITCHING_COMPLETED',
    READY_FOR_DISPATCH: 'READY_FOR_DISPATCH',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
  },

  STITCHING_STATUSES: {
    QUEUED: 'QUEUED',
    IN_CUTTING: 'IN_CUTTING',
    IN_STITCHING: 'IN_STITCHING',
    FINISHING: 'FINISHING',
    COMPLETED: 'COMPLETED'
  },

  DELIVERY_TYPES: {
    LOCAL_HOME_DELIVERY: 'LOCAL_HOME_DELIVERY',
    PAN_INDIA_COURIER: 'PAN_INDIA_COURIER',
    STORE_PICKUP: 'STORE_PICKUP'
  },

  DELIVERY_STATUSES: {
    PENDING: 'PENDING',
    ASSIGNED: 'ASSIGNED',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    FAILED: 'FAILED'
  },

  PAYMENT_METHODS: {
    RAZORPAY: 'RAZORPAY',
    CASH: 'CASH',
    STORE_UPI: 'STORE_UPI',
    STORE_CARD: 'STORE_CARD'
  },

  PAYMENT_STATUSES: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED'
  },

  TRANSACTION_TYPES: {
    ONLINE_SALE: 'ONLINE_SALE',
    OFFLINE_POS_SALE: 'OFFLINE_POS_SALE',
    RESTOCK: 'RESTOCK',
    ADJUSTMENT: 'ADJUSTMENT',
    RETURN: 'RETURN'
  },

  INTEGRATION_STATUS: {
    CONNECTED: 'Connected',
    READY_TO_CONNECT: 'Ready to Connect',
    NOT_CONFIGURED: 'Not Configured'
  },

  CUSTOMIZATION_OPTIONS: {
    NECK_DESIGNS: [
      { id: 'round', label: 'Classic Round Neck', description: 'Timeless rounded neckline suited for casual and formal wear' },
      { id: 'v_neck', label: 'Elegant V-Neck', description: 'Elongating neckline with graceful finish' },
      { id: 'boat_neck', label: 'Boat Neck', description: 'Wide, modest neckline extending collarbone to collarbone' },
      { id: 'mandarin_collar', label: 'Mandarin / Chinese Collar', description: 'Sophisticated stand-up collar with delicate slit' },
      { id: 'sweetheart', label: 'Sweetheart Neckline', description: 'Flattering heart-shaped feminine cut' },
      { id: 'square', label: 'Square Cut Neck', description: 'Crisp geometric neckline highlighting jewellery' },
      { id: 'custom', label: 'Custom Neck Design', description: 'Specify in notes or upload reference photo' }
    ],
    SLEEVE_STYLES: [
      { id: 'sleeveless', label: 'Sleeveless', description: 'Modern clean armhole piping' },
      { id: 'cap', label: 'Cap Sleeves', description: 'Short sleeves covering just the shoulder cap' },
      { id: 'short', label: 'Short Sleeves (6-7 inches)', description: 'Standard traditional sleeve length' },
      { id: 'three_quarter', label: '3/4th Sleeves (16-17 inches)', description: 'Most popular versatile sleeve cut' },
      { id: 'full', label: 'Full Sleeves (21-22 inches)', description: 'Elegant wrist-length sleeves' },
      { id: 'custom', label: 'Custom Sleeve Style', description: 'Bell sleeves, puff, or slit design via notes/image' }
    ],
    BOTTOM_STYLES: [
      { id: 'salwar', label: 'Traditional Salwar', description: 'Pleated comfortable bottom with ankle cuffs' },
      { id: 'churidar', label: 'Gathered Churidar', description: 'Fitted look with elegant rings (churis) at the ankles' },
      { id: 'pant_trouser', label: 'Straight Pants / Cigarette Pants', description: 'Contemporary sleek straight-cut trousers' },
      { id: 'palazzo', label: 'Wide-Leg Palazzo', description: 'Flowy, airy silhouette with relaxed drape' },
      { id: 'sharara', label: 'Flared Sharara / Gharara', description: 'Flared tiered party wear silhouette' },
      { id: 'custom', label: 'Custom Bottom Style', description: 'Specify custom preferences or share photo' }
    ],
    KURTA_DESIGNS: [
      { id: 'straight', label: 'Straight Cut Kurta', description: 'Classic straight side-slit silhouette' },
      { id: 'a_line', label: 'A-Line Kurta', description: 'Flaring gently from waist to hemline' },
      { id: 'anarkali', label: 'Flared Anarkali Kurta', description: 'Regal kalidar flare with graceful swirl' },
      { id: 'angrakha', label: 'Angrakha Wrap Style', description: 'Overlapping asymmetric bodice with tassel ties' },
      { id: 'high_low', label: 'High-Low Hem Kurta', description: 'Contemporary front-short back-long hem' },
      { id: 'custom', label: 'Custom Kurta Design', description: 'Custom pattern discussed via call/notes' }
    ]
  }
};
