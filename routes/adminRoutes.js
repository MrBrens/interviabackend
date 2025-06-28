const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Custom auth middleware that matches the main server pattern
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('No authorization header');
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('No token found in header');
      return res.status(401).json({ message: 'Token manquant' });
    }

    console.log('Decoding token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    if (!decoded.id) {
      console.log('No user ID in token');
      return res.status(401).json({ message: 'Token invalide' });
    }

    // Get the full user object
    const user = await User.findByPk(decoded.id);
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    req.user = user;
    req.userId = decoded.id;
    console.log('User set in request:', { id: user.id, email: user.email, role: user.role });
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  console.log('Admin middleware - User:', req.user);
  if (!req.user) {
    console.log('No user found in request');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    console.log('User is not an admin:', req.user.role);
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  
  console.log('Admin access granted');
  next();
};

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// Temporary route to make user admin (remove in production)
router.post('/make-admin', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      await user.update({ role: 'admin' });
      res.json({ message: 'User made admin successfully', user: { id: user.id, email: user.email, role: user.role } });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error making user admin:', error);
    res.status(500).json({ message: 'Error making user admin' });
  }
});

// Apply admin middleware to protected routes
router.use(adminMiddleware);

// User management routes
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/users/stats', adminController.getUserStats);

// User subscription management routes
router.put('/users/:id/subscription', adminController.updateUserSubscription);
router.delete('/users/:id/subscription', adminController.deleteUserSubscription);

// Plans management routes
router.get('/plans', adminController.getPlans);
router.post('/plans', adminController.createPlan);
router.put('/plans/:id', adminController.updatePlan);
router.delete('/plans/:id', adminController.deletePlan);

// Subscriptions management routes
router.get('/subscriptions', adminController.getSubscriptions);

// Analytics routes
router.get('/analytics/dashboard', adminController.getDashboardStats);
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/interviews', adminController.getInterviewAnalytics);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/recent-interviews', adminController.getRecentInterviews);

// Discussion/Interview management routes
router.get('/discussions', adminController.getAllDiscussions);
router.get('/discussions/:id', adminController.getDiscussionById);
router.delete('/discussions/:id', adminController.deleteDiscussion);

// Settings routes
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router; 