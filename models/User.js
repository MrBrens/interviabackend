const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'phone_number'
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  // Adding CV Analysis fields
  cvSkills: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cv_skills'
  },
  cvExperience: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cv_experience'
  },
  cvEducation: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cv_education'
  },
  cvSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cv_summary'
  }
}, {
  tableName: 'Users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        console.log('🔐 Password hashed during creation:', user.password);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        console.log('🔐 Password hashed during update:', user.password);
      }
    }
  }
});

// Instance method to validate password
User.prototype.validatePassword = async function(password) {
  try {
    console.log('\n🔍 Password Validation Debug:');
    console.log('1. Input password:', password);
    console.log('2. Stored hash:', this.password);
    const isValid = await bcrypt.compare(password, this.password);
    console.log('3. Password validation result:', isValid);
    return isValid;
  } catch (error) {
    console.error('❌ Error validating password:', error);
    return false;
  }
};

module.exports = User;
