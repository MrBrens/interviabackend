const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
exports.authMiddleware = async (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers); // Debug log
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header found'); // Debug log
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found in authorization header'); // Debug log
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Verifying token:', token); // Debug log
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log

    const user = await User.findByPk(decoded.id);
    if (!user) {
      console.log('User not found for ID:', decoded.id); // Debug log
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('User found:', { id: user.id, email: user.email, role: user.role }); // Debug log
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin middleware
exports.adminMiddleware = (req, res, next) => {
  console.log('Admin middleware - User:', req.user); // Debug log
  if (!req.user) {
    console.log('No user found in request'); // Debug log
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    console.log('User is not an admin:', req.user.role); // Debug log
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  
  console.log('Admin access granted'); // Debug log
  next();
}; 