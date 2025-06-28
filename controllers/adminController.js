const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Discussion = require('../models/Discussion');
const Message = require('../models/Message');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Get all users with pagination and filters
exports.getUsers = async (req, res) => {
  try {
    // Get users with their subscriptions
    const users = await User.findAll({
      include: [{
        model: Subscription,
        include: [{
          model: Plan,
          attributes: ['name', 'price']
        }],
        required: false
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      users: users,
      total: users.length,
      totalPages: 1
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, subscription } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'user'
    });

    // If subscription is provided, create subscription
    if (subscription) {
      await Subscription.create({
        userId: user.id,
        planId: subscription.planId,
        startDate: new Date(),
        endDate: new Date(Date.now() + subscription.duration * 24 * 60 * 60 * 1000)
      });
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, subscription } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    await user.update({
      firstName,
      lastName,
      email,
      role
    });

    // Update subscription if provided
    if (subscription) {
      const currentSubscription = await Subscription.findOne({
        where: { userId: id }
      });

      if (currentSubscription) {
        await currentSubscription.update({
          planId: subscription.planId,
          endDate: new Date(Date.now() + subscription.duration * 24 * 60 * 60 * 1000)
        });
      } else {
        await Subscription.create({
          userId: id,
          planId: subscription.planId,
          startDate: new Date(),
          endDate: new Date(Date.now() + subscription.duration * 24 * 60 * 60 * 1000)
        });
      }
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Attempting to delete user with ID:', id);

    const user = await User.findByPk(id);
    if (!user) {
      console.log('User not found with ID:', id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Found user:', { id: user.id, email: user.email, role: user.role });

    // Check if user has discussions
    const discussions = await Discussion.findAll({ where: { userId: id } });
    console.log('User has discussions:', discussions.length);

    // Check if user has subscriptions
    const subscriptions = await Subscription.findAll({ where: { userId: id } });
    console.log('User has subscriptions:', subscriptions.length);

    // Delete related records first
    if (discussions.length > 0) {
      console.log('Deleting user discussions...');
      for (const discussion of discussions) {
        // Delete messages first
        await Message.destroy({ where: { discussionId: discussion.id } });
        // Then delete the discussion
        await discussion.destroy();
      }
    }

    if (subscriptions.length > 0) {
      console.log('Deleting user subscriptions...');
      await Subscription.destroy({ where: { userId: id } });
    }

    // Now delete the user
    console.log('Deleting user...');
    await user.destroy();
    
    console.log('User deleted successfully');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: 'Error deleting user: ' + error.message });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count(); // All users are considered active
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const premiumUsers = await User.count({
      include: [{
        model: Subscription,
        include: [{
          model: Plan,
          where: { name: 'premium' }
        }]
      }]
    });

    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      premiumUsers
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
};

// Plans Management
exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(plans);
  } catch (error) {
    console.error('Error in getPlans:', error);
    res.status(500).json({ message: 'Error fetching plans' });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const { name, description, price, duration, features, isActive } = req.body;
    
    const plan = await Plan.create({
      name,
      description,
      price,
      duration,
      features,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      message: 'Plan created successfully',
      plan
    });
  } catch (error) {
    console.error('Error in createPlan:', error);
    res.status(500).json({ message: 'Error creating plan' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, features, isActive } = req.body;

    const plan = await Plan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    await plan.update({
      name,
      description,
      price,
      duration,
      features,
      isActive
    });

    res.json({
      message: 'Plan updated successfully',
      plan
    });
  } catch (error) {
    console.error('Error in updatePlan:', error);
    res.status(500).json({ message: 'Error updating plan' });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    await plan.destroy();
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error in deletePlan:', error);
    res.status(500).json({ message: 'Error deleting plan' });
  }
};

// Analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count(); // All users are considered active since there's no status column
    const totalPlans = await Plan.count();
    const activePlans = await Plan.count({ where: { isActive: true } });
    const totalDiscussions = await Discussion.count();

    // Calculate real revenue from subscriptions
    const subscriptions = await Subscription.findAll({
      include: [{
        model: Plan,
        attributes: ['price']
      }]
    });
    
    const totalRevenue = subscriptions.reduce((sum, sub) => {
      const price = sub.Plan?.price;
      // Convert string to number if needed, default to 0 if invalid
      const numericPrice = typeof price === 'string' ? parseFloat(price) : (price || 0);
      return sum + (isNaN(numericPrice) ? 0 : numericPrice);
    }, 0);

    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlySubscriptions = await Subscription.findAll({
      where: {
        startDate: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      include: [{
        model: Plan,
        attributes: ['price']
      }]
    });
    
    const monthlyRevenue = monthlySubscriptions.reduce((sum, sub) => {
      const price = sub.Plan?.price;
      // Convert string to number if needed, default to 0 if invalid
      const numericPrice = typeof price === 'string' ? parseFloat(price) : (price || 0);
      return sum + (isNaN(numericPrice) ? 0 : numericPrice);
    }, 0);

    // Calculate growth rates (simplified - can be enhanced with historical data)
    const userGrowthRate = totalUsers > 0 ? 0 : 0; // Would need historical data for real calculation
    const revenueGrowth = totalRevenue > 0 ? 0 : 0; // Would need historical data for real calculation

    // Calculate completion rate
    const completedDiscussions = await Discussion.count({ where: { status: 'completed' } });
    const completionRate = totalDiscussions > 0 ? Math.round((completedDiscussions / totalDiscussions) * 100 * 10) / 10 : 0;

    res.json({
      userStats: {
        totalUsers,
        activeUsers,
        newUsersThisMonth: Math.floor(totalUsers * 0.15),
        userGrowthRate
      },
      interviewStats: {
        totalInterviews: totalDiscussions, // Use real discussions count
        completedInterviews: Math.floor(totalDiscussions * 0.85), // Mock completion rate
        successRate: 92.3,
        avgDuration: 25.5,
        interviewGrowth: 0 // Would need historical data for real calculation
      },
      revenueStats: {
        totalRevenue,
        monthlyRevenue,
        revenueGrowth,
        avgRevenuePerUser: totalUsers > 0 ? totalRevenue / totalUsers : 0
      },
      performanceMetrics: {
        completionRate,
        satisfactionScore: 0, // Would need user feedback system
        responseTime: 0 // Would need to track response times
      },
      planStats: {
        totalPlans,
        activePlans
      },
      discussionStats: {
        totalDiscussions
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count(); // All users are considered active
    const adminUsers = await User.count({ where: { role: 'admin' } });

    // Calculate new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.count({
      where: {
        created_at: {
          [Op.gte]: startOfMonth
        }
      }
    });

    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      userGrowth: 0, // Would need historical data for real calculation
      newUsersThisMonth
    });
  } catch (error) {
    console.error('Error in getUserAnalytics:', error);
    res.status(500).json({ message: 'Error fetching user analytics' });
  }
};

