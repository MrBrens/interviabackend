const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Plan = require('./Plan');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  planId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Plan,
      key: 'id'
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled'),
    defaultValue: 'active'
  }
}, {
  tableName: 'Subscriptions',
  timestamps: true
});

// Define relationships
Subscription.belongsTo(User, { foreignKey: 'userId' });
Subscription.belongsTo(Plan, { foreignKey: 'planId' });
User.hasMany(Subscription, { foreignKey: 'userId' });
Plan.hasMany(Subscription, { foreignKey: 'planId' });

module.exports = Subscription; 