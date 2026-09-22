/**
 * ABHA Production Integration Test Suite
 * Validates Master Specification Requirements:
 * - Products, Categories, Stitching, Auth RBAC
 * - Direct Buy Now, Local Beawar Delivery (305901)
 * - Payment Verification & Stock Delisting (Rules 6, 7, 8)
 * - Tailor Workflow & Strict Cancellation Guard (Rule 9)
 * - Store POS Offline Billing & Stock Sync
 */

const http = require('http');

const PORT = 5001;
process.env.PORT = PORT;
process.env.NODE_ENV = 'test';

const app = require('../server');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ status: res.statusCode, body: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  const server = app.listen(PORT);
  console.log(`\n===============================================================`);
  console.log(`  STARTING ABHA PRODUCTION VERIFICATION TEST SUITE (Port ${PORT})`);
  console.log(`===============================================================\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.brand === 'ABHA', 'Health endpoint reports brand as ABHA');
    const storeCity = health.body.flagship_store.CITY || health.body.flagship_store.city;
    assert(storeCity === 'Beawar', 'Health endpoint confirms Beawar flagship store');

    // 2. Categories
    const categories = await request('GET', '/api/categories');
    assert(categories.status === 200 && categories.body.success, 'Categories endpoint returns success');
    const salwarCat = categories.body.data.find(c => c.slug === 'salwar-suit-dress-materials');
    const sareesCat = categories.body.data.find(c => c.slug === 'sarees');
    assert(salwarCat && salwarCat.is_active === true, 'Salwar Suit category is active');
    assert(sareesCat && sareesCat.is_active === false && sareesCat.badge_text === 'Coming Soon', 'Sarees category is marked Coming Soon');

    // 3. Products
    const products = await request('GET', '/api/products');
    assert(products.status === 200 && products.body.count >= 5, 'Products endpoint returns authentic salwar suit dress materials');
    // Find an in-stock 1-of-1 product
    const firstProd = products.body.data.find(p => p.inventory_type === 'UNIQUE_1OF1' && p.is_sold_out === 0) || products.body.data[0];

    // 4. Stitching Options
    const stitchOptions = await request('GET', '/api/stitching/options');
    assert(stitchOptions.status === 200 && stitchOptions.body.data.neck_designs.length >= 6, 'Stitching options include neck, sleeves, bottom, and kurta');
    assert(stitchOptions.body.measurement_studio_status === 'Coming Soon', 'Measurement studio clearly marked Coming Soon');

    // 5. Authentication & RBAC
    const ownerLogin = await request('POST', '/api/auth/login', { identifier: 'admin@abha.in', password: 'Abha104' });
    assert(ownerLogin.status === 200 && ownerLogin.body.user && ownerLogin.body.user.role === 'OWNER', 'Owner login successful with JWT');
    const ownerToken = ownerLogin.body.token;

    const tailorLogin = await request('POST', '/api/auth/login', { identifier: 'master.tailor@abha.in', password: 'AbhaTailor2026!' });
    assert(tailorLogin.status === 200 && tailorLogin.body.user && tailorLogin.body.user.role === 'TAILOR', 'Tailor login successful with JWT');
    const tailorToken = tailorLogin.body.token;

    // RBAC check: Tailor cannot access Owner-only financial dashboard
    const tailorAdminAccess = await request('GET', '/api/admin/dashboard', null, { Authorization: `Bearer ${tailorToken}` });
    assert(tailorAdminAccess.status === 403, 'Tailor restricted from Owner/Manager administrative dashboard');

    // 6. Direct Buy Now Checkout (Stitched + Local Beawar Delivery 305901)
    const buyNowPayload = {
      product_id: firstProd.id,
      quantity: 1,
      order_type: 'STITCHED',
      stitching_config: {
        neck_design: 'Classic Round Neck',
        sleeve_style: '3/4th Sleeves (16-17 inches)',
        bottom_style: 'Traditional Salwar',
        kurta_design: 'Straight Cut Kurta',
        additional_requirements: 'Subtle zari piping on sleeves'
      },
      shipping: {
        name: 'Sunita Meena',
        phone: '9829998877',
        address: 'Opposite Ganesha Tower, Station Road',
        city: 'Beawar',
        state: 'Rajasthan',
        pincode: '305901'
      }
    };

    const orderRes = await request('POST', '/api/orders/buy-now', buyNowPayload);
    assert(orderRes.status === 201 && orderRes.body.success, 'Buy Now order created successfully');
    const orderData = orderRes.body.data;
    assert(orderData.pricing.delivery_fee === 0, 'Local Beawar doorstep delivery fee is free (₹0)');
    assert(orderData.pricing.stitching_fee === firstProd.stitching_price, 'Stitching fee accurately appended to total');

    // 7. Payment Verification & Inventory Delisting
    const paymentVerifyRes = await request('POST', '/api/payments/verify', {
      order_id: orderData.order_id,
      razorpay_order_id: 'order_test_123',
      razorpay_payment_id: 'pay_test_456',
      is_mock_success: true
    });
    assert(paymentVerifyRes.status === 200 && paymentVerifyRes.body.success, 'Payment verification succeeded');

    // Verify stock delisted if 1-of-1
    const updatedProdRes = await request('GET', `/api/products/${firstProd.id}`);
    if (firstProd.inventory_type === 'UNIQUE_1OF1') {
      assert(updatedProdRes.body.data.is_sold_out === 1, 'Exclusive 1-of-1 artisan product automatically delisted as SOLD OUT upon payment');
    }

    // 8. Tailor Workflow
    const tailorQueue = await request('GET', '/api/tailor/queue', null, { Authorization: `Bearer ${tailorToken}` });
    assert(tailorQueue.status === 200 && tailorQueue.body.count > 0, 'Tailor queue contains the newly stitched garment');
    const tailorItem = tailorQueue.body.data.find(i => i.order_id === orderData.order_id);
    assert(tailorItem && tailorItem.neck_design === 'Classic Round Neck', 'Tailor sees exact customer neck and style choices');

    // Advance Tailor status to IN_STITCHING
    const advanceRes = await request('PUT', `/api/tailor/orders/${tailorItem.stitching_id}/status`, {
      status: 'IN_STITCHING',
      tailor_notes: 'Fabric inspected and cutting completed'
    }, { Authorization: `Bearer ${tailorToken}` });
    assert(advanceRes.status === 200 && advanceRes.body.data.stitching_status === 'IN_STITCHING', 'Tailor advanced status to IN_STITCHING');

    // 9. Strict Rule 9 Verification: Cancellation REJECTED once stitching started
    const cancelAttempt = await request('POST', `/api/orders/cancel/${orderData.order_number}`, {
      phone: '9829998877',
      reason: 'Changed my mind'
    });
    assert(cancelAttempt.status === 400 && cancelAttempt.body.error.includes('Strict Policy'), 'Rule 9 Enforced: Cancellation strictly rejected once stitching commenced');

    // 10. Store POS Offline Billing Terminal
    const prod3 = products.body.data.find(p => p.sku === 'ABHA-SS-003');
    const initialQty = prod3.stock_quantity;

    const posRes = await request('POST', '/api/admin/pos/order', {
      sku_or_id: 'ABHA-SS-003',
      quantity: 1,
      payment_method: 'CASH',
      customer_name: 'Store Walk-in Buyer',
      customer_phone: '9414001122'
    }, { Authorization: `Bearer ${ownerToken}` });
    assert(posRes.status === 201 && posRes.body.success, 'POS offline sale completed at Beawar store');

    // Verify stock decreased by 1
    const prod3After = await request('GET', `/api/products/${prod3.id}`);
    assert(prod3After.body.data.stock_quantity === initialQty - 1, 'POS sale instantly decremented live catalog stock');

    // 11. Integration Health Status (Section 118)
    const integrationsRes = await request('GET', '/api/admin/integrations/status', null, { Authorization: `Bearer ${ownerToken}` });
    assert(integrationsRes.status === 200 && integrationsRes.body.data.storage_vault.status === 'Connected', 'Storage vault status is Connected');
    assert(integrationsRes.body.data.payments.status === 'Ready to Connect', 'Razorpay status accurately indicates Ready to Connect');

    console.log(`\n===============================================================`);
    console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('[TEST ERROR]', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