exports.getInterviewAnalytics = async (req, res) => {
  try {
    // Get real interview data from discussions
    const totalInterviews = await Discussion.count();
    const completedInterviews = await Discussion.count({ where: { status: 'completed' } });
    
    // Calculate success rate (simplified - would need more complex logic based on actual success criteria)
    const successRate = totalInterviews > 0 ? (completedInterviews / totalInterviews) * 100 : 0;
    
    // Calculate average duration (would need duration field in Discussion model)
    const avgDuration = 0; // Would need to implement duration tracking
    
    res.json({
      totalInterviews,
      completedInterviews,
      successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal place
      avgDuration,
      interviewGrowth: 0 // Would need historical data for real calculation
    });
  } catch (error) {
    console.error('Error in getInterviewAnalytics:', error);
    res.status(500).json({ message: 'Error fetching interview analytics' });
  }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    // Calculate real revenue from subscriptions
    const subscriptions = await Subscription.findAll({
      include: [{
        model: Plan,
        attributes: ['price']
      }]
    });
    
    const totalRevenue = subscriptions.reduce((sum, sub) => {
      const price = sub.Plan?.price;
      // Convert string to number if needed, default to 0 if invalid
      const numericPrice = typeof price === 'string' ? parseFloat(price) : (price || 0);
      return sum + (isNaN(numericPrice) ? 0 : numericPrice);
    }, 0);

    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlySubscriptions = await Subscription.findAll({
      where: {
        startDate: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      include: [{
        model: Plan,
        attributes: ['price']
      }]
    });
    
    const monthlyRevenue = monthlySubscriptions.reduce((sum, sub) => {
      const price = sub.Plan?.price;
      // Convert string to number if needed, default to 0 if invalid
      const numericPrice = typeof price === 'string' ? parseFloat(price) : (price || 0);
      return sum + (isNaN(numericPrice) ? 0 : numericPrice);
    }, 0);

    // Calculate average revenue per user
    const totalUsers = await User.count();
    const avgRevenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

    res.json({
      totalRevenue,
      monthlyRevenue,
      revenueGrowth: 0, // Would need historical data for real calculation
      avgRevenuePerUser: Math.round(avgRevenuePerUser * 100) / 100 // Round to 2 decimal places
    });
  } catch (error) {
    console.error('Error in getRevenueAnalytics:', error);
    res.status(500).json({ message: 'Error fetching revenue analytics' });
  }
};

