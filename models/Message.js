const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Discussion = require('./Discussion')

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  discussionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Discussion,
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'ai'),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'vocal'),
    allowNull: false,
    defaultValue: 'text'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  audioUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  label: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
})

// Define the relationship
Message.belongsTo(Discussion, { foreignKey: 'discussionId' })
Discussion.hasMany(Message, { foreignKey: 'discussionId' })

module.exports = Message 