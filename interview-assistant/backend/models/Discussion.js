const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const User = require('./User')

const Discussion = sequelize.define('Discussion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  status: {
    type: DataTypes.ENUM('active', 'archived'),
    defaultValue: 'active'
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'last_message_at'
  },
  // CV Analysis fields with proper field mapping and type conversion
  cvSkills: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cv_skills',
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('cvSkills');
      if (!rawValue) return [];
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        console.error('Error parsing cvSkills:', e);
        return [];
      }
    },
    set(value) {
      if (!value) {
        this.setDataValue('cvSkills', '[]');
        return;
      }
      try {
        const jsonValue = JSON.stringify(value);
        this.setDataValue('cvSkills', jsonValue);
      } catch (e) {
        console.error('Error stringifying cvSkills:', e);
        this.setDataValue('cvSkills', '[]');
      }
    }
  },
  cvExperience: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cv_experience',
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('cvExperience');
      if (!rawValue) return [];
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        console.error('Error parsing cvExperience:', e);
        return [];
      }
    },
    set(value) {
      if (!value) {
        this.setDataValue('cvExperience', '[]');
        return;
      }
      try {
        const jsonValue = JSON.stringify(value);
        this.setDataValue('cvExperience', jsonValue);
      } catch (e) {
        console.error('Error stringifying cvExperience:', e);
        this.setDataValue('cvExperience', '[]');
      }
    }
  },
  cvEducation: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cv_education',
    defaultValue: '[]',
    get() {
      const rawValue = this.getDataValue('cvEducation');
      if (!rawValue) return [];
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        console.error('Error parsing cvEducation:', e);
        return [];
      }
    },
    set(value) {
      if (!value) {
        this.setDataValue('cvEducation', '[]');
        return;
      }
      try {
        const jsonValue = JSON.stringify(value);
        this.setDataValue('cvEducation', jsonValue);
      } catch (e) {
        console.error('Error stringifying cvEducation:', e);
        this.setDataValue('cvEducation', '[]');
      }
    }
  },
  cvSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cv_summary',
    defaultValue: '',
    get() {
      return this.getDataValue('cvSummary') || '';
    },
    set(value) {
      this.setDataValue('cvSummary', value || '');
    }
  }
}, {
  tableName: 'Discussions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (discussion) => {
      console.log('Before Create Hook - Discussion Data:', {
        cvSkills: discussion.cvSkills,
        cvExperience: discussion.cvExperience,
        cvEducation: discussion.cvEducation,
        cvSummary: discussion.cvSummary
      });
    },
    afterCreate: async (discussion) => {
      console.log('After Create Hook - Saved Discussion:', {
        cvSkills: discussion.cvSkills,
        cvExperience: discussion.cvExperience,
        cvEducation: discussion.cvEducation,
        cvSummary: discussion.cvSummary
      });
    }
  }
})

// Define the relationship
Discussion.belongsTo(User, { foreignKey: 'userId' })
User.hasMany(Discussion, { foreignKey: 'userId' })

module.exports = Discussion 