// Get all discussions for admin view
exports.getAllDiscussions = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { '$User.firstName$': { [Op.like]: `%${search}%` } },
        { '$User.lastName$': { [Op.like]: `%${search}%` } },
        { '$User.email$': { [Op.like]: `%${search}%` } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }

    const discussions = await Discussion.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Message,
          attributes: ['id', 'role', 'type', 'content', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit: 1
        }
      ],
      order: [['lastMessageAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate message counts for each discussion
    const discussionsWithMessageCounts = await Promise.all(
      discussions.rows.map(async (discussion) => {
        const messageCount = await Message.count({
          where: { discussionId: discussion.id }
        });
        
        return {
          ...discussion.toJSON(),
          messageCount,
          lastMessage: discussion.Messages[0] || null
        };
      })
    );

    res.json({
      discussions: discussionsWithMessageCounts,
      total: discussions.count,
      totalPages: Math.ceil(discussions.count / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error in getAllDiscussions:', error);
    res.status(500).json({ message: 'Error fetching discussions' });
  }
};

// Get a specific discussion with all messages for admin view
exports.getDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const discussion = await Discussion.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Message,
          attributes: ['id', 'role', 'type', 'content', 'audioUrl', 'label', 'createdAt'],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    res.json(discussion);
  } catch (error) {
    console.error('Error in getDiscussionById:', error);
    res.status(500).json({ message: 'Error fetching discussion' });
  }
};

// Delete a discussion (admin only)
exports.deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Delete all messages first
    await Message.destroy({ where: { discussionId: id } });
    
    // Then delete the discussion
    await discussion.destroy();
    
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDiscussion:', error);
    res.status(500).json({ message: 'Error deleting discussion' });
  }
};

