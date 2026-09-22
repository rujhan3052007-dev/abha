/**
 * ABHA Authentication & Granular RBAC Middlewares
 * Master Specification Aligned: Owner Primacy, Granular Permissions, and Active Employee Enforcement
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getDb } = require('../config/database');
const { ROLES } = require('../config/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'abha_secure_jwt_secret_default_2026';

async function verifyToken(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.abha_token) {
      token = req.cookies.abha_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Check database status for non-owner staff
    if (req.user && req.user.role !== ROLES.OWNER) {
      const db = getDb();
      // Check user record
      const user = await db.get('SELECT id, is_active FROM users WHERE id = ?', [req.user.id]);
      if (!user || user.is_active === 0) {
        return res.status(403).json({
          success: false,
          error: 'Account has been deactivated. Access denied.'
        });
      }

      // Check employee record
      const employee = await db.get('SELECT * FROM employees WHERE user_id = ?', [req.user.id]);
      if (employee) {
        req.user.employeeId = employee.id;
        req.user.department = employee.department_code;
        req.user.employeeStatus = employee.status;

        if (employee.status === 'SUSPENDED') {
          return res.status(403).json({
            success: false,
            error: 'Your employee account is suspended. Contact ABHA Owner.'
          });
        }
        if (employee.status === 'REVOKED' || employee.status === 'INACTIVE') {
          return res.status(403).json({
            success: false,
            error: 'Employee access has been revoked.'
          });
        }
        if (employee.status === 'PENDING') {
          return res.status(403).json({
            success: false,
            error: 'Employee authorization is pending approval.'
          });
        }

        // Attach permissions
        let perms = [];
        if (employee.permissions_override_json) {
          try {
            perms = JSON.parse(employee.permissions_override_json);
          } catch {}
        }
        if (!perms || perms.length === 0) {
          // Fetch from role_permissions
          const roleRows = await db.all(
            'SELECT permission_code FROM role_permissions WHERE role_code = ?',
            [employee.role_code]
          );
          perms = roleRows.map(r => r.permission_code);
        }
        req.user.permissions = perms || [];
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token'
    });
  }
}

function optionalAuth(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.abha_token) {
      token = req.cookies.abha_token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch (err) {
    req.user = null;
  }
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // OWNER always has universal access
    if (req.user.role === ROLES.OWNER || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Forbidden: role '${req.user.role}' lacks permission for this resource`
    });
  };
}

function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // OWNER has absolute override
    if (req.user.role === ROLES.OWNER) {
      return next();
    }

    const userPerms = req.user.permissions || [];
    // User must satisfy at least one of the alternatives, or wildcard
    const hasPerm = requiredPermissions.some(p => userPerms.includes(p) || userPerms.includes('*'));

    if (hasPerm) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Forbidden: Lacks required permission '${requiredPermissions.join(' or ')}'`
    });
  };
}

async function logAudit(req, actionOrObj, entityType, entityId, details) {
  try {
    const db = getDb();
    const id = `aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    let action, entity_type, entity_id, previousValue = null, newValue = null, det = null;
    let ip = null, userId = null, actorName = 'System', actorRole = 'SYSTEM';

    if (typeof actionOrObj === 'object' && actionOrObj !== null) {
      action = actionOrObj.action;
      entity_type = actionOrObj.entityType;
      entity_id = actionOrObj.entityId;
      previousValue = actionOrObj.previousValue || null;
      newValue = actionOrObj.newValue || null;
      det = actionOrObj.details || null;
    } else {
      action = actionOrObj;
      entity_type = entityType;
      entity_id = entityId;
      det = details;
    }

    if (req && typeof req === 'object' && req.headers) {
      ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
      userId = req.user?.id || null;
      actorName = req.user?.name || req.user?.role || 'Staff';
      actorRole = req.user?.role || 'STAFF';
    } else if (typeof req === 'string') {
      userId = req;
    }

    await db.run(`
      INSERT INTO admin_audit_logs (
        id, user_id, actor_name, actor_role, action, entity_type, entity_id,
        previous_value, new_value, details_json, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      userId,
      actorName,
      actorRole,
      action,
      entity_type,
      entity_id,
      typeof previousValue === 'object' && previousValue !== null ? JSON.stringify(previousValue) : (previousValue ? String(previousValue) : null),
      typeof newValue === 'object' && newValue !== null ? JSON.stringify(newValue) : (newValue ? String(newValue) : null),
      typeof det === 'object' && det !== null ? JSON.stringify(det) : (det ? String(det) : null),
      ip
    ]);
  } catch (err) {
    console.error('[Audit Log Error]', err);
  }
}

module.exports = {
  verifyToken,
  optionalAuth,
  requireRole,
  requirePermission,
  logAudit,
  JWT_SECRET
};
