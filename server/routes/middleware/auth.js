const UserService = require('../../services/userService.js');
const jwt = require('jsonwebtoken');

const requireUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('Authentication failed: No token provided');
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized - No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserService.get(decoded.sub);
    if (!user) {
      console.log('Authentication failed: User not found for token');
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized - User not found' 
      });
    }
    
    if (!user.isActive) {
      console.log(`Authentication failed: User ${user.email} is inactive`);
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized - User account is inactive' 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    return res.status(403).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};

const requireAdmin = async (req, res, next) => {
  // First check if user is authenticated
  await requireUser(req, res, () => {
    // Then check if user has admin role
    if (req.user.role !== 'admin') {
      console.log(`Access denied: User ${req.user.email} with role ${req.user.role} attempted to access admin endpoint`);
      return res.status(403).json({
        success: false,
        message: 'Access denied - Admin role required'
      });
    }
    next();
  });
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    // First check if user is authenticated
    await requireUser(req, res, () => {
      // Admin users have all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user has the required permission
      if (!req.user.permissions.includes(permission)) {
        console.log(`Access denied: User ${req.user.email} lacks permission: ${permission}`);
        return res.status(403).json({
          success: false,
          message: `Access denied - Permission required: ${permission}`
        });
      }
      next();
    });
  };
};

module.exports = {
  requireUser,
  requireAdmin,
  requirePermission,
};