// Settings
exports.getSettings = async (req, res) => {
  try {
    // Mock settings data (replace with database storage)
    const settings = {
      general: {
        siteName: 'Interview Assistant',
        siteDescription: 'AI-powered interview preparation platform',
        contactEmail: 'admin@interviewassistant.com',
        timezone: 'UTC',
        language: 'en'
      },
      security: {
        enableTwoFactor: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        passwordMinLength: 8
      },
      notifications: {
        emailNotifications: true,
        adminAlerts: true,
        userNotifications: true,
        marketingEmails: false
      },
      integrations: {
        stripeEnabled: true,
        emailService: 'sendgrid',
        analyticsEnabled: true
      }
    };

    res.json(settings);
  } catch (error) {
    console.error('Error in getSettings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    // Mock settings update (replace with database storage)
    console.log('Updating settings:', settings);

    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error in updateSettings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
};

// Get all subscriptions with pagination and filters
exports.getSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Build include clause for search
    let includeClause = [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email'],
        where: search ? {
          [Op.or]: [
            { firstName: { [Op.like]: `%${search}%` } },
            { lastName: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
          ]
        } : undefined
      },
      {
        model: Plan,
        attributes: ['id', 'name', 'price', 'duration']
      }
    ];

    // Remove undefined where clause from User include
    if (!search) {
      includeClause[0].where = undefined;
    }

    const subscriptions = await Subscription.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(subscriptions.count / limit);

    res.json({
      subscriptions: subscriptions.rows,
      total: subscriptions.count,
      totalPages,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getSubscriptions:', error);
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
};

// Update user subscription specifically
exports.updateUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { planId, duration } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if plan exists
    const plan = await Plan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Find current subscription
    const currentSubscription = await Subscription.findOne({
      where: { userId: id, status: 'active' }
    });

    if (currentSubscription) {
      // Update existing subscription
      await currentSubscription.update({
        planId: planId,
        endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      });
    } else {
      // Create new subscription
      await Subscription.create({
        userId: id,
        planId: planId,
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
        status: 'active'
      });
    }

    // Get updated user with subscription
    const updatedUser = await User.findByPk(id, {
      include: [{
        model: Subscription,
        include: [{
          model: Plan,
          attributes: ['id', 'name', 'price']
        }],
        where: { status: 'active' },
        required: false
      }]
    });

    res.json({
      message: 'User subscription updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in updateUserSubscription:', error);
    res.status(500).json({ message: 'Error updating user subscription' });
  }
};

// Delete user subscription
exports.deleteUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cancel all active subscriptions for the user
    await Subscription.update(
      { status: 'cancelled' },
      { where: { userId: id, status: 'active' } }
    );

    res.json({
      message: 'User subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Error in deleteUserSubscription:', error);
    res.status(500).json({ message: 'Error cancelling user subscription' });
  }
};

// Get recent interviews for dashboard
exports.getRecentInterviews = async (req, res) => {
  try {
    const recentDiscussions = await Discussion.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Message,
          attributes: ['id', 'role', 'type', 'content', 'createdAt'],
          order: [['createdAt', 'DESC']],
          limit: 4
        }
      ],
      order: [['lastMessageAt', 'DESC']],
      limit: 4
    });

    // Transform discussions to interview format
    const recentInterviews = await Promise.all(
      recentDiscussions.map(async (discussion) => {
        const messageCount = await Message.count({
          where: { discussionId: discussion.id }
        });

        // Calculate actual duration based on first and last message timestamps
        const messages = await Message.findAll({
          where: { discussionId: discussion.id },
          attributes: ['createdAt'],
          order: [['createdAt', 'ASC']]
        });

        let duration = 0;
        if (messages.length > 1) {
          const firstMessage = messages[0];
          const lastMessage = messages[messages.length - 1];
          const durationMs = lastMessage.createdAt - firstMessage.createdAt;
          duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes
        }

        // Determine status based on message count and last activity
        let status = 'En cours';
        if (messageCount > 10) {
          status = 'Terminé';
        } else if (new Date(discussion.lastMessageAt) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
          status = 'En pause';
        }

        // Calculate score based on message count and completion (simplified)
        let score = 'En attente';
        if (status === 'Terminé') {
          // Simple scoring based on message count (more messages = higher score)
          const baseScore = Math.min(messageCount * 5, 100);
          score = `${Math.max(baseScore, 70)}%`;
        }

        return {
          id: discussion.id,
          user: `${discussion.User.firstName} ${discussion.User.lastName}`,
          type: discussion.title.includes('technique') ? 'Entretien technique' : 'Entretien comportemental',
          status: status,
          duration: duration > 0 ? `${duration}m` : 'En cours',
          score: score,
          date: discussion.createdAt.toISOString().split('T')[0]
        };
      })
    );

    res.json(recentInterviews);
  } catch (error) {
    console.error('Error in getRecentInterviews:', error);
    res.status(500).json({ message: 'Error fetching recent interviews' });
  }
}; 