/**
 * ABHA Authentication & RBAC Middlewares
 * Master Specification Aligned: Strict role-based enforcement
 */

const jwt = require('jsonwebtoken');
const { ROLES } = require('../config/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'abha_secure_jwt_secret_default_2026';

function verifyToken(req, res, next) {
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
    // Ignore invalid tokens for optional auth
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

    // OWNER has universal access
    if (req.user.role === ROLES.OWNER || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Forbidden: role '${req.user.role}' lacks permission for this resource`
    });
  };
}

module.exports = {
  verifyToken,
  optionalAuth,
  requireRole,
  JWT_SECRET
};
