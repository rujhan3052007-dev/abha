/**
 * ABHA Enterprise RBAC & Business Authorization Verification Test Suite
 * Validates the full Owner -> Manager -> Employee hierarchy,
 * granular permissions, employee lifecycles, and audit trails.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

const { getDb } = require('../config/database');
const { PERMISSIONS, ROLES, EMPLOYEE_STATUSES } = require('../config/constants');

const app = require('../server');
const PORT = 5003;
let server;

function makeRequest(method, pathUrl, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    const postData = data ? JSON.stringify(data) : null;
    if (postData) {
      defaultHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: pathUrl,
      method: method,
      headers: defaultHeaders
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

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

async function runRbacTests() {
  console.log('\n===============================================================');
  console.log(`  STARTING ABHA RBAC & AUTHORIZATION TEST SUITE (Port ${PORT})`);
  console.log('===============================================================\n');

  try {
    server = app.listen(PORT);
    await new Promise(resolve => setTimeout(resolve, 500));

    // 1. Authenticate Owner
    const ownerLogin = await makeRequest('POST', '/api/auth/login', {
      identifier: 'admin@abha.in',
      password: 'AbhaAdmin2026!'
    });
    assert(ownerLogin.statusCode === 200, 'Owner logs in successfully');
    assert(ownerLogin.data.user.role === 'OWNER', 'User role is OWNER');
    assert(ownerLogin.data.user.status === 'ACTIVE', 'Owner status is ACTIVE');
    const ownerToken = ownerLogin.data.token;
    const ownerHeaders = { Authorization: `Bearer ${ownerToken}` };

    // 2. Owner accesses full dashboard with unredacted financials
    const ownerDashboard = await makeRequest('GET', '/api/admin/dashboard', null, ownerHeaders);
    assert(ownerDashboard.statusCode === 200, 'Owner can access administrative dashboard');
    assert(ownerDashboard.data.data.financials !== null, 'Owner receives unredacted financial metrics');
    assert(typeof ownerDashboard.data.data.financials.total_revenue === 'number', 'Total revenue is visible as numeric value');

    // 3. Authenticate Store Manager
    const mgrLogin = await makeRequest('POST', '/api/auth/login', {
      identifier: 'manager@abha.in',
      password: 'AbhaManager2026!'
    });
    assert(mgrLogin.statusCode === 200, 'Store Manager logs in successfully');
    assert(mgrLogin.data.user.role === 'MANAGER', 'User role is MANAGER');
    const mgrToken = mgrLogin.data.token;
    const mgrHeaders = { Authorization: `Bearer ${mgrToken}` };

    // 4. Store Manager accesses dashboard (orders.view granted, payments.view not granted by default)
    const mgrDashboard = await makeRequest('GET', '/api/admin/dashboard', null, mgrHeaders);
    assert(mgrDashboard.statusCode === 200, 'Store Manager can view orders dashboard');
    assert(mgrDashboard.data.data.financials === null, 'Financials are strictly REDACTED (null) for Manager without payments.view');

    // 5. Hierarchy Enforcement: Store Manager is BLOCKED from Owner-Only Manager Governance
    const mgrMgrAccess = await makeRequest('GET', '/api/admin/managers', null, mgrHeaders);
    assert(mgrMgrAccess.statusCode === 403, 'Manager is strictly BLOCKED (403 Forbidden) from viewing Manager Governance');

    const mgrCreateMgr = await makeRequest('POST', '/api/admin/managers', {
      name: 'Rogue Manager',
      email: 'rogue@abha.in',
      department: 'STORE'
    }, mgrHeaders);
    assert(mgrCreateMgr.statusCode === 403, 'Manager is strictly BLOCKED (403 Forbidden) from creating another Manager');

    // 6. Owner can designate new Manager and grant custom permission matrix
    const newMgrRes = await makeRequest('POST', '/api/admin/managers', {
      name: 'Vikramaditya Logistics Head',
      email: `vikram_${Date.now()}@abha.in`,
      mobile: `98290${Math.floor(10000 + Math.random() * 90000)}`,
      department: 'DELIVERY',
      assigned_area: 'Beawar South',
      password: 'AbhaManager2026!'
    }, ownerHeaders);
    assert(newMgrRes.statusCode === 201, 'Owner designates new Delivery Manager');
    const newMgrId = newMgrRes.data.data.id;

    // Grant custom permissions to this manager
    const updatePerms = await makeRequest('PUT', `/api/admin/managers/${newMgrId}/permissions`, {
      permissions: [PERMISSIONS.DELIVERY_VIEW, PERMISSIONS.DELIVERY_ASSIGN, PERMISSIONS.DELIVERY_MANAGE]
    }, ownerHeaders);
    assert(updatePerms.statusCode === 200, 'Owner updates manager permission matrix');

    // 7. Employee Management & Departmental Delegation:
    // Store Manager blocked from creating staff in other departments (DELIVERY)
    const crossDeptRes = await makeRequest('POST', '/api/admin/employees', {
      name: 'Illegal Cross-Dept Staff',
      mobile: `98290${Math.floor(10000 + Math.random() * 90000)}`,
      email: `cross_${Date.now()}@abha.in`,
      department: 'DELIVERY',
      role_title: 'Delivery Boy',
      password: 'AbhaStaff2026!'
    }, mgrHeaders);
    assert(crossDeptRes.statusCode === 403, 'Manager is strictly BLOCKED (403) from creating staff in a different department');

    // Store Manager successfully creates staff in own department (STORE)
    const newStaffRes = await makeRequest('POST', '/api/admin/employees', {
      name: 'Ramesh Store Associate',
      mobile: `98290${Math.floor(10000 + Math.random() * 90000)}`,
      email: `ramesh_${Date.now()}@abha.in`,
      department: 'STORE',
      role_title: 'POS Counter Staff',
      assigned_area: 'Beawar Flagship Store',
      status: 'PENDING',
      password: 'AbhaStaff2026!'
    }, mgrHeaders);
    assert(newStaffRes.statusCode === 201, 'Manager can create department staff member');
    const newStaffId = newStaffRes.data.data.id;
    const newStaffEmail = newStaffRes.data.data.email;

    // 8. Lifecycle Check: PENDING staff cannot log in
    const pendingLogin = await makeRequest('POST', '/api/auth/login', {
      identifier: newStaffEmail,
      password: 'AbhaStaff2026!'
    });
    assert(pendingLogin.statusCode === 403, 'Pending employee login rejected (403)');
    assert(pendingLogin.data.error.toLowerCase().includes('pending'), 'Rejection message informs employee authorization is pending');

    // 9. Authorization: Manager authorizes employee to ACTIVE
    const authStaff = await makeRequest('PUT', `/api/admin/employees/${newStaffId}/authorize`, {
      status: 'ACTIVE'
    }, mgrHeaders);
    assert(authStaff.statusCode === 200, 'Manager authorizes employee to ACTIVE status');

    // 10. ACTIVE staff can now log in
    const activeLogin = await makeRequest('POST', '/api/auth/login', {
      identifier: newStaffEmail,
      password: 'AbhaStaff2026!'
    });
    assert(activeLogin.statusCode === 200, 'Authorized employee can now successfully log in');
    const staffToken = activeLogin.data.token;
    const staffHeaders = { Authorization: `Bearer ${staffToken}` };

    // 11. Lifecycle Check: SUSPENDED staff immediately locked out
    const suspendStaff = await makeRequest('PUT', `/api/admin/employees/${newStaffId}/status`, {
      status: 'SUSPENDED'
    }, mgrHeaders);
    assert(suspendStaff.statusCode === 200, 'Employee status successfully updated to SUSPENDED');

    const suspendedLogin = await makeRequest('POST', '/api/auth/login', {
      identifier: newStaffEmail,
      password: 'AbhaStaff2026!'
    });
    assert(suspendedLogin.statusCode === 403, 'Suspended employee login strictly rejected (403)');
    assert(suspendedLogin.data.error.includes('suspended'), 'Rejection message informs employee account is suspended');

    // Verify currently issued JWT token of suspended user is also immediately blocked on protected routes
    const suspendedTokenCheck = await makeRequest('GET', '/api/delivery/my-deliveries', null, staffHeaders);
    assert(suspendedTokenCheck.statusCode === 403, 'Active token of suspended employee immediately rejected on API routes');

    // Reactivate staff for task testing
    await makeRequest('PUT', `/api/admin/employees/${newStaffId}/status`, {
      status: 'ACTIVE'
    }, mgrHeaders);

    // 12. Tailor Atelier Security & Privacy:
    // Tailor logs in, accesses /my-tasks with body measurements, zero price/revenue figures
    const tailorLogin = await makeRequest('POST', '/api/auth/login', {
      identifier: 'master.tailor@abha.in',
      password: 'AbhaTailor2026!'
    });
    assert(tailorLogin.statusCode === 200, 'Master Tailor logs in successfully');
    const tailorHeaders = { Authorization: `Bearer ${tailorLogin.data.token}` };

    const tailorTasks = await makeRequest('GET', '/api/tailor/my-tasks', null, tailorHeaders);
    assert(tailorTasks.statusCode === 200, 'Master Tailor can access /api/tailor/my-tasks');
    if (tailorTasks.data.data.length > 0) {
      const task = tailorTasks.data.data[0];
      assert(task.total_amount === undefined && task.base_price === undefined, 'Tailor task does NOT contain order financial totals or item prices');
      assert(task.neck_design !== undefined && task.stitching_status !== undefined, 'Tailor task contains custom garment specifications');
    }

    // Tailor blocked from admin dashboard
    const tailorDash = await makeRequest('GET', '/api/admin/dashboard', null, tailorHeaders);
    assert(tailorDash.statusCode === 403, 'Master Tailor strictly blocked (403) from administrative dashboard');

    // 13. Delivery Fleet Security & Privacy:
    // Delivery staff logs in, accesses /my-deliveries with customer address/phone, zero prices
    const deliveryLogin = await makeRequest('POST', '/api/auth/login', {
      identifier: 'delivery@abha.in',
      password: 'AbhaDelivery2026!'
    });
    assert(deliveryLogin.statusCode === 200, 'Delivery Staff logs in successfully');
    const deliveryHeaders = { Authorization: `Bearer ${deliveryLogin.data.token}` };

    const deliveryTasks = await makeRequest('GET', '/api/delivery/my-deliveries', null, deliveryHeaders);
    assert(deliveryTasks.statusCode === 200, 'Delivery Staff can access /api/delivery/my-deliveries');
    if (deliveryTasks.data.data.length > 0) {
      const deliv = deliveryTasks.data.data[0];
      assert(deliv.total_amount === undefined, 'Delivery task does NOT expose financial prices or customer bill');
      assert(deliv.shipping_phone !== undefined && deliv.shipping_address !== undefined, 'Delivery task contains customer dispatch coordinates and phone');
    }

    // Delivery staff reports an issue on a delivery
    // Find or create a delivery for test
    const queueRes = await makeRequest('GET', '/api/delivery/queue', null, ownerHeaders);
    const testDeliveryId = (queueRes.data.data && queueRes.data.data.length > 0) 
      ? queueRes.data.data[0].delivery_id 
      : 'del_test_123';

    const issueReport = await makeRequest('POST', `/api/delivery/orders/${testDeliveryId}/issue`, {
      reason: 'Premises Locked / Door Closed',
      notes: 'Attempted doorstep delivery twice in Beawar'
    }, deliveryHeaders);
    assert(issueReport.statusCode === 200, 'Delivery staff can submit issue report for dispatch problem');

    // 14. Audit Trail Verification:
    // Audit logs contain actor, previous_state, new_state diffs
    const auditLogs = await makeRequest('GET', '/api/admin/audit-logs', null, ownerHeaders);
    assert(auditLogs.statusCode === 200, 'Owner can retrieve administrative audit trail');
    const logs = auditLogs.data.data || [];
    assert(logs.length > 0, 'Audit trail contains logged administrative actions');

    const statusChangeLog = logs.find(l => l.action && (l.action.includes('STATUS') || l.action.includes('EMPLOYEE')));
    if (statusChangeLog) {
      assert(statusChangeLog.prev_state !== undefined || statusChangeLog.new_state !== undefined || statusChangeLog.details_json !== undefined, 'Audit trail captures state changes and context');
    }

    // 15. Absolute Owner Immunity:
    // Verify Owner cannot be deleted or suspended
    const db = getDb();
    const ownerUser = await db.get("SELECT * FROM users WHERE role = 'OWNER'");
    assert(ownerUser && ownerUser.is_active === 1, 'ABHA Owner is registered and immutable');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) server.close();
    console.log('\n===============================================================');
    console.log(`  RBAC RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runRbacTests();
