const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

exports.authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Authorization header missing' });

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid authorization format' });

  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * roleCheck('manager') => allows manager and admin
 * roleCheck('admin') => only admin
 */
exports.roleCheck = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (role === 'manager') {
    if (req.user.role === 'manager' || req.user.role === 'admin') return next();
    return res.status(403).json({ message: 'Requires manager or admin role' });
  }
  if (role === 'admin') {
    if (req.user.role === 'admin') return next();
    return res.status(403).json({ message: 'Requires admin role' });
  }
  next();
};
