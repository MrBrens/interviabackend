const User = require('./User');
const Discussion = require('./Discussion');
const Message = require('./Message');
const Plan = require('./Plan');
const Subscription = require('./Subscription');

// User associations
User.hasMany(Discussion, { foreignKey: 'userId' });
User.hasMany(Subscription, { foreignKey: 'userId' });

// Discussion associations
Discussion.belongsTo(User, { foreignKey: 'userId' });
Discussion.hasMany(Message, { foreignKey: 'discussionId' });

// Message associations
Message.belongsTo(Discussion, { foreignKey: 'discussionId' });

// Plan associations
Plan.hasMany(Subscription, { foreignKey: 'planId' });

// Subscription associations
Subscription.belongsTo(User, { foreignKey: 'userId' });
Subscription.belongsTo(Plan, { foreignKey: 'planId' });

module.exports = {
  User,
  Discussion,
  Message,
  Plan,
  Subscription
}